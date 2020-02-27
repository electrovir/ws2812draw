/**
 * Color examples.
 * The format is WWBBGGRR. WW is unused.
 * These directly affect the brightness of each colored LED. Thus, if you turn these values way up, the lights will be,
 * in general, brighter. There's a direct impact on how effective the brightness parameter is. For example, low color
 * values here might not even show up if the brightness is too low.
 * These colors are picked so that they'll mostly even out at higher brightnesses but they may not be unique in
 * lower brightness. For example, at brightness 7 ORANGE and RED look the same.
 */
export enum LedColor {
    BLACK /*         */ = 0x00000000,
    RED /*           */ = 0x00000020,
    ORANGE /*        */ = 0x00000720,
    YELLOW /*        */ = 0x00001720,
    YELLOW_GREEN /*  */ = 0x00002010,
    GREEN /*         */ = 0x00002000,
    TURQUOISE /*     */ = 0x00052000,
    CYAN /*          */ = 0x00171700,
    LIGHT_BLUE /*    */ = 0x00200700,
    BLUE /*          */ = 0x00200000,
    VIOLET /*        */ = 0x00200007,
    PINK /*          */ = 0x00170017,
    MAGENTA /*       */ = 0x00070020,
    WHITE /*         */ = 0x00070707,
}
