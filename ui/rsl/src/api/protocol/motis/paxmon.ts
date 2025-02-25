// GENERATED FILE - DO NOT MODIFY
// -> see /tools/protocol for information on how to update this file
import {
  Connection,
  Interval,
  ServiceInfo,
  Station,
  TripId,
  TripServiceInfo,
} from "@/api/protocol/motis";

// paxmon/PaxMonCompactJourney.fbs
export type PaxMonTransferType =
  | "NONE"
  | "SAME_STATION"
  | "FOOTPATH"
  | "MERGE"
  | "THROUGH";

// paxmon/PaxMonCompactJourney.fbs
export interface PaxMonTransferInfo {
  type: PaxMonTransferType;
  duration: number;
}

// paxmon/PaxMonCompactJourney.fbs
export interface PaxMonCompactJourneyLeg {
  trip: TripServiceInfo;
  enter_station: Station;
  exit_station: Station;
  enter_time: number;
  exit_time: number;
  enter_transfer: PaxMonTransferInfo;
}

// paxmon/PaxMonCompactJourney.fbs
export interface PaxMonFootpath {
  duration: number;
  from_station: Station;
  to_station: Station;
}

// paxmon/PaxMonCompactJourney.fbs
export interface PaxMonCompactJourney {
  legs: PaxMonCompactJourneyLeg[];
  final_footpath: PaxMonFootpath[];
}

// paxmon/PaxMonRerouteReason.fbs
export type PaxMonRerouteReason =
  | "Manual"
  | "BrokenTransfer"
  | "MajorDelayExpected"
  | "RevertForecast"
  | "Simulation"
  | "UpdateForecast"
  | "DestinationUnreachable"
  | "DestinationReachable";

// paxmon/PaxMonBrokenTransferInfo.fbs
export type PaxMonTransferDirection = "Enter" | "Exit";

// paxmon/PaxMonBrokenTransferInfo.fbs
export interface PaxMonBrokenTransferInfo {
  leg_index: number;
  direction: PaxMonTransferDirection;
  current_arrival_time: number;
  current_departure_time: number;
  required_transfer_time: number;
  arrival_canceled: boolean;
  departure_canceled: boolean;
}

// paxmon/PaxMonLocalization.fbs
export interface PaxMonAtStation {
  station: Station;
  schedule_arrival_time: number;
  current_arrival_time: number;
  first_station: boolean;
}

// paxmon/PaxMonLocalization.fbs
export interface PaxMonInTrip {
  trip: TripId;
  next_station: Station;
  schedule_arrival_time: number;
  current_arrival_time: number;
}

// paxmon/PaxMonLocalization.fbs
export type PaxMonLocalization = PaxMonAtStation | PaxMonInTrip;

export type PaxMonLocalizationType = "PaxMonAtStation" | "PaxMonInTrip";

// paxmon/PaxMonLocalization.fbs
export interface PaxMonLocalizationWrapper {
  localization_type: PaxMonLocalizationType;
  localization: PaxMonLocalization;
}

// paxmon/PaxMonRerouteLog.fbs
export interface PaxMonRerouteLogRoute {
  index: number;
  previous_probability: number;
  new_probability: number;
}

// paxmon/PaxMonRerouteLog.fbs
export interface PaxMonRerouteLogEntry {
  system_time: number;
  reroute_time: number;
  reason: PaxMonRerouteReason;
  broken_transfer: PaxMonBrokenTransferInfo[];
  old_route: PaxMonRerouteLogRoute;
  new_routes: PaxMonRerouteLogRoute[];
  localization_type: PaxMonLocalizationType;
  localization: PaxMonLocalization;
}

// paxmon/PaxMonGroup.fbs
export interface PaxMonDataSource {
  primary_ref: number;
  secondary_ref: number;
}

// paxmon/PaxMonGroup.fbs
export interface PaxMonGroupRoute {
  index: number;
  journey: PaxMonCompactJourney;
  probability: number;
  planned_arrival_time: number;
  estimated_delay: number;
  source_flags: number;
  planned: boolean;
  broken: boolean;
  disabled: boolean;
  destination_unreachable: boolean;
}

// paxmon/PaxMonGroup.fbs
export interface PaxMonGroup {
  id: number;
  source: PaxMonDataSource;
  passenger_count: number;
  routes: PaxMonGroupRoute[];
  reroute_log: PaxMonRerouteLogEntry[];
}

// paxmon/PaxMonGroup.fbs
export interface PaxMonGroupWithRoute {
  group_id: number;
  source: PaxMonDataSource;
  passenger_count: number;
  route: PaxMonGroupRoute;
}

// paxmon/PaxMonGroup.fbs
export interface PaxMonGroupWithRouteId {
  g: number;
  r: number;
}

