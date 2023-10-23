#pragma once

#include <filesystem>
#include <map>
#include <string>

#include "nigiri/restrictions/mobility_service.h"
#include "nigiri/types.h"

namespace motis::nigiri::restrictions {

using ms_av_results =
    std::map<std::string,
             ::nigiri::vector<::nigiri::restrictions::av_on_weekday>>;

ms_av_results request_mobility_service_availability(
    std::string const& /* db_client_id */, std::string const& /* db_api_key */);

}  // namespace motis::nigiri::restrictions
