#pragma once

#include <string_view>

#include "motis/nigiri/restrictions/mobility_service.h"

#include "nigiri/restrictions/restrictions.h"
#include "nigiri/timetable.h"
#include "nigiri/types.h"

namespace motis::nigiri::restrictions {

struct restrictions {
  // Resets and updates the restrictions hash map.
  //
  // Usage: call when all restrictions are updated.
  void update(::nigiri::timetable const&);

  // Resets and updates the mobility service restrictions hash map.
  //
  // param: ms_avs: mobility service availabilities for sites identified
  // by name.
  // param: loc_to_idx: hash map that maps a location name to the associated
  // location_idx_t in the timetable.
  void update_mobility_services(
      ms_av_results const& /* ms_avs */,
      ::nigiri::hash_map<std::string_view,
                         ::nigiri::location_idx_t> const& /* loc_to_idx */);

  ::nigiri::hash_map<::nigiri::location_idx_t,
                     ::nigiri::vector<::nigiri::restrictions::restriction*>>
      restrictions_{};

private:
  bool mobility_service_{false};

  ::nigiri::hash_map<::nigiri::location_idx_t,
                     ::nigiri::vector<::nigiri::restrictions::restriction*>>
      mobility_service_restrictions_{};
};

}  // namespace motis::nigiri::restrictions
