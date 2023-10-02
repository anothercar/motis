#pragma once

#include <filesystem>
#include <string_view>

#include "nigiri/timetable.h"
#include "nigiri/types.h"

namespace motis::nigiri::restrictions {

// Requests availability times of the mobility service and saves them in
// csv-format (given as fs::path).
void load_mobility_service_availability(std::filesystem::path const&);

}  // namespace motis::nigiri::restrictions
