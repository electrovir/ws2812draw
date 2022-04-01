#ifndef __MATRIX_CONTROL_H__
#define __MATRIX_CONTROL_H__

#ifdef __cplusplus
extern "C"
{
#endif

#include <stdint.h>
#include <stdbool.h>
#include "ws2811.h"

    typedef struct
    {
        uint32_t width;
        uint32_t height;
    } dimensions_t;

    bool drawStill(dimensions_t dimensions, uint8_t brightness, ws2811_led_t *colors);
    bool ledInit(dimensions_t dimensions, uint8_t brightness);
    bool ledCleanUp();
    bool ledDrawFrame(ws2811_led_t *colors);
    dimensions_t getInitializedDimensions();

#ifdef __cplusplus
}
#endif

#endif /* __MATRIX_CONTROL_H__ */