// paxmon/PaxMonGroup.fbs
export interface PaxMonGroupRouteBaseInfo {
  g: number;
  r: number;
  n: number;
  p: number;
}

// paxmon/PaxMonGroup.fbs
export interface PaxMonGroupRouteUpdateInfo {
  g: number;
  r: number;
  n: number;
  p: number;
  pp: number;
}

// paxmon/PaxMonReachability.fbs
export type PaxMonReachabilityStatus =
  | "OK"
  | "BROKEN_INITIAL_ENTRY"
  | "BROKEN_TRANSFER_EXIT"
  | "BROKEN_TRANSFER_ENTRY"
  | "BROKEN_FINAL_EXIT";

// paxmon/PaxMonReachability.fbs
export interface PaxMonReachability {
  status: PaxMonReachabilityStatus;
  broken_transfer: PaxMonBrokenTransferInfo[];
}

// paxmon/PaxMonUpdate.fbs
export type PaxMonEventType =
  | "NO_PROBLEM"
  | "BROKEN_TRANSFER"
  | "MAJOR_DELAY_EXPECTED";

// paxmon/PaxMonUpdate.fbs
export interface PaxMonEvent {
  type: PaxMonEventType;
  group_route: PaxMonGroupWithRoute;
  localization_type: PaxMonLocalizationType;
  localization: PaxMonLocalization;
  reachability: PaxMonReachability;
  expected_arrival_time: number;
}

// paxmon/PaxMonUpdate.fbs
export interface PaxMonUpdate {
  universe: number;
  events: PaxMonEvent[];
}

// paxmon/PaxMonAddGroupsRequest.fbs
export interface PaxMonAddGroupsRequest {
  universe: number;
  groups: PaxMonGroup[];
}

// paxmon/PaxMonAddGroupsResponse.fbs
export interface PaxMonAddGroupsResponse {
  ids: number[];
}

// paxmon/PaxMonRemoveGroupsRequest.fbs
export interface PaxMonRemoveGroupsRequest {
  universe: number;
  ids: number[];
}

// paxmon/PaxMonFindTripsRequest.fbs
export interface PaxMonFindTripsRequest {
  universe: number;
  train_nr: number;
  only_trips_with_paxmon_data: boolean;
  filter_class: boolean;
  max_class: number;
}

// paxmon/PaxMonFindTripsResponse.fbs
export interface PaxMonTripInfo {
  tsi: TripServiceInfo;
  has_paxmon_data: boolean;
  all_edges_have_capacity_info: boolean;
  has_passengers: boolean;
}

// paxmon/PaxMonFindTripsResponse.fbs
export interface PaxMonFindTripsResponse {
  trips: PaxMonTripInfo[];
}

// paxmon/PaxMonGetGroupsRequest.fbs
export interface PaxMonGetGroupsRequest {
  universe: number;
  ids: number[];
  sources: PaxMonDataSource[];
  include_reroute_log: boolean;
}

// paxmon/PaxMonGetGroupsResponse.fbs
export interface PaxMonGetGroupsResponse {
  groups: PaxMonGroup[];
}

// paxmon/PaxMonStatusRequest.fbs
export interface PaxMonStatusRequest {
  universe: number;
}

// paxmon/PaxMonStatusResponse.fbs
export interface PaxMonFeedStatus {
  enabled: boolean;
  receiving: boolean;
  up_to_date: boolean;
  last_update_time: number;
  last_message_time: number;
}

// paxmon/PaxMonStatusResponse.fbs
export interface PaxMonStatusResponse {
  system_time: number;
  multiverse_id: number;
  active_groups: number;
  trip_count: number;
  primary_system_time: number;
  current_time: number;
  ribasis_fahrt_status: PaxMonFeedStatus;
  ribasis_formation_status: PaxMonFeedStatus;
}

// paxmon/PaxMonDistribution.fbs
export interface PaxMonPdfEntry {
  n: number;
  p: number;
}

// paxmon/PaxMonDistribution.fbs
export interface PaxMonCdfEntry {
  n: number;
  p: number;
}

// paxmon/PaxMonDistribution.fbs
export interface PaxMonDistribution {
  min: number;
  max: number;
  q5: number;
  q50: number;
  q95: number;
  pdf: PaxMonPdfEntry[];
}

// paxmon/PaxMonCapacitySource.fbs
export type PaxMonCapacitySource =
  | "FormationVehicles"
  | "FormationVehicleGroups"
  | "FormationBaureihe"
  | "FormationGattung"
  | "TripExactMatch"
  | "TripPrimaryIdMatch"
  | "TrainNrAndStations"
  | "TrainNr"
  | "Category"
  | "Class"
  | "Override"
  | "Unlimited"
  | "Unknown";

