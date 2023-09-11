#include "motis/footpaths/footpaths.h"

#include <map>
#include <utility>

#include "motis/core/common/constants.h"
#include "motis/core/common/logging.h"
#include "motis/module/event_collector.h"
#include "motis/module/ini_io.h"

#include "motis/footpaths/keys.h"
#include "motis/footpaths/matching.h"
#include "motis/footpaths/platform/extract.h"
#include "motis/footpaths/storage/storage.h"
#include "motis/footpaths/transfer_requests.h"
#include "motis/footpaths/transfer_results.h"
#include "motis/footpaths/transfers_to_footpaths_preprocessing.h"
#include "motis/footpaths/types.h"

#include "motis/ppr/profiles.h"

#include "nigiri/timetable.h"
#include "nigiri/types.h"

#include "ppr/common/routing_graph.h"
#include "ppr/serialization/reader.h"

#include "utl/parallel_for.h"
#include "utl/pipes.h"
#include "utl/zip.h"

namespace fs = std::filesystem;
namespace ml = motis::logging;
namespace mm = motis::module;
namespace n = nigiri;
namespace ps = ppr::serialization;

namespace motis::footpaths {

enum class first_update { kNoUpdate, kProfiles, kTimetable, kOSM };
enum class routing_type { kNoRouting, kPartialRouting, kFullRouting };

// load already known/stored data
struct import_state {
  CISTA_COMPARABLE();
  // import nigiri state
  mm::named<cista::hash_t, MOTIS_NAME("nigiri_hash")> nigiri_hash_;

  // import osm state
  mm::named<std::string, MOTIS_NAME("osm_path")> osm_path_;

  // import ppr state
  mm::named<cista::hash_t, MOTIS_NAME("ppr_graph_hash")> ppr_graph_hash_;
  mm::named<cista::hash_t, MOTIS_NAME("ppr_profiles_hash")> ppr_profiles_hash_;
};

struct footpaths::impl {
  explicit impl(n::timetable& tt,
                std::map<std::string, ppr::profile_info> const& ppr_profiles,
                fs::path const& db_file_path, std::size_t db_max_size)
      : tt_(tt), storage_{db_file_path, db_max_size} {
    load_ppr_profiles(ppr_profiles);
    storage_.initialize(used_profiles_, ppr_profiles_);
  };

  void full_import() {
    // 1st extract all platforms from a given osm file
    get_and_save_osm_platforms();

    // 2nd update osm_id and location_idx
    match_and_save_matches();

    // 3rd build transfer requests
    build_and_save_transfer_requests();

    // 4th precompute profilebased transfers
    auto rg = get_routing_ready_ppr_graph();
    route_and_save_results(rg, storage_.get_transfer_requests_keys(
                                   data_request_type::kPartialUpdate));

    // 5th update timetable
    update_timetable(nigiri_dump_path_);
  }

  void maybe_partial_import() {
    auto const fup = get_first_update();
    auto const rt = get_routing_type(fup);

    switch (fup) {
      case first_update::kNoUpdate: break;
      case first_update::kOSM: get_and_save_osm_platforms();
      case first_update::kTimetable:
        match_and_save_matches();
        build_and_save_transfer_requests();
        break;
      case first_update::kProfiles:
        build_and_save_transfer_requests(true);
        break;
    }

    ::ppr::routing_graph rg;
    switch (rt) {
      case routing_type::kNoRouting: break;
      case routing_type::kPartialRouting:
        // do not load ppr graph if there are no routing requests
        if (storage_.has_transfer_requests_keys(
                data_request_type::kPartialUpdate)) {
          break;
        }
        rg = get_routing_ready_ppr_graph();
        route_and_save_results(rg, storage_.get_transfer_requests_keys(
                                       data_request_type::kPartialUpdate));
        break;
      case routing_type::kFullRouting:
        rg = get_routing_ready_ppr_graph();
        route_and_update_results(rg, storage_.get_transfer_requests_keys(
                                         data_request_type::kPartialOld));
        route_and_save_results(rg, storage_.get_transfer_requests_keys(
                                       data_request_type::kPartialUpdate));
        break;
    }

    // update timetable
    update_timetable(nigiri_dump_path_);
  }

