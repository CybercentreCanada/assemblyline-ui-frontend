//*****************************************************************************************
// Constants
//*****************************************************************************************

/** Available background modes for the image viewer. */
export const APP_CAROUSEL_BACKGROUND_ORDER = ['transparent', 'light', 'dark'] as const;

/** Minimum image display size in rem. */
export const APP_CAROUSEL_MIN_IMAGE_SIZE_REM = 4;

/** Height of the bottom navigation bar. */
export const APP_CAROUSEL_NAV_BAR_HEIGHT = 'min(128px, 30vw, 30vh)';

/** Thumbnail display size. */
export const APP_CAROUSEL_IMAGE_SIZE = `min(${APP_CAROUSEL_MIN_IMAGE_SIZE_REM}rem, 30vw, 30vh)`;

/** CSS class applied to elements when zooming. */
export const APP_CAROUSEL_ZOOM_CLASS = 'zooming';

//*****************************************************************************************
// Types
//*****************************************************************************************

/** Background display mode for images. */
export type AppCarouselBackgroundMode = (typeof APP_CAROUSEL_BACKGROUND_ORDER)[number];

/** Drag tracking state for mouse interactions. */
export type AppCarouselDragging = {
  /** Whether the mouse is currently pressed. */
  isDragging?: boolean;
  /** Whether the mouse button is pressed down. */
  isDown: boolean;
  /** Scroll left position at drag start. */
  scrollLeft?: number;
  /** Scroll top position at drag start. */
  scrollTop?: number;
  /** X coordinate at drag start. */
  startX?: number;
  /** Y coordinate at drag start. */
  startY?: number;
};