// paxmon/PaxMonCapacityType.fbs
export type PaxMonCapacityType = "Known" | "Unknown" | "Unlimited";

// paxmon/PaxMonTripLoadInfo.fbs
export interface PaxMonEdgeLoadInfo {
  from: Station;
  to: Station;
  departure_schedule_time: number;
  departure_current_time: number;
  arrival_schedule_time: number;
  arrival_current_time: number;
  capacity_type: PaxMonCapacityType;
  capacity: number;
  capacity_source: PaxMonCapacitySource;
  dist: PaxMonDistribution;
  updated: boolean;
  possibly_over_capacity: boolean;
  prob_over_capacity: number;
  expected_passengers: number;
}

// paxmon/PaxMonTripLoadInfo.fbs
export interface PaxMonTripLoadInfo {
  tsi: TripServiceInfo;
  edges: PaxMonEdgeLoadInfo[];
}

// paxmon/PaxMonFilterGroupsRequest.fbs
export type PaxMonFilterGroupsSortOrder =
  | "GroupId"
  | "ScheduledDepartureTime"
  | "MaxEstimatedDelay"
  | "ExpectedEstimatedDelay"
  | "MinEstimatedDelay"
  | "RerouteLogEntries";

// paxmon/PaxMonFilterGroupsRequest.fbs
export type PaxMonFilterGroupsTimeFilter =
  | "NoFilter"
  | "DepartureTime"
  | "DepartureOrArrivalTime"
  | "ActiveTime";

// paxmon/PaxMonFilterGroupsRequest.fbs
export interface PaxMonFilterGroupsRequest {
  universe: number;
  sort_by: PaxMonFilterGroupsSortOrder;
  max_results: number;
  skip_first: number;
  include_reroute_log: boolean;
  filter_by_start: string[];
  filter_by_destination: string[];
  filter_by_via: string[];
  filter_by_group_id: number[];
  filter_by_data_source: PaxMonDataSource[];
  filter_by_train_nr: number[];
  filter_by_time: PaxMonFilterGroupsTimeFilter;
  filter_interval: Interval;
  filter_by_reroute_reason: PaxMonRerouteReason[];
}

// paxmon/PaxMonFilterGroupsResponse.fbs
export interface PaxMonGroupWithStats {
  group: PaxMonGroup;
  min_estimated_delay: number;
  max_estimated_delay: number;
  expected_estimated_delay: number;
  prob_destination_unreachable: number;
}

// paxmon/PaxMonFilterGroupsResponse.fbs
export interface PaxMonFilterGroupsResponse {
  total_matching_groups: number;
  total_matching_passengers: number;
  filtered_groups: number;
  remaining_groups: number;
  next_skip: number;
  groups: PaxMonGroupWithStats[];
}

// paxmon/PaxMonFilterTripsTimeFilter.fbs
export type PaxMonFilterTripsTimeFilter =
  | "NoFilter"
  | "DepartureTime"
  | "DepartureOrArrivalTime"
  | "ActiveTime";

// paxmon/PaxMonFilterTripsRequest.fbs
export type PaxMonFilterTripsSortOrder =
  | "MostCritical"
  | "FirstDeparture"
  | "ExpectedPax"
  | "TrainNr"
  | "MaxLoad"
  | "EarliestCritical"
  | "MaxPaxRange"
  | "MaxPax"
  | "MaxCapacity";

// paxmon/PaxMonFilterTripsRequest.fbs
export interface PaxMonFilterTripsRequest {
  universe: number;
  ignore_past_sections: boolean;
  include_load_threshold: number;
  critical_load_threshold: number; // default: 1
  crowded_load_threshold: number; // default: 0.8
  include_edges: boolean;
  sort_by: PaxMonFilterTripsSortOrder;
  max_results: number;
  skip_first: number;
  filter_by_time: PaxMonFilterTripsTimeFilter;
  filter_interval: Interval;
  filter_by_train_nr: boolean;
  filter_train_nrs: number[];
  filter_by_service_class: boolean;
  filter_service_classes: number[];
  filter_by_capacity_status: boolean;
  filter_has_trip_formation: boolean;
  filter_has_capacity_for_all_sections: boolean;
}

// paxmon/PaxMonTripCapacityStatus.fbs
export interface PaxMonTripCapacityStatus {
  has_trip_formation: boolean;
  has_capacity_for_all_sections: boolean;
  has_capacity_for_some_sections: boolean;
  worst_source: PaxMonCapacitySource;
}

// paxmon/PaxMonFilterTripsResponse.fbs
export interface PaxMonFilteredTripInfo {
  tsi: TripServiceInfo;
  section_count: number;
  critical_sections: number;
  crowded_sections: number;
  max_excess_pax: number;
  cumulative_excess_pax: number;
  max_load: number;
  max_expected_pax: number;
  capacity_status: PaxMonTripCapacityStatus;
  edges: PaxMonEdgeLoadInfo[];
}

// paxmon/PaxMonFilterTripsResponse.fbs
export interface PaxMonFilterTripsResponse {
  total_matching_trips: number;
  filtered_trips: number;
  remaining_trips: number;
  next_skip: number;
  total_critical_sections: number;
  trips: PaxMonFilteredTripInfo[];
}

// paxmon/PaxMonGetTripLoadInfosRequest.fbs
export interface PaxMonGetTripLoadInfosRequest {
  universe: number;
  trips: TripId[];
}

// paxmon/PaxMonGetTripLoadInfosResponse.fbs
export interface PaxMonGetTripLoadInfosResponse {
  load_infos: PaxMonTripLoadInfo[];
}

// paxmon/PaxMonForkUniverseRequest.fbs
export interface PaxMonForkUniverseRequest {
  universe: number;
  fork_schedule: boolean;
  ttl: number;
}

// paxmon/PaxMonForkUniverseResponse.fbs
export interface PaxMonForkUniverseResponse {
  universe: number;
  schedule: number;
  ttl: number;
}

// paxmon/PaxMonDestroyUniverseRequest.fbs
export interface PaxMonDestroyUniverseRequest {
  universe: number;
}

// paxmon/PaxMonGetGroupsInTripRequest.fbs
export type PaxMonGroupFilter = "All" | "Entering" | "Exiting";

// paxmon/PaxMonGetGroupsInTripRequest.fbs
export type PaxMonGroupByStation =
  | "None"
  | "First"
  | "Last"
  | "FirstLongDistance"
  | "LastLongDistance"
  | "EntryAndLast";

// paxmon/PaxMonGetGroupsInTripRequest.fbs
export interface PaxMonGetGroupsInTripRequest {
  universe: number;
  trip: TripId;
  filter: PaxMonGroupFilter;
  group_by_station: PaxMonGroupByStation;
  group_by_other_trip: boolean;
  include_group_infos: boolean;
}

// paxmon/PaxMonCombinedGroups.fbs
export interface PaxMonCombinedGroupRoutes {
  group_routes: PaxMonGroupRouteBaseInfo[];
  dist: PaxMonDistribution;
}

// paxmon/PaxMonCombinedGroups.fbs
export interface PaxMonCombinedGroupRouteIds {
  group_routes: PaxMonGroupWithRouteId[];
  dist: PaxMonDistribution;
}

// paxmon/PaxMonGetGroupsInTripResponse.fbs
export interface GroupedPassengerGroups {
  grouped_by_station: Station[];
  grouped_by_trip: TripServiceInfo[];
  entry_station: Station[];
  entry_time: number;
  info: PaxMonCombinedGroupRoutes;
}

// paxmon/PaxMonGetGroupsInTripResponse.fbs
export interface GroupsInTripSection {
  from: Station;
  to: Station;
  departure_schedule_time: number;
  departure_current_time: number;
  arrival_schedule_time: number;
  arrival_current_time: number;
  groups: GroupedPassengerGroups[];
}

// paxmon/PaxMonGetGroupsInTripResponse.fbs
export interface PaxMonGetGroupsInTripResponse {
  sections: GroupsInTripSection[];
}

// paxmon/PaxMonUniverseForked.fbs
export interface PaxMonUniverseForked {
  base_universe: number;
  new_universe: number;
  new_schedule: number;
  schedule_forked: boolean;
}

// paxmon/PaxMonUniverseDestroyed.fbs
export interface PaxMonUniverseDestroyed {
  universe: number;
}

// paxmon/PaxMonTransfersAtStationRequest.fbs
export interface PaxMonTransfersAtStationRequest {
  universe: number;
  station: string;
  filter_interval: Interval;
  ignore_past_transfers: boolean;
  include_meta_stations: boolean;
  include_group_infos: boolean;
  include_broken_transfers: boolean;
  include_disabled_group_routes: boolean;
  max_results: number;
}

// paxmon/PaxMonTransferId.fbs
export interface PaxMonTransferId {
  n: number;
  e: number;
}

// paxmon/PaxMonDetailedTransferInfo.fbs
export interface PaxMonTripStopInfo {
  schedule_time: number;
  current_time: number;
  canceled: boolean;
  trips: TripServiceInfo[];
  station: Station;
}

// paxmon/PaxMonDetailedTransferInfo.fbs
export interface PaxMonTransferDelayInfo {
  min_delay_increase: number;
  max_delay_increase: number;
  total_delay_increase: number;
  squared_total_delay_increase: number;
  unreachable_pax: number;
}

// paxmon/PaxMonDetailedTransferInfo.fbs
export interface PaxMonDetailedTransferInfo {
  id: PaxMonTransferId;
  arrival: PaxMonTripStopInfo[];
  departure: PaxMonTripStopInfo[];
  groups?: PaxMonCombinedGroupRoutes;
  group_count: number;
  pax_count: number;
  transfer_time: number;
  valid: boolean;
  disabled: boolean;
  broken: boolean;
  canceled: boolean;
  delay?: PaxMonTransferDelayInfo;
}

// paxmon/PaxMonTransfersAtStationResponse.fbs
export interface PaxMonTransfersAtStationResponse {
  station: Station;
  transfers: PaxMonDetailedTransferInfo[];
  max_count_reached: boolean;
}

// paxmon/PaxMonGetAddressableGroupsRequest.fbs
export interface PaxMonGetAddressableGroupsRequest {
  universe: number;
  trip: TripId;
}

// paxmon/PaxMonGetAddressableGroupsResponse.fbs
export interface PaxMonAddressableGroupsByFeeder {
  trip: TripServiceInfo;
  arrival_station: Station;
  arrival_schedule_time: number;
  arrival_current_time: number;
  cgs: PaxMonCombinedGroupRouteIds;
}

// paxmon/PaxMonGetAddressableGroupsResponse.fbs
export interface PaxMonAddressableGroupsByEntry {
  entry_station: Station;
  departure_schedule_time: number;
  cgs: PaxMonCombinedGroupRouteIds;
  by_feeder: PaxMonAddressableGroupsByFeeder[];
  starting_here: PaxMonCombinedGroupRouteIds;
}

// paxmon/PaxMonGetAddressableGroupsResponse.fbs
export interface PaxMonAddressableGroupsByInterchange {
  future_interchange: Station;
  cgs: PaxMonCombinedGroupRouteIds;
  by_entry: PaxMonAddressableGroupsByEntry[];
}

// paxmon/PaxMonGetAddressableGroupsResponse.fbs
export interface PaxMonAddressableGroupsSection {
  from: Station;
  to: Station;
  departure_schedule_time: number;
  departure_current_time: number;
  arrival_schedule_time: number;
  arrival_current_time: number;
  by_future_interchange: PaxMonAddressableGroupsByInterchange[];
}

// paxmon/PaxMonGetAddressableGroupsResponse.fbs
export interface PaxMonGetAddressableGroupsResponse {
  sections: PaxMonAddressableGroupsSection[];
  group_routes: PaxMonGroupRouteBaseInfo[];
}

// paxmon/PaxMonKeepAliveRequest.fbs
export interface PaxMonKeepAliveRequest {
  multiverse_id: number;
  universes: number[];
}

// paxmon/PaxMonKeepAliveResponse.fbs
export interface PaxMonUniverseKeepAliveInfo {
  universe: number;
  schedule: number;
  expires_in: number;
}

// paxmon/PaxMonKeepAliveResponse.fbs
export interface PaxMonKeepAliveResponse {
  multiverse_id: number;
  alive: PaxMonUniverseKeepAliveInfo[];
  expired: number[];
}

// paxmon/PaxMonRerouteGroupsRequest.fbs
export interface PaxMonRerouteGroup {
  group: number;
  old_route_index: number;
  new_routes: PaxMonGroupRoute[];
  reason: PaxMonRerouteReason;
  broken_transfer: PaxMonBrokenTransferInfo[];
  override_probabilities: boolean;
  localization: PaxMonLocalizationWrapper[];
}

// paxmon/PaxMonRerouteGroupsRequest.fbs
export interface PaxMonRerouteGroupsRequest {
  universe: number;
  reroutes: PaxMonRerouteGroup[];
}

// paxmon/PaxMonRerouteGroupsResponse.fbs
export interface PaxMonRerouteRouteInfo {
  i: number;
  p: number;
  pp: number;
}

// paxmon/PaxMonRerouteGroupsResponse.fbs
export interface PaxMonRerouteGroupResult {
  group: number;
  old_route_index: number;
  new_routes: PaxMonRerouteRouteInfo[];
}

// paxmon/PaxMonRerouteGroupsResponse.fbs
export interface PaxMonRerouteGroupsResponse {
  reroutes: PaxMonRerouteGroupResult[];
}

// paxmon/PaxMonGroupStatisticsRequest.fbs
export interface PaxMonGroupStatisticsRequest {
  universe: number;
  count_passengers: boolean;
}

// paxmon/PaxMonGroupStatisticsResponse.fbs
export interface PaxMonHistogram {
  min_value: number;
  max_value: number;
  avg_value: number;
  median_value: number;
  max_count: number;
  total_count: number;
  counts: number[];
}

// paxmon/PaxMonGroupStatisticsResponse.fbs
export interface PaxMonGroupStatisticsResponse {
  group_count: number;
  total_group_route_count: number;
  active_group_route_count: number;
  unreachable_destination_group_count: number;
  total_pax_count: number;
  unreachable_destination_pax_count: number;
  min_estimated_delay: PaxMonHistogram;
  max_estimated_delay: PaxMonHistogram;
  expected_estimated_delay: PaxMonHistogram;
  routes_per_group: PaxMonHistogram;
  active_routes_per_group: PaxMonHistogram;
  reroutes_per_group: PaxMonHistogram;
  group_route_probabilities: PaxMonHistogram;
}

// paxmon/PaxMonDebugGraphRequest.fbs
export interface PaxMonDebugGraphRequest {
  universe: number;
  node_indices: number[];
  group_routes: PaxMonGroupWithRouteId[];
  trip_ids: TripId[];
  filter_groups: boolean;
  include_full_trips_from_group_routes: boolean;
  include_canceled_trip_nodes: boolean;
}

// paxmon/PaxMonDebugGraphResponse.fbs
export interface PaxMonDebugNodeLogEntry {
  system_time: number;
  node_time: number;
  valid: boolean;
}

// paxmon/PaxMonDebugGraphResponse.fbs
export interface PaxMonDebugNode {
  index: number;
  schedule_time: number;
  current_time: number;
  arrival: boolean;
  valid: boolean;
  station: Station;
  log: PaxMonDebugNodeLogEntry[];
}

// paxmon/PaxMonDebugGraphResponse.fbs
export type PaxMonDebugEdgeType =
  | "Trip"
  | "Interchange"
  | "Wait"
  | "Through"
  | "Disabled";

// paxmon/PaxMonDebugGraphResponse.fbs
export interface PaxMonDebugEdgeLogEntry {
  system_time: number;
  required_transfer_time: number;
  available_transfer_time: number;
  edge_type: PaxMonDebugEdgeType;
  broken: boolean;
}

// paxmon/PaxMonDebugGraphResponse.fbs
export type PaxMonDebugPaxLogAction =
  | "RouteAdded"
  | "RouteRemoved"
  | "BrokenRouteAdded"
  | "BrokenRouteRemoved";

// paxmon/PaxMonDebugGraphResponse.fbs
export type PaxMonDebugPaxLogReason =
  | "Unknown"
  | "Api"
  | "TripReroute"
  | "UpdateLoad";

// paxmon/PaxMonDebugGraphResponse.fbs
export interface PaxMonDebugPaxLogEntry {
  system_time: number;
  action: PaxMonDebugPaxLogAction;
  reason: PaxMonDebugPaxLogReason;
  group_route: PaxMonGroupWithRouteId;
}

// paxmon/PaxMonDebugGraphResponse.fbs
export interface PaxMonDebugEdge {
  from_node: number;
  to_node: number;
  out_edge_index: number;
  type: PaxMonDebugEdgeType;
  broken: boolean;
  valid: boolean;
  transfer_time: number;
  expected_load: number;
  group_routes: PaxMonGroupRouteBaseInfo[];
  trip_indices: number[];
  edge_log: PaxMonDebugEdgeLogEntry[];
  pax_log: PaxMonDebugPaxLogEntry[];
}

// paxmon/PaxMonDebugGraphResponse.fbs
export interface PaxMonDebugGraphResponse {
  graph_log_enabled: boolean;
  nodes: PaxMonDebugNode[];
  edges: PaxMonDebugEdge[];
  trips: TripServiceInfo[];
}

// paxmon/PaxMonGetUniversesResponse.fbs
export interface PaxMonUniverseInfo {
  universe: number;
  schedule: number;
  ttl: number;
  expires_in: number;
}

// paxmon/PaxMonGetUniversesResponse.fbs
export interface PaxMonGetUniversesResponse {
  multiverse_id: number;
  universes: PaxMonUniverseInfo[];
}

// paxmon/PaxMonGetTripCapacityRequest.fbs
export interface PaxMonGetTripCapacityRequest {
  universe: number;
  trips: TripId[];
}

// paxmon/PaxMonGetTripCapacityResponse.fbs
export interface PaxMonCapacityData {
  limit: number;
  seats: number;
  seats_1st: number;
  seats_2nd: number;
  standing: number;
  total_limit: number;
}

// paxmon/PaxMonGetTripCapacityResponse.fbs
export interface PaxMonVehicleCapacityInfo {
  uic: number;
  uic_found: boolean;
  guessed: boolean;
  baureihe: string;
  type_code: string;
  order: string;
  data: PaxMonCapacityData;
  capacity_source: PaxMonCapacitySource;
}