  fs::path osm_path_;
  std::string ppr_rg_path_;
  fs::path nigiri_dump_path_;

  std::optional<import_state> old_import_state_;
  import_state new_import_state_;

private:
  // -- helper --
  void load_ppr_profiles(
      std::map<std::string, ppr::profile_info> const& ppr_profiles_by_name) {
    auto profile_names = std::vector<string>{};

    for (auto const& [pname, pinfo] : ppr_profiles_by_name) {
      profile_names.emplace_back(pname);
    }

    storage_.add_new_profiles(profile_names);

    for (auto& [pname, pinfo] : ppr_profiles_by_name) {
      auto pkey = storage_.profile_name_to_profile_key_.at(pname);
      used_profiles_.insert(pkey);

      // convert walk_duration from minutes to seconds
      ppr_profiles_.insert(std::pair<profile_key_t, ppr::profile_info>(
          pkey, ppr_profiles_by_name.at(pname)));
      ppr_profiles_.at(pkey).profile_.duration_limit_ = ::motis::MAX_WALK_TIME;

      // build profile_name to idx map in nigiri::tt
      tt_.profiles_.insert({pname, tt_.profiles_.size()});
    }
    assert(tt_.profiles_.size() == used_profiles_.size());
  }

  first_update get_first_update() {
    utl::verify(old_import_state_.has_value(), "no old import state given.");
    auto const old_import_state = old_import_state_.value();

    auto fup = first_update::kNoUpdate;
    if (old_import_state.ppr_profiles_hash_ !=
        new_import_state_.ppr_profiles_hash_) {
      fup = first_update::kProfiles;
    }

    if (old_import_state.nigiri_hash_ != new_import_state_.nigiri_hash_) {
      fup = first_update::kTimetable;
    }

    if (old_import_state.osm_path_ != new_import_state_.osm_path_) {
      fup = first_update::kOSM;
    }

    return fup;
  }

  routing_type get_routing_type(first_update const fup) {
    utl::verify(old_import_state_.has_value(), "no old import state given.");
    auto const old_import_state = old_import_state_.value();

    auto rt = routing_type::kNoRouting;
    // define routing type
    if (old_import_state.ppr_graph_hash_ != new_import_state_.ppr_graph_hash_) {
      rt = routing_type::kFullRouting;
    }

    if (fup != first_update::kNoUpdate && rt == routing_type::kNoRouting) {
      rt = routing_type::kPartialRouting;
    }

    return rt;
  }

  // -- osm platform/stop extraction --
  void get_and_save_osm_platforms() {
    progress_tracker_->status("Extract Platforms from OSM.");
    LOG(ml::info) << "Extracting platforms from " << osm_path_;
    auto osm_extracted_platforms = extract_platforms_from_osm_file(osm_path_);

    LOG(ml::info) << "Writing OSM Platforms to DB.";
    storage_.add_new_platforms(osm_extracted_platforms);
  }

  // -- location to osm matching --
  void match_and_save_matches() {
    progress_tracker_->status("Match Locations and OSM Platforms");
    ml::scoped_timer const timer{
        "Matching timetable locations and osm platforms."};

    auto mrs = match_locations_and_platforms(
        storage_.get_matching_data(tt_),
        {max_matching_dist_, max_bus_stop_matching_dist_});

    LOG(ml::info) << "Writing Matchings to DB.";
    storage_.add_new_matching_results(mrs);
  }

