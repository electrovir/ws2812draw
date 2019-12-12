#ifndef __MATRIX_CONTROL_H__
#define __MATRIX_CONTROL_H__

#include <stdint.h>
#include <stdbool.h>
#include "ws2811.h"

bool drawStill(uint32_t height, uint32_t width, uint8_t brightness, ws2811_led_t* colors);
bool ledInit(uint32_t passedHeight, uint32_t passedWidth, uint8_t brightness);
void ledCleanUp();
bool ledDrawFrame(ws2811_led_t* colors);
    
#endif /* __MATRIX_CONTROL_H__ */
