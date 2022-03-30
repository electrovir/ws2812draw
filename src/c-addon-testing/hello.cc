// hello.cc using Node-API
#include <node_api.h>
#include "matrix-control.h"

namespace demo
{

    napi_value HelloMethod(napi_env env, napi_callback_info args)
    {
        napi_value greeting;
        napi_status status;

        status = napi_create_string_utf8(env, "world", NAPI_AUTO_LENGTH, &greeting);
        if (status != napi_ok)
            return nullptr;
        return greeting;
    }

    // helper places
    // https://github.com/yubin1026/napi_ffmpeg/blob/97968685af791d84ae02f206ed3a0bb407e64d49/src/napi_ffmpeg.c
    // https://nodejs.org/docs/latest-v16.x/api/n-api.html#napi_get_cb_info
    napi_value initMatrix(napi_env env, napi_callback_info info)
    {
        napi_value timestamp;
        napi_status status;
        size_t argc = 3;
        napi_value argv[3];
        status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
        if (status != napi_ok)
            return nullptr;

        const bool initMatrixResult = ledInit(8, 32, 255);

        status = napi_get_boolean(env, initMatrixResult, &timestamp);
        if (status != napi_ok)
            return nullptr;
        return timestamp;
    }

    napi_value init(napi_env env, napi_value exports)
    {
        napi_status status;
        napi_value initMatrixFunction;
        napi_value helloFunction;

        status = napi_create_function(env, nullptr, 0, HelloMethod, nullptr, &helloFunction);
        if (status != napi_ok)
            return nullptr;

        status = napi_set_named_property(env, exports, "hello", helloFunction);
        if (status != napi_ok)
            return nullptr;

        status = napi_create_function(env, nullptr, 0, initMatrix, nullptr, &initMatrixFunction);
        if (status != napi_ok)
            return nullptr;

        status = napi_set_named_property(env, exports, "test", initMatrixFunction);
        if (status != napi_ok)
            return nullptr;

        return exports;
    }

    NAPI_MODULE(NODE_GYP_MODULE_NAME, init)

} // namespace demo