  // -- build transfer requests --
  void build_and_save_transfer_requests(bool const old_to_old = false) {
    progress_tracker_->status("Generating Transfer Requests.");
    ml::scoped_timer const timer{"Generating Transfer Requests."};

    auto treqs_k = generate_transfer_requests_keys(
        storage_.get_transfer_request_keys_generation_data(), {old_to_old});

    LOG(ml::info) << "Writing Transfer Requests (Keys) to DB.";
    storage_.add_new_transfer_requests_keys(treqs_k);
  }

  // -- build transfer results --
  ::ppr::routing_graph get_routing_ready_ppr_graph() {
    ::ppr::routing_graph result;
    progress_tracker_->status("Loading PPR Routing Graph.");
    ml::scoped_timer const timer{"Loading PPR Routing Graph."};
    ps::read_routing_graph(result, ppr_rg_path_);
    result.prepare_for_routing(edge_rtree_max_size_, area_rtree_max_size_,
                               lock_rtree_ ? ::ppr::rtree_options::LOCK
                                           : ::ppr::rtree_options::PREFETCH);
    return result;
  }

  void route_and_save_results(::ppr::routing_graph const& rg,
                              transfer_requests_keys const& treqs_k) {
    progress_tracker_->status("Precomputing Profilebased Transfers.");
    ml::scoped_timer const timer{"Precomputing Profilebased Transfers."};

    auto matches = storage_.get_all_matchings();

    auto treqs = to_transfer_requests(treqs_k, matches);
    auto trs = route_multiple_requests(treqs, rg, ppr_profiles_);
    storage_.add_new_transfer_results(trs);
  }

  // TODO (CARSTEN) route_and_update equals route_and_save
  void route_and_update_results(::ppr::routing_graph const& rg,
                                transfer_requests_keys const& treqs_k) {
    progress_tracker_->status("Updating Profilebased Transfers.");
    ml::scoped_timer const timer{"Updating Profilebased Transfers."};

    auto matches = storage_.get_all_matchings();

    auto treqs = to_transfer_requests(treqs_k, matches);
    auto trs = route_multiple_requests(treqs, rg, ppr_profiles_);
    storage_.add_new_transfer_results(trs);
  }

  // -- update timetable --
  void reset_timetable() {
    for (auto prf_idx = n::profile_idx_t{0}; prf_idx < n::kMaxProfiles;
         ++prf_idx) {
      tt_.locations_.footpaths_out_[prf_idx] =
          n::vecvec<n::location_idx_t, n::footpath>{};
      tt_.locations_.footpaths_in_[prf_idx] =
          n::vecvec<n::location_idx_t, n::footpath>{};
    }
  }

  void update_timetable(fs::path const& dir) {
    progress_tracker_->status("Preprocessing Footpaths.");
    ml::scoped_timer const timer{"Updating Timetable."};

    auto key_to_name = storage_.profile_key_to_profile_name_;

    reset_timetable();
    auto pp_fps = to_preprocessed_footpaths(
        storage_.get_transfer_preprocessing_data(tt_));

    progress_tracker_->status("Updating Timetable.");

    // transfer footpaths from mutable_fws_multimap to timetable vecvec
    for (auto prf_idx = n::profile_idx_t{0U}; prf_idx < n::kMaxProfiles;
         ++prf_idx) {
      for (auto loc_idx = n::location_idx_t{0U}; loc_idx < tt_.n_locations();
           ++loc_idx) {
        tt_.locations_.footpaths_out_[prf_idx].emplace_back(
            pp_fps.out_[prf_idx][loc_idx]);
      }
    }

    for (auto prf_idx = n::profile_idx_t{0U}; prf_idx < n::kMaxProfiles;
         ++prf_idx) {
      for (auto loc_idx = n::location_idx_t{0U}; loc_idx < tt_.n_locations();
           ++loc_idx) {
        tt_.locations_.footpaths_in_[prf_idx].emplace_back(
            pp_fps.in_[prf_idx][loc_idx]);
      }
    }

    tt_.write(dir);
  }

  n::timetable& tt_;
  storage storage_;

