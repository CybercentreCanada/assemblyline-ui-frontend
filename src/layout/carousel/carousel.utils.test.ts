import { createTheme } from '@mui/material';
import { DEFAULT_APP_INTERFACE_STORE } from 'app/core.interface';
import {
  cycleAppCarouselBackgroundMode,
  getAppCarouselBackgroundColor,
  resetAppCarouselState,
  toggleAppCarouselZoom,
  updateAppCarouselIndex,
  updateAppCarouselZoom
} from 'layout/carousel';
import type { Image } from 'models/base/result_body';
import { describe, expect, it } from 'vitest';

const theme = createTheme();
const images: Image[] = [
  { description: 'First image', img: 'first', name: 'First', thumb: 'first-thumb' },
  { description: 'Second image', img: 'second', name: 'Second', thumb: 'second-thumb' }
];

const createStore = (): AppInterfaceStore => ({
  ...structuredClone(DEFAULT_APP_INTERFACE_STORE),
  carousel: {
    ...structuredClone(DEFAULT_APP_INTERFACE_STORE.carousel),
    images: [...images],
    open: true
  }
});

//*****************************************************************************************
// getAppCarouselBackgroundColor
//*****************************************************************************************
describe('getAppCarouselBackgroundColor', () => {
  it('returns the light background color for light mode', () => {
    expect(getAppCarouselBackgroundColor('light', theme)).toBe(theme.palette.grey[100]);
  });

  it('returns the dark background color for dark mode', () => {
    expect(getAppCarouselBackgroundColor('dark', theme)).toBe(theme.palette.grey[900]);
  });

  it('returns transparent for transparent mode', () => {
    expect(getAppCarouselBackgroundColor('transparent', theme)).toBe('transparent');
  });
});

//*****************************************************************************************
// Carousel State
//*****************************************************************************************
describe('carousel state utilities', () => {
  it('resets and closes the carousel', () => {
    const store = createStore();
    store.carousel.index = 1;
    store.carousel.isZooming = true;
    store.carousel.zoom = 250;

    expect(resetAppCarouselState(store)).toBe(store);
    expect(store.carousel).toMatchObject({ index: 0, images: [], isZooming: false, open: false, zoom: 100 });
  });

  it('moves the selected image with wraparound', () => {
    const store = createStore();

    updateAppCarouselIndex(store, -1);
    expect(store.carousel.index).toBe(1);

    updateAppCarouselIndex(store, 1);
    expect(store.carousel.index).toBe(0);
  });

  it('does not move while zooming or with a single image', () => {
    const store = createStore();
    store.carousel.isZooming = true;

    updateAppCarouselIndex(store, 1);
    expect(store.carousel.index).toBe(0);

    store.carousel.isZooming = false;
    store.carousel.images = [images[0]];
    updateAppCarouselIndex(store, 1);
    expect(store.carousel.index).toBe(0);
  });

  it('toggles zoom and resets the zoom level', () => {
    const store = createStore();
    store.carousel.zoom = 250;

    toggleAppCarouselZoom(store);
    expect(store.carousel).toMatchObject({ isZooming: true, zoom: 100 });
  });

  it('clamps zoom to the supported range', () => {
    const store = createStore();

    updateAppCarouselZoom(store, 0);
    expect(store.carousel.zoom).toBe(10);

    updateAppCarouselZoom(store, 501);
    expect(store.carousel.zoom).toBe(500);

    updateAppCarouselZoom(store, 125.6);
    expect(store.carousel.zoom).toBe(126);
  });

  it('cycles through the configured background modes', () => {
    const store = createStore();

    cycleAppCarouselBackgroundMode(store);
    expect(store.carousel.backgroundMode).toBe('light');

    cycleAppCarouselBackgroundMode(store);
    expect(store.carousel.backgroundMode).toBe('dark');

    cycleAppCarouselBackgroundMode(store);
    expect(store.carousel.backgroundMode).toBe('transparent');
  });
});
