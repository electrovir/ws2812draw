#include <stdint.h>
#include <stdlib.h>
#include <cstdio>
#include <node_api.h>
#include "matrix-control.h"

namespace ws2812drawCApi
{
    uint32_t initWidth = 0;
    uint32_t initHeight = 0;

    napi_value cleanUpCallback(napi_env env, napi_callback_info info)
    {
        napi_value ledCleanUpReturnValue;
        napi_status status;

        const bool ledCleanUpResult = ledCleanUp();

        status = napi_get_boolean(env, ledCleanUpResult, &ledCleanUpReturnValue);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "derp.");
            return nullptr;
        }
        return ledCleanUpReturnValue;
    }

    ws2811_led_t *convertToColorArray(napi_env env, uint32_t width, uint32_t height, napi_value colorsInputArray)
    {
        napi_status status;

        uint32_t colorsArrayLength;
        status = napi_get_array_length(env, colorsInputArray, &colorsArrayLength);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to get array length of input colors array.");
            return nullptr;
        }

        if (colorsArrayLength != height * width)
        {
            napi_throw_error(env, NULL, "Input colors array should have a length equal to height * width.");
            return nullptr;
        }

        ws2811_led_t *colors;
        colors = (ws2811_led_t *)malloc(sizeof(ws2811_led_t) * colorsArrayLength);
        // help with arrays: https://github.com/nodejs/help/issues/1154#issuecomment-372632449
        for (uint32_t index = 0; index < colorsArrayLength; index++)
        {
            napi_value inputArrayElementValue;
            status = napi_get_element(env, colorsInputArray, index, &inputArrayElementValue);
            if (status != napi_ok)
            {
                char errorMessage[1024];
                snprintf(errorMessage, 1024, "Failed to get colors array element at index %d", index);
                napi_throw_error(env, NULL, errorMessage);
                return nullptr;
            }

            uint32_t elementColor;
            status = napi_get_value_uint32(env, inputArrayElementValue, &elementColor);
            if (status != napi_ok)
            {
                char errorMessage[1024];
                snprintf(errorMessage, 1024, "Failed to convert colors array element at index %d into uint32.", index);
                napi_throw_error(env, NULL, errorMessage);
                return nullptr;
            }
            colors[index] = (ws2811_led_t)elementColor;
        }

        return colors;
    }

    napi_value drawFrameCallback(napi_env env, napi_callback_info info)
    {

        napi_value DrawFrameReturnValue;
        napi_status status;

        size_t argc = 1;
        napi_value argv[1];
        status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to retrieve arguments given to drawFrameCallback.");
            return nullptr;
        }

        if (initWidth == 0 || initHeight == 0)
        {
            napi_throw_error(env, NULL, "Matrix must be initialized before calling drawFrame.");
            return nullptr;
        }

        ws2811_led_t *colors = convertToColorArray(env, initWidth, initHeight, argv[0]);

        const bool drawFrameResult = ledDrawFrame(colors);

        free(colors);

        status = napi_get_boolean(env, drawFrameResult, &DrawFrameReturnValue);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to convert drawFrame result into boolean.");
            return nullptr;
        }
        return DrawFrameReturnValue;
    }

    napi_value drawStillCallback(napi_env env, napi_callback_info info)
    {
        napi_value drawStillReturnValue;
        napi_status status;

        size_t argc = 4;
        napi_value argv[4];
        status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to retrieve arguments given to drawStillCallback.");
            return nullptr;
        }

        uint32_t width;
        status = napi_get_value_uint32(env, argv[0], &width);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to converted first argument (width) into uint32.");
            return nullptr;
        }

        uint32_t height;
        status = napi_get_value_uint32(env, argv[1], &height);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to convert second argument (height) into uint32.");
            return nullptr;
        }

        // node api does not have napi_get_value_uint8 so we start with uint32 and then cast to uint8
        uint32_t brightness32;
        status = napi_get_value_uint32(env, argv[2], &brightness32);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to convert third argument (brightness) into uint32.");
            return nullptr;
        }
        uint8_t brightness = (uint8_t)brightness32;

        ws2811_led_t *colors = convertToColorArray(env, width, height, argv[3]);

        const bool drawStillResult = drawStill(height, width, brightness, colors);

        free(colors);

        status = napi_get_boolean(env, drawStillResult, &drawStillReturnValue);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to convert drawStill result into boolean.");
            return nullptr;
        }
        return drawStillReturnValue;
    }

    // helper places
    // https://github.com/yubin1026/napi_ffmpeg/blob/97968685af791d84ae02f206ed3a0bb407e64d49/src/napi_ffmpeg.c
    // https://nodejs.org/docs/latest-v16.x/api/n-api.html#napi_get_cb_info
    napi_value initMatrixCallback(napi_env env, napi_callback_info info)
    {
        napi_value matrixInitReturnValue;
        napi_status status;

        size_t argc = 3;
        napi_value argv[3];
        status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to retrieve arguments given to initMatrixCallback.");
            return nullptr;
        }

        uint32_t width;
        status = napi_get_value_uint32(env, argv[0], &width);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to converted first argument (width) into uint32.");
            return nullptr;
        }
        initWidth = width;

        uint32_t height;
        status = napi_get_value_uint32(env, argv[1], &height);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to convert second argument (height) into uint32.");
            return nullptr;
        }
        initHeight = height;

        // node api does not have napi_get_value_uint8 so we start with uint32 and then cast to uint8
        uint32_t brightness32;
        status = napi_get_value_uint32(env, argv[2], &brightness32);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to convert third argument (brightness) into uint32.");
            return nullptr;
        }
        uint8_t brightness = (uint8_t)brightness32;

        const bool initMatrixResult = ledInit(height, width, brightness);

        status = napi_get_boolean(env, initMatrixResult, &matrixInitReturnValue);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to convert ledInit result into boolean.");
            return nullptr;
        }
        return matrixInitReturnValue;
    }

    napi_value initModuleApi(napi_env env, napi_value exports)
    {
        napi_status status;
        napi_value cleanUpFunction;
        napi_value drawFrameFunction;
        napi_value drawStillFunction;
        napi_value initMatrixFunction;
        // napi_value testFunction;

        status = napi_create_function(env, nullptr, 0, cleanUpCallback, nullptr, &cleanUpFunction);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to create function for cleanUpCallback.");
            return nullptr;
        }

        status = napi_set_named_property(env, exports, "cleanUp", cleanUpFunction);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to attach cleanUp to exports.");
            return nullptr;
        }

        status = napi_create_function(env, nullptr, 0, initMatrixCallback, nullptr, &initMatrixFunction);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to create function for initMatrixCallback.");
            return nullptr;
        }

        status = napi_set_named_property(env, exports, "initMatrix", initMatrixFunction);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to attach initMatrix to exports.");
            return nullptr;
        }

        status = napi_create_function(env, nullptr, 0, drawStillCallback, nullptr, &drawStillFunction);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to create function for drawStillCallback.");
            return nullptr;
        }

        status = napi_set_named_property(env, exports, "drawStill", drawStillFunction);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to attach drawStill to exports.");
            return nullptr;
        }

        status = napi_create_function(env, nullptr, 0, drawFrameCallback, nullptr, &drawFrameFunction);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to create function for drawFrameCallback.");
            return nullptr;
        }

        status = napi_set_named_property(env, exports, "drawFrame", drawFrameFunction);
        if (status != napi_ok)
        {
            napi_throw_error(env, NULL, "Failed to attach drawFrame to exports.");
            return nullptr;
        }

        return exports;
    }

    NAPI_MODULE(NODE_GYP_MODULE_NAME, initModuleApi)

}