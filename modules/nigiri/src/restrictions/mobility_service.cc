#include "motis/nigiri/restrictions/mobility_service.h"

#include "python3.10/Python.h"

namespace fs = std::filesystem;

namespace motis::transfers::restrictions {

void load_mobility_service_availability(fs::path const& path) {
  Py_Initialize();

  // basic imports
  PyRun_SimpleString("import os, sys");
  PyRun_SimpleString("from dotenv import load_dotenv");

  // add sys path to stada api
  PyRun_SimpleString(
      "sys.path.append(os.path.join(os.getcwd(), 'input', 'python', 'dbapi', "
      "'stada'))");

  // import stada function/method
  PyRun_SimpleString(
      "from stations import get_stations_mobility_service_availability_info, "
      "export_multiple_mobility_service_info_to_csv");

  // load dotenv data
  PyRun_SimpleString("load_dotenv()");

  // call stada api; export mobility service availability to csv
  auto const api_call = "export_multiple_mobility_service_info_to_csv( '" +
                        path.string() +
                        "', get_stations_mobility_service_availability_info())";

  PyRun_SimpleString(api_call.c_str());

  Py_Finalize();
}

}  // namespace motis::transfers::restrictions
