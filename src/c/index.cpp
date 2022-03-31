#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <signal.h>
#include <stdarg.h>
#include <getopt.h>

#include <napi.h>

extern "C"
{
#include "pcm.h"
#include "clk.h"
#include "gpio.h"
#include "dma.h"
#include "pwm.h"
#include "matrix-control.h"
}

#include "ws2811.h"

// converted
// Napi::String test(const Napi::CallbackInfo &info)
// {
//     std::string result = " clk: " + std::to_string(CM_CLK_CTL_SRC_TSTDBG0) + " gpio: " + std::to_string(GPIO_OFFSET) + " dma: " + std::to_string(PAGE_SIZE) + " tgbw: " + std::to_string(SK6812_STRIP_RGBW);
//     return Napi::String::New(info.Env(), result);
// }

// converted
// ws2811_led_t *convertToColors(uint32_t height, uint32_t width, Napi::TypedArray inputArray)
// {
//     ws2811_led_t *colors;
//     colors = (ws2811_led_t *)malloc(sizeof(ws2811_led_t) * height * width);
//     for (uint32_t i = 0; i < height * width; i++)
//     {
//         Napi::Value value = inputArray[i];
//         colors[i] = (ws2811_led_t)value.As<Napi::Number>().Int32Value();
//     }

//     return colors;
// }

// converted
// Napi::Boolean ledDrawStillImage(const Napi::CallbackInfo &info)
// {

//     uint32_t height = (uint32_t)info[0].ToNumber();
//     uint32_t width = (uint32_t)info[1].ToNumber();
//     std::uint8_t brightness = (std::uint8_t)info[2].ToNumber().Int32Value();

//     Napi::TypedArray inputColorMap = info[3].As<Napi::TypedArray>();

//     ws2811_led_t *colors = convertToColors(height, width, inputColorMap);

//     return Napi::Boolean::New(info.Env(), drawStill(height, width, brightness, colors));
// }
//  converted
// Napi::Boolean initMatrix(const Napi::CallbackInfo& info) {
//     uint32_t height = (uint32_t) info[0].ToNumber();
//     uint32_t width = (uint32_t) info[1].ToNumber();
//     std::uint8_t brightness = (std::uint8_t) info[2].ToNumber().Int32Value();

//     return Napi::Boolean::New(info.Env(), ledInit(height, width, brightness));
// }

// converted
// void cleanUp(const Napi::CallbackInfo &info)
// {
//     ledCleanUp();
// }

// converted
// Napi::Boolean drawFrame(const Napi::CallbackInfo &info)
// {
//     uint32_t height = (uint32_t)info[0].ToNumber();
//     uint32_t width = (uint32_t)info[1].ToNumber();
//     Napi::TypedArray inputColorMap = info[2].As<Napi::TypedArray>();
//     ws2811_led_t *colors = convertToColors(height, width, inputColorMap);
//     return Napi::Boolean::New(info.Env(), ledDrawFrame(colors));
// }

// converted
// Napi::Object Init(Napi::Env env, Napi::Object exports)
// {

//     exports.Set(
//         Napi::String::New(env, "test"),
//         Napi::Function::New(env, test));

//     exports.Set(
//         Napi::String::New(env, "drawStill"),
//         Napi::Function::New(env, ledDrawStillImage));

//     exports.Set(
//         Napi::String::New(env, "init"),
//         Napi::Function::New(env, initMatrix));

//     exports.Set(
//         Napi::String::New(env, "cleanUp"),
//         Napi::Function::New(env, cleanUp));

//     exports.Set(
//         Napi::String::New(env, "drawFrame"),
//         Napi::Function::New(env, drawFrame));

//     return exports;
// }

// NODE_API_MODULE(ws2812draw, Init)