// paxmon/PaxMonGetTripCapacityResponse.fbs
export interface PaxMonVehicleGroupInfo {
  name: string;
  start: Station;
  destination: Station;
  trip_uuid: string;
  primary_trip_id: TripId;
  capacity: PaxMonCapacityData[];
  vehicles: PaxMonVehicleCapacityInfo[];
}

// paxmon/PaxMonGetTripCapacityResponse.fbs
export interface PaxMonMergedTripCapacityInfo {
  trip: TripId;
  service_info: ServiceInfo;
  trip_lookup_capacity: PaxMonCapacityData;
  trip_lookup_capacity_source: PaxMonCapacitySource;
  trip_formation_capacity: PaxMonCapacityData;
  trip_formation_capacity_source: PaxMonCapacitySource;
  trip_formation_found: boolean;
  vehicle_groups: PaxMonVehicleGroupInfo[];
  override: PaxMonCapacityData[];
}

// paxmon/PaxMonGetTripCapacityResponse.fbs
export interface PaxMonSectionCapacityInfo {
  from: Station;
  to: Station;
  departure_schedule_time: number;
  departure_current_time: number;
  arrival_schedule_time: number;
  arrival_current_time: number;
  capacity_type: PaxMonCapacityType;
  capacity: PaxMonCapacityData;
  capacity_source: PaxMonCapacitySource;
  merged_trips: PaxMonMergedTripCapacityInfo[];
}

// paxmon/PaxMonGetTripCapacityResponse.fbs
export interface PaxMonTripCapacityInfo {
  tsi: TripServiceInfo;
  status: PaxMonTripCapacityStatus;
  sections: PaxMonSectionCapacityInfo[];
}

// paxmon/PaxMonGetTripCapacityResponse.fbs
export interface PaxMonGetTripCapacityResponse {
  trips: PaxMonTripCapacityInfo[];
  min_capacity: number;
  fuzzy_match_max_time_diff: number;
  trip_capacity_map_size: number;
  category_capacity_map_size: number;
  vehicle_capacity_map_size: number;
  trip_formation_map_size: number;
  capacity_override_map_size: number;
  baureihe_capacity_map_size: number;
  gattung_capacity_map_size: number;
  vehicle_group_capacity_map_size: number;
}

// paxmon/PaxMonCapacityStatusRequest.fbs
export interface PaxMonCapacityStatusRequest {
  universe: number;
  filter_by_time: PaxMonFilterTripsTimeFilter;
  filter_interval: Interval;
}

// paxmon/PaxMonCapacityStatusResponse.fbs
export interface PaxMonCapacityStats {
  tracked: number;
  trip_formation: number;
  capacity_for_all_sections: number;
  capacity_for_some_sections: number;
}

// paxmon/PaxMonCapacityStatusResponse.fbs
export interface PaxMonCategoryCapacityStats {
  category: string; // key
  service_class: number;
  stats: PaxMonCapacityStats;
}

// paxmon/PaxMonCapacityStatusResponse.fbs
export interface PaxMonProviderInfo {
  short_name: string;
  long_name: string;
  full_name: string;
}

// paxmon/PaxMonCapacityStatusResponse.fbs
export interface PaxMonProviderCapacityStats {
  provider: string; // key
  provider_info: PaxMonProviderInfo;
  stats: PaxMonCapacityStats;
  by_category: PaxMonCategoryCapacityStats[];
}

// paxmon/PaxMonCapacityStatusResponse.fbs
export interface PaxMonCapacityStatusResponse {
  all_trips: PaxMonCapacityStats;
  by_provider: PaxMonProviderCapacityStats[];
}

// paxmon/PaxMonDetailedCapacityStatusRequest.fbs
export interface PaxMonDetailedCapacityStatusRequest {
  universe: number;
  filter_by_time: PaxMonFilterTripsTimeFilter;
  filter_interval: Interval;
  include_missing_vehicle_infos: boolean;
  include_uics_not_found: boolean;
}

// paxmon/PaxMonDetailedCapacityStatusResponse.fbs
export interface PaxMonDetailedTripCapacityStats {
  category: string; // key
  service_class: number;
  tracked: number;
  full_data: number;
  partial_data: number;
  capacity_for_all_sections: number;
  trip_formation_data_found: number;
  no_formation_data_at_all: number;
  no_formation_data_some_sections_some_merged: number;
  no_formation_data_some_sections_all_merged: number;
  no_vehicles_found_at_all: number;
  no_vehicles_found_some_sections: number;
  some_vehicles_not_found_some_sections: number;
  trips_using_vehicle_uics: number;
  trips_using_only_vehicle_uics: number;
  trips_using_vehicle_groups: number;
  trips_using_baureihe: number;
  trips_using_type_code: number;
}