  hash_map<nlocation_key_t, n::location_idx_t> location_key_to_idx_;

  hash_map<string, profile_key_t> ppr_profile_keys_;
  hash_map<profile_key_t, ppr::profile_info> ppr_profiles_;
  set<profile_key_t> used_profiles_;

  // initialize matching limits
  double max_matching_dist_{400};
  double max_bus_stop_matching_dist_{120};

  // initialize progress tracker (ptr)
  utl::progress_tracker_ptr progress_tracker_{
      utl::get_active_progress_tracker()};
};  // namespace motis::footpaths

footpaths::footpaths() : module("Footpaths", "footpaths") {}

footpaths::~footpaths() = default;

fs::path footpaths::module_data_dir() const {
  return get_data_directory() / "footpaths";
}

fs::path footpaths::db_file() const {
  return module_data_dir() / "footpaths.db";
}

void footpaths::import(motis::module::import_dispatcher& reg) {
  std::make_shared<mm::event_collector>(
      get_data_directory().generic_string(), "footpaths", reg,
      [this](mm::event_collector::dependencies_map_t const& dependencies,
             mm::event_collector::publish_fn_t const&) {
        using import::FileEvent;
        using import::NigiriEvent;
        using import::PPREvent;

        auto const dir = get_data_directory() / "footpaths";
        auto const nigiri =
            motis_content(NigiriEvent, dependencies.at("NIGIRI"));
        auto const files = motis_content(FileEvent, dependencies.at("FILES"));
        auto const ppr = motis_content(PPREvent, dependencies.at("PPR"));

        // extract osm path from files
        std::string osm_path;
        for (auto const& p : *files->paths()) {
          if (p->tag()->str() == "osm") {
            osm_path = p->path()->str();
            break;
          }
        }
        utl::verify(!osm_path.empty(), "no osm file given.");

        auto const new_import_state = import_state{
            nigiri->hash(), osm_path, ppr->graph_hash(), ppr->profiles_hash()};

        auto ppr_profiles = std::map<std::string, ppr::profile_info>{};
        ::motis::ppr::read_profile_files(
            utl::to_vec(*ppr->profiles(),
                        [](auto const& p) { return p->path()->str(); }),
            ppr_profiles);

        fs::create_directories(dir);
        impl_ = std::make_unique<impl>(
            *get_shared_data<n::timetable*>(
                to_res_id(mm::global_res_id::NIGIRI_TIMETABLE)),
            ppr_profiles, db_file(), db_max_size_);

        impl_->new_import_state_ = new_import_state;
        impl_->osm_path_ = fs::path{osm_path};
        impl_->ppr_rg_path_ = ppr->graph_path()->str();
        impl_->nigiri_dump_path_ =
            get_data_directory() / "nigiri" / fmt::to_string(nigiri->hash());

        {
          ml::scoped_timer const timer{"Footpath Import"};
          if (!fs::exists(dir / "import.ini")) {
            LOG(ml::info) << "Footpaths: Full Import.";
            impl_->full_import();
            import_successful_ = true;
          } else {
            impl_->old_import_state_ =
                mm::read_ini<import_state>(dir / "import.ini");
            if (impl_->old_import_state_.value() != impl_->new_import_state_) {
              LOG(ml::info) << "Footpaths: Maybe Partial Import.";
              impl_->maybe_partial_import();
            }
            import_successful_ = true;
          }
        }

        mm::write_ini(dir / "import.ini", new_import_state);
      })
      ->require("FILES",
                [](mm::msg_ptr const& msg) {
                  return msg->get()->content_type() == MsgContent_FileEvent;
                })
      ->require("NIGIRI",
                [](mm::msg_ptr const& msg) {
                  return msg->get()->content_type() == MsgContent_NigiriEvent;
                })
      ->require("PPR", [](mm::msg_ptr const& msg) {
        return msg->get()->content_type() == MsgContent_PPREvent;
      });
}

}  // namespace motis::footpaths
