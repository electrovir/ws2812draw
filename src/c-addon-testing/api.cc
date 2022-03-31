#include <stdint.h>
#include <stdlib.h>
#include <cstdio>
#include <string>
#include <node_api.h>
#include "matrix-control.h"

extern "C"
{
#include "pcm.h"
#include "clk.h"
#include "gpio.h"
#include "dma.h"
#include "pwm.h"
}

namespace ws2812drawCApi
{

    bool didFail(napi_env env, napi_status status, const char *failureMessage)
    {
        if (status == napi_ok)
        {
            return false;
        }
        else
        {
            napi_throw_error(env, NULL, failureMessage);
            return true;
        }
    }

    napi_value cleanUpCallback(napi_env env, napi_callback_info info)
    {
        napi_value ledCleanUpReturnValue;
        napi_status status;

        const bool ledCleanUpResult = ledCleanUp();

        status = napi_get_boolean(env, ledCleanUpResult, &ledCleanUpReturnValue);
        if (didFail(env, status, "Failed to convert clean up result to boolean."))
        {
            return nullptr;
        }

        return ledCleanUpReturnValue;
    }

    uint8_t convertBrightness(napi_env env, napi_value argValue)
    {
        napi_status status;
        // node api does not have napi_get_value_uint8 so we start with uint32 and then cast to uint8
        uint32_t brightness32;
        status = napi_get_value_uint32(env, argValue, &brightness32);
        if (didFail(env, status, "Failed to convert brightness argument into uint32."))
        {
            return 0;
        }
        uint8_t brightness8 = (uint8_t)brightness32;

        return brightness8;
    }

    ws2811_led_t *convertToColorArray(napi_env env, dimensions_t dimensions, napi_value colorsInputArray)
    {
        napi_status status;

        uint32_t colorsArrayLength;
        status = napi_get_array_length(env, colorsInputArray, &colorsArrayLength);
        if (didFail(env, status, "Failed to get array length of input colors array."))
        {
            return nullptr;
        }

        if (colorsArrayLength != dimensions.height * dimensions.width)
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
                std::string errorMessage = "Failed to get colors array element at index " + std::to_string(index) + ".";
                napi_throw_error(env, NULL, errorMessage.c_str());
                return nullptr;
            }

            uint32_t elementColor;
            status = napi_get_value_uint32(env, inputArrayElementValue, &elementColor);
            if (status != napi_ok)
            {
                std::string errorMessage = "Failed to convert colors array element at index " + std::to_string(index) + " into uint32.";
                napi_throw_error(env, NULL, errorMessage.c_str());
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
        if (didFail(env, status, "Failed to retrieve arguments given to drawFrameCallback."))
        {
            return nullptr;
        }

        dimensions_t initDimensions = getInitializedDimensions();

        ws2811_led_t *colors = convertToColorArray(env, initDimensions, argv[0]);

        const bool drawFrameResult = ledDrawFrame(colors);

        free(colors);

        if (!drawFrameResult)
        {
            napi_throw_error(env, NULL, "drawFrame failed: must call initMatrix first.");
            return nullptr;
        }

        status = napi_get_boolean(env, drawFrameResult, &DrawFrameReturnValue);
        if (didFail(env, status, "Failed to convert drawFrame result into boolean."))
        {
            return nullptr;
        }
        return DrawFrameReturnValue;
    }

    dimensions_t getDimensionArgs(napi_env env, napi_value argv[2])
    {
        napi_status status;
        uint32_t width = 0;
        status = napi_get_value_uint32(env, argv[0], &width);
        if (didFail(env, status, "Failed to converted first argument (width) into uint32."))
        {
        }

        uint32_t height = 0;
        status = napi_get_value_uint32(env, argv[1], &height);
        if (didFail(env, status, "Failed to convert second argument (height) into uint32."))
        {
        }

        return {
            width,
            height,
        };
    }

    napi_value drawStillCallback(napi_env env, napi_callback_info info)
    {
        napi_value drawStillReturnValue;
        napi_status status;

        size_t argc = 4;
        napi_value argv[4];
        status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
        if (didFail(env, status, "Failed to retrieve arguments given to drawStillCallback."))
        {
            return nullptr;
        }

        dimensions_t dimensions = getDimensionArgs(env, argv);

        uint8_t brightness = convertBrightness(env, argv[2]);

        ws2811_led_t *colors = convertToColorArray(env, dimensions, argv[3]);

        const bool drawStillResult = drawStill(dimensions, brightness, colors);

        free(colors);

        status = napi_get_boolean(env, drawStillResult, &drawStillReturnValue);
        if (didFail(env, status, "Failed to convert drawStill result into boolean."))
        {
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
        if (didFail(env, status, "Failed to retrieve arguments given to initMatrixCallback."))
        {
            return nullptr;
        }

        dimensions_t dimensions = getDimensionArgs(env, argv);

        uint8_t brightness = convertBrightness(env, argv[2]);

        const bool initMatrixResult = ledInit(dimensions, brightness);

        status = napi_get_boolean(env, initMatrixResult, &matrixInitReturnValue);
        if (didFail(env, status, "Failed to convert ledInit result into boolean."))
        {
            return nullptr;
        }
        return matrixInitReturnValue;
    }

    napi_value testCallback(napi_env env, napi_callback_info info)
    {
        napi_value testReturnValue;
        napi_status status;

        std::string testMessage = " clk: " + std::to_string(CM_CLK_CTL_SRC_TSTDBG0) + " gpio: " + std::to_string(GPIO_OFFSET) + " dma: " + std::to_string(PAGE_SIZE) + " tgbw: " + std::to_string(SK6812_STRIP_RGBW);

        status = napi_create_string_utf8(env, testMessage.c_str(), NAPI_AUTO_LENGTH, &testReturnValue);
        if (didFail(env, status, "Failed to create string for testCallback."))
        {
            return nullptr;
        }

        return testReturnValue;
    }

    napi_value initModuleApi(napi_env env, napi_value exports)
    {
        napi_status status;
        napi_value cleanUpFunction;
        napi_value drawFrameFunction;
        napi_value drawStillFunction;
        napi_value initMatrixFunction;
        napi_value testFunction;

        status = napi_create_function(env, nullptr, 0, cleanUpCallback, nullptr, &cleanUpFunction);
        if (didFail(env, status, "Failed to create function for cleanUpCallback."))
        {
            return nullptr;
        }

        status = napi_set_named_property(env, exports, "cleanUp", cleanUpFunction);
        if (didFail(env, status, "Failed to attach cleanUp to exports."))
        {
            return nullptr;
        }

        status = napi_create_function(env, nullptr, 0, initMatrixCallback, nullptr, &initMatrixFunction);
        if (didFail(env, status, "Failed to create function for initMatrixCallback."))
        {
            return nullptr;
        }

        status = napi_set_named_property(env, exports, "initMatrix", initMatrixFunction);
        if (didFail(env, status, "Failed to attach initMatrix to exports."))
        {
            return nullptr;
        }

        status = napi_create_function(env, nullptr, 0, drawStillCallback, nullptr, &drawStillFunction);
        if (didFail(env, status, "Failed to create function for drawStillCallback."))
        {
            return nullptr;
        }

        status = napi_set_named_property(env, exports, "drawStill", drawStillFunction);
        if (didFail(env, status, "Failed to attach drawStill to exports."))
        {
            return nullptr;
        }

        status = napi_create_function(env, nullptr, 0, drawFrameCallback, nullptr, &drawFrameFunction);
        if (didFail(env, status, "Failed to create function for drawFrameCallback."))
        {
            return nullptr;
        }

        status = napi_set_named_property(env, exports, "drawFrame", drawFrameFunction);
        if (didFail(env, status, "Failed to attach drawFrame to exports."))
        {
            return nullptr;
        }

        status = napi_create_function(env, nullptr, 0, testCallback, nullptr, &testFunction);
        if (didFail(env, status, "Failed to create function for testCallback."))
        {
            return nullptr;
        }

        status = napi_set_named_property(env, exports, "test", testFunction);
        if (didFail(env, status, "Failed to attach test to exports."))
        {
            return nullptr;
        }

        return exports;
    }

    NAPI_MODULE(NODE_GYP_MODULE_NAME, initModuleApi)

}