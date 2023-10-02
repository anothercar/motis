#pragma once

#include "ankerl/cista_adapter.h"

namespace motis::nigiri::restrictions {

template <typename K, typename V, typename Hash = cista::hash_all,
          typename Equality = cista::equals_all>
using hash_map = cista::raw::ankerl_map<K, V, Hash, Equality>;

template <typename K, typename Hash = cista::hash_all,
          typename Equality = cista::equals_all>
using set = cista::raw::ankerl_set<K, Hash, Equality>;

}  // namespace motis::nigiri::restrictions