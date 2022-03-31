#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#include "matrix-control.h"
#include "ws2811.h"

#define TARGET_FREQ WS2811_TARGET_FREQ
#define GPIO_PIN 18
#define DMA 10
#define STRIP_TYPE WS2811_STRIP_GBR

ws2811_t ledInterface = {
    .freq = TARGET_FREQ,
    .dmanum = DMA,
    .channel = {
        [0] = {
            .gpionum = GPIO_PIN,
            .count = 0,
            .invert = 0,
            .brightness = 0,
            .strip_type = STRIP_TYPE,
        },
        [1] = {
            .gpionum = 0,
            .count = 0,
            .invert = 0,
            .brightness = 0,
        },
    },
};

dimensions_t initDimensions = (dimensions_t){
    .width = 0,
    .height = 0,
};

bool initialized = false;

dimensions_t getInitializedDimensions()
{
    return initDimensions;
}

static void insertColors(ws2811_led_t *colors)
{
    for (uint32_t x = 0; x < initDimensions.width; x++)
    {
        for (uint32_t y = 0; y < initDimensions.height; y++)
        {
            uint32_t yIndex = x % 2 ? y : initDimensions.height - y - 1;
            uint32_t xIndex = initDimensions.width - x - 1;
            ledInterface.channel[0].leds[y + x * initDimensions.height] = colors[yIndex * initDimensions.width + xIndex];
        }
    }
}

bool ledInit(dimensions_t dimensions, uint8_t brightness)
{
    if (initialized)
    {
        return true;
    }

    initDimensions = dimensions;

    ledInterface.channel[0].brightness = brightness;
    ledInterface.channel[0].count = dimensions.height * dimensions.width;

    ws2811_return_t initResult;
    if ((initResult = ws2811_init(&ledInterface)) != WS2811_SUCCESS)
    {
        fprintf(stderr, "ws2811_init failed: %s\n", ws2811_get_return_t_str(initResult));
        return false;
    }
    initialized = true;
    return true;
}

bool ledDrawFrame(ws2811_led_t *colors)
{
    if (initialized)
    {
        insertColors(colors);
        ws2811_render(&ledInterface);
        return true;
    }
    else
    {
        return false;
    }
}

bool ledCleanUp()
{
    ws2811_fini(&ledInterface);
    initialized = false;

    return true;
}

bool drawStill(dimensions_t dimensions, uint8_t brightness, ws2811_led_t *colors)
{
    if (initialized)
    {
        // start with a clean slate in case any of the init settings change
        ledCleanUp();
    }

    bool initSuccess = ledInit(dimensions, brightness);
    if (!initSuccess)
    {
        return false;
    }
    bool drawSuccess = ledDrawFrame(colors);
    if (!drawSuccess)
    {
        return false;
    }
    return true;
}