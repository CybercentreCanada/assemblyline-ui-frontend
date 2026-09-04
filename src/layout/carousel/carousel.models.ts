import type { Image } from 'models/base/result_body';

//*****************************************************************************************
// Constants
//*****************************************************************************************

/** Available background modes for the image viewer. */
export const BACKGROUND_ORDER = ['transparent', 'light', 'dark'] as const;

/** Minimum image display size in rem. */
export const MIN_IMAGE_SIZE_REM = 4;

/** Height of the bottom navigation bar. */
export const NAV_BAR_HEIGHT = 'min(128px, 30vw, 30vh)';

/** Thumbnail display size. */
export const IMAGE_SIZE = `min(${MIN_IMAGE_SIZE_REM}rem, 30vw, 30vh)`;

/** CSS class applied to elements when zooming. */
export const ZOOM_CLASS = 'zooming';

//*****************************************************************************************
// Types
//*****************************************************************************************

/** Background display mode for images. */
export type BackgroundMode = (typeof BACKGROUND_ORDER)[number];

/** Drag tracking state for mouse interactions. */
export type Dragging = {
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

/** Props for the CarouselContainer component. */
export type CarouselContainerProps = {
  /** Array of images to display. */
  images: Image[];
  /** Current image index. */
  index: number;
  /** Callback when the carousel is closed. */
  onClose: () => void;
  /** Whether the carousel modal is open. */
  open: boolean;
  /** Callback to update the current index. */
  setIndex: (value: number | ((prev: number) => number)) => void;
};

/** Props for a single carousel thumbnail item. */
export type CarouselItemProps = {
  /** Alt text for the image. */
  alt: string;
  /** Background display mode. */
  backgroundMode?: BackgroundMode;
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Whether this thumbnail is currently selected. */
  selected?: boolean;
  /** Image source hash/identifier. */
  src: string;
};