// paxmon/PaxMonDetailedCapacityStatusResponse.fbs
export interface PaxMonMissingVehicleInfo {
  baureihe: string;
  type_code: string;
  count: number;
}

// paxmon/PaxMonDetailedCapacityStatusResponse.fbs
export interface PaxMonDetailedCapacityStatusResponse {
  all_trips: PaxMonDetailedTripCapacityStats;
  by_category: PaxMonDetailedTripCapacityStats[];
  missing_vehicle_infos: PaxMonMissingVehicleInfo[];
  uics_not_found: number[];
}

// paxmon/PaxMonMetricsRequest.fbs
export interface PaxMonMetricsRequest {
  universe: number;
}

// paxmon/PaxMonMetricsResponse.fbs
export interface PaxMonMetrics {
  start_time: number;
  entries: number;
  affected_group_routes: number[];
  ok_group_routes: number[];
  broken_group_routes: number[];
  major_delay_group_routes: number[];
  total_timing: number[];
}

// paxmon/PaxMonMetricsResponse.fbs
export interface PaxMonMetricsResponse {
  by_system_time: PaxMonMetrics;
  by_processing_time: PaxMonMetrics;
}

// paxmon/PaxMonBrokenTransfersRequest.fbs
export type PaxMonBrokenTransfersSortOrder =
  | "AffectedPax"
  | "TotalDelayIncrease"
  | "SquaredTotalDelayIncrease"
  | "MinDelayIncrease"
  | "MaxDelayIncrease"
  | "UnreachablePax";

// paxmon/PaxMonBrokenTransfersRequest.fbs
export interface PaxMonBrokenTransfersRequest {
  universe: number;
  filter_interval: Interval;
  ignore_past_transfers: boolean;
  include_insufficient_transfer_time: boolean; // default: true
  include_missed_initial_departure: boolean; // default: true
  include_canceled_transfer: boolean; // default: true
  include_canceled_initial_departure: boolean; // default: true
  include_canceled_final_arrival: boolean; // default: true
  only_planned_routes: boolean;
  sort_by: PaxMonBrokenTransfersSortOrder;
  max_results: number;
  skip_first: number;
}

// paxmon/PaxMonBrokenTransfersResponse.fbs
export interface PaxMonBrokenTransfersResponse {
  total_matching_transfers: number;
  transfers_in_this_response: number;
  remaining_transfers: number;
  next_skip: number;
  transfers: PaxMonDetailedTransferInfo[];
}

// paxmon/PaxMonTransferDetailsRequest.fbs
export interface PaxMonTransferDetailsRequest {
  universe: number;
  id: PaxMonTransferId;
  include_disabled_group_routes: boolean;
  include_full_groups: boolean;
  include_reroute_log: boolean;
}

// paxmon/PaxMonTransferDetailsResponse.fbs
export interface PaxMonTransferDetailsResponse {
  info: PaxMonDetailedTransferInfo;
  normal_routes: number;
  broken_routes: number;
  groups: PaxMonGroup[];
}

// paxmon/PaxMonReviseCompactJourneyRequest.fbs
export interface PaxMonReviseCompactJourneyRequest {
  universe: number;
  journeys: PaxMonCompactJourney[];
}

// paxmon/PaxMonReviseCompactJourneyResponse.fbs
export interface PaxMonReviseCompactJourneyResponse {
  connections: Connection[];
}

// paxmon/PaxMonTrackedUpdates.fbs
export interface PaxMonCriticalTripInfo {
  critical_sections: number;
  max_excess_pax: number;
  cumulative_excess_pax: number;
}

// paxmon/PaxMonTrackedUpdates.fbs
export interface PaxMonUpdatedTrip {
  tsi: TripServiceInfo;
  rerouted: boolean;
  capacity_changed: boolean;
  newly_critical_sections: number;
  no_longer_critical_sections: number;
  max_pax_increase: number;
  max_pax_decrease: number;
  critical_info_before: PaxMonCriticalTripInfo;
  critical_info_after: PaxMonCriticalTripInfo;
  updated_group_routes: PaxMonGroupWithRouteId[];
  before_edges: PaxMonEdgeLoadInfo[];
  after_edges: PaxMonEdgeLoadInfo[];
}

// paxmon/PaxMonTrackedUpdates.fbs
export interface PaxMonTrackedUpdates {
  updated_group_route_count: number;
  updated_group_count: number;
  updated_pax_count: number;
  updated_trip_count: number;
  updated_trips: PaxMonUpdatedTrip[];
  updated_group_routes: PaxMonGroupRouteUpdateInfo[];
}
