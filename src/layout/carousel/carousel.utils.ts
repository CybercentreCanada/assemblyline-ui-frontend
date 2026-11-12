import type { Theme } from '@mui/material';
import type { AppCarouselBackgroundMode } from 'layout/carousel';
import { APP_CAROUSEL_BACKGROUND_ORDER } from 'layout/carousel';

//*****************************************************************************************
// Background Colors
//*****************************************************************************************

/**
 * @name getAppCarouselBackgroundColor
 * @description Resolves the carousel image background color for the selected display mode.
 * @param mode - Background display mode
 * @param theme - Active Material UI theme
 * @returns CSS background color value
 */
export const getAppCarouselBackgroundColor = (mode: AppCarouselBackgroundMode, theme: Theme): string => {
  switch (mode) {
    case 'light':
      return theme.palette.grey[100];
    case 'dark':
      return theme.palette.grey[900];
    default:
      return 'transparent';
  }
};

//*****************************************************************************************
// Carousel State
//*****************************************************************************************

/**
 * @name resetAppCarouselState
 * @description Resets the transient carousel state and closes the carousel.
 * @param store - Mutable application interface store.
 * @returns The updated application interface store.
 */
export const resetAppCarouselState = (store: AppInterfaceStore): AppInterfaceStore => {
  store.carousel.index = 0;
  store.carousel.images = [];
  store.carousel.isZooming = false;
  store.carousel.open = false;
  store.carousel.zoom = 100;
  return store;
};

/**
 * @name updateAppCarouselIndex
 * @description Moves the selected carousel image by one direction with wraparound.
 * @param store - Mutable application interface store.
 * @param direction - Previous (-1) or next (1) image direction.
 * @returns The updated application interface store.
 */
export const updateAppCarouselIndex = (store: AppInterfaceStore, direction: -1 | 1): AppInterfaceStore => {
  if (store.carousel.images.length > 1 && !store.carousel.isZooming) {
    store.carousel.index =
      (store.carousel.index + direction + store.carousel.images.length) % store.carousel.images.length;
  }
  return store;
};

/**
 * @name toggleAppCarouselZoom
 * @description Toggles carousel zoom mode and resets the zoom level.
 * @param store - Mutable application interface store.
 * @returns The updated application interface store.
 */
export const toggleAppCarouselZoom = (store: AppInterfaceStore): AppInterfaceStore => {
  store.carousel.isZooming = !store.carousel.isZooming;
  store.carousel.zoom = 100;
  return store;
};

/**
 * @name updateAppCarouselZoom
 * @description Adjusts the carousel zoom level within its supported range.
 * @param store - Mutable application interface store.
 * @param value - Requested zoom level.
 * @returns The updated application interface store.
 */
export const updateAppCarouselZoom = (store: AppInterfaceStore, value: number): AppInterfaceStore => {
  store.carousel.zoom = Math.round(Math.min(Math.max(value, 10), 500));
  return store;
};

/**
 * @name cycleAppCarouselBackgroundMode
 * @description Advances the carousel background mode to the next configured mode.
 * @param store - Mutable application interface store.
 * @returns The updated application interface store.
 */
export const cycleAppCarouselBackgroundMode = (store: AppInterfaceStore): AppInterfaceStore => {
  const backgroundIndex = APP_CAROUSEL_BACKGROUND_ORDER.indexOf(store.carousel.backgroundMode);
  store.carousel.backgroundMode =
    APP_CAROUSEL_BACKGROUND_ORDER[(backgroundIndex + 1) % APP_CAROUSEL_BACKGROUND_ORDER.length];
  return store;
};
