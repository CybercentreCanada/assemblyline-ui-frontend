# layout/carousel

Full-screen image carousel/lightbox modal. Supports multi-image navigation, zoom/pan with drag, configurable background modes, keyboard controls, and lazy image fetching via the API.

## Responsibilities

- Full-screen modal overlay for image viewing
- Multi-image navigation with thumbnail bar
- Zoom and pan with drag gesture support
- Background mode cycling (transparent, light, dark)
- Keyboard controls (arrow keys for navigation, Escape to close)
- Lazy image loading from API endpoints
- Context provider for carousel state across the component tree

## Key Files

- `carousel.providers.tsx` — `AppCarouselProvider`, `AppCarouselContext`, `useAppCarousel` context setup
- `carousel.hooks.tsx` — `useAppCarouselState` (open/close, index, images), `useBackgroundMode` (mode cycling), `useCarouselKeyboard` (key bindings), `useImageFetch` (lazy API loading)
- `carousel.models.ts` — Type definitions (`AppCarouselContextProps`, `BackgroundMode`, `CarouselContainerProps`, `CarouselItemProps`, `Dragging`)
- `carousel.components.tsx` — UI components (`CarouselContainer`, `CarouselItem`)
- `index.ts` — Public API barrel exports

## Constants

- `BACKGROUND_ORDER` — Cycle order for background modes
- `IMAGE_SIZE` — Default rendered image dimensions
- `MIN_IMAGE_SIZE_REM` — Minimum image size constraint
- `NAV_BAR_HEIGHT` — Thumbnail navigation bar height
- `ZOOM_CLASS` — CSS class applied during zoom

## Usage

```typescript
import { useAppCarousel } from 'layout/carousel';

const { open } = useAppCarousel();

// Open carousel with a list of images, starting at index 0
open({ images: ['/api/v4/file/abc/image.png'], startIndex: 0 });
```

## Interaction

- **Drag** — Click and drag to pan when zoomed in
- **Scroll** — Mouse wheel to zoom in/out
- **Arrows** — Left/Right arrow keys navigate between images
- **Escape** — Closes the carousel
- **Background toggle** — Click background mode button to cycle through transparent → light → dark
