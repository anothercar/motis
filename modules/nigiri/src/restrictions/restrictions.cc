#include "motis/nigiri/restrictions/restrictions.h"

#include <utility>

#include "motis/nigiri/restrictions/helper.h"

#include "nigiri/restrictions/mobility_service.h"

namespace n = ::nigiri;

namespace motis::nigiri::restrictions {

void restrictions::update(n::timetable const& tt) {
  restrictions_.clear();

  auto insert_restrictions =
      [&tt, this](n::hash_map<n::location_idx_t,
                              n::vector<n::restrictions::restriction*>>
                      other_restrs) {
        for (auto loc_idx = n::location_idx_t{0U};
             loc_idx < tt.locations_.ids_.size(); ++loc_idx) {
          if (!other_restrs.contains(loc_idx)) {
            continue;
          }

          if (!restrictions_.contains(loc_idx)) {
            restrictions_.emplace(
                std::pair<n::location_idx_t,
                          n::vector<n::restrictions::restriction*>>{loc_idx,
                                                                    {}});
          }

          restrictions_[loc_idx].insert(restrictions_[loc_idx].end(),
                                        other_restrs[loc_idx].begin(),
                                        other_restrs[loc_idx].end());
        }
      };

  if (mobility_service_) {
    insert_restrictions(mobility_service_restrictions_);
  }
}

void restrictions::update_mobility_services(
    ms_av_results const& ms_avs,
    n::hash_map<std::string_view, n::location_idx_t> const& loc_to_idx) {
  mobility_service_ = true;

  for (auto const& [loc_name, av_on_wds] : ms_avs) {
    mobility_service_restrictions_.clear();
    auto ms = n::restrictions::mobility_service(av_on_wds);

    if (!mobility_service_restrictions_.contains(loc_to_idx.at(loc_name))) {
      mobility_service_restrictions_.emplace(
          std::pair<n::location_idx_t,
                    n::vector<n::restrictions::restriction*>>{
              loc_to_idx.at(loc_name), {}});
    }

    mobility_service_restrictions_[loc_to_idx.at(loc_name)].emplace_back(&ms);
  }
}

}  // namespace motis::nigiri::restrictions
