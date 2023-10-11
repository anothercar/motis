#include "motis/nigiri/restrictions/mobility_service.h"

#include <optional>
#include <string>
#include <vector>

#include "boost/asio/io_service.hpp"

#include "motis/json/json.h"

#include "net/http/client/https_client.h"

#include "nigiri/loader/gtfs/parse_time.h"

#include "rapidjson/document.h"
#include "rapidjson/error/en.h"

#include "utl/verify.h"

namespace fs = std::filesystem;
namespace mj = motis::json;
namespace nhc = net::http::client;
namespace n = ::nigiri;
namespace nlg = ::nigiri::loader::gtfs;
namespace nr = ::nigiri::restrictions;

namespace motis::nigiri::restrictions {

struct ms_parse_result {
  std::string location_name_;
  n::vector<nr::av_on_weekday> availabilities_;
};

std::vector<std::string> db_weekdays = {"monday",   "tuesday", "wednesday",
                                        "thursday", "friday",  "saturday",
                                        "sunday"};

std::optional<ms_parse_result> parse_db_ms_availability(
    rapidjson::Value const& ms_av) {
  auto loc_name = std::string{mj::get_str(ms_av, "name")};
  auto wd_avs = n::vector<nr::av_on_weekday>{};

  try {
    mj::get_obj(ms_av, "localServiceStaff");
  } catch (const std::exception& e) {
    std::ignore = e;
    return {};
  }

  for (auto const& db_wd : db_weekdays) {
    auto wd_av = nr::av_on_weekday{};
    // db has only one availability per day
    auto from = nlg::hhmm_to_min(std::string{mj::get_str(
        mj::get_obj(mj::get_obj(mj::get_obj(ms_av, "localServiceStaff"),
                                "availability"),
                    db_wd.c_str()),
        "fromTime")});
    auto to = nlg::hhmm_to_min(std::string{mj::get_str(
        mj::get_obj(mj::get_obj(mj::get_obj(ms_av, "localServiceStaff"),
                                "availability"),
                    db_wd.c_str()),
        "toTime")});

    wd_av.weekday_ = db_wd;
    wd_av.availabilities_.emplace_back(from, to);

    wd_avs.emplace_back(wd_av);
  }
  auto res = ms_parse_result{loc_name, wd_avs};
  return res;
}

ms_av_results request_mobility_service_availability(
    std::string const& db_client_id, std::string const& db_api_key) {
  boost::asio::io_service ios;

  auto const addr = std::string{
      "https://apis.deutschebahn.com/db-api-marketplace/apis/station-data/v2/"
      "stations"};

  auto headers = nhc::request::str_map{};
  headers.emplace("DB-Client-Id", db_client_id);
  headers.emplace("DB-Api-Key", db_api_key);

  nhc::request req{addr, nhc::request::method::GET, headers};

  auto results = ms_av_results{};

  nhc::make_https(ios, req.address)
      ->query(req, [&results](std::shared_ptr<net::ssl> const&,
                              nhc::response const& res,
                              boost::system::error_code ec) {
        std::ignore = ec;

        rapidjson::Document doc;
        doc.Parse(res.body.data(), res.body.size());

        utl::verify(!doc.HasParseError(), "bad json: {} at offset {}",
                    rapidjson::GetParseError_En(doc.GetParseError()),
                    doc.GetErrorOffset());
        utl::verify(doc.IsObject(), "no root object");

        auto const& locations = mj::get_array(doc, "result");
        for (auto const& loc : locations) {
          auto const ms_availability_parsed = parse_db_ms_availability(loc);
          if (ms_availability_parsed.has_value()) {
            auto const ms_av = ms_availability_parsed.value();
            results.emplace(ms_av.location_name_, ms_av.availabilities_);
          }
        }
      });

  ios.run();
  return results;
}

}  // namespace motis::nigiri::restrictions
