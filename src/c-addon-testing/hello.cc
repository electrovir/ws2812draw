// hello.cc using Node-API
#include <node_api.h>
#include "ws2811.h"

namespace demo {

napi_value HelloMethod(napi_env env, napi_callback_info args) {
  napi_value greeting;
  napi_status status;

  status = napi_create_string_utf8(env, "world", NAPI_AUTO_LENGTH, &greeting);
  if (status != napi_ok) return nullptr;
  return greeting;
}

napi_value TimeStampMethod(napi_env env, napi_callback_info args) {
  napi_value timestamp;
  napi_status status;
  
  const uint64_t current_timestamp = get_microsecond_timestamp();

  status = napi_create_int64(env, current_timestamp, &timestamp);
  if (status != napi_ok) return nullptr;
  return timestamp;
}

napi_value init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value timestampFunction;
  napi_value helloFunction;

  status = napi_create_function(env, nullptr, 0, HelloMethod, nullptr, &helloFunction);
  if (status != napi_ok) return nullptr;

  status = napi_set_named_property(env, exports, "hello", helloFunction);
  if (status != napi_ok) return nullptr;

  status = napi_create_function(env, nullptr, 0, TimeStampMethod, nullptr, &timestampFunction);
  if (status != napi_ok) return nullptr;

  status = napi_set_named_property(env, exports, "timestamp", timestampFunction);
  if (status != napi_ok) return nullptr;
  
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)

}  // namespace demo