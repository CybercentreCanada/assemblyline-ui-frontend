import { TypesConfig } from '..';

export type ScrollType = 'top' | 'middle' | 'bottom' | 'include' | 'includeMiddle' | 'smart';

export type ScrollTypes = ScrollType;

export type ScrollState = {
  scroll: {
    index: number;
    rowIndex: number;
    maxRowIndex: number;
    lastRowIndex: number;
    speed: number;
    overscanCount: number;
    type: ScrollType;
    touchScroll: {
      startTouchScreenY: number;
      prevTouchDistance: number;
    };
  };
  cellsRendered: {
    overscanStartRowIndex: number;
    overscanStopRowIndex: number;
    visibleStartRowIndex: number;
    visibleStopRowIndex: number;

    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  };
};

export const SCROLL_STATE: ScrollState = {
  scroll: {
    index: 0,
    rowIndex: 0,
    maxRowIndex: 1,
    lastRowIndex: 1,
    speed: 3,
    overscanCount: 20,
    type: 'top',
    touchScroll: {
      startTouchScreenY: 0,
      prevTouchDistance: 0
    }
  },
  cellsRendered: {
    overscanStartRowIndex: 0,
    overscanStopRowIndex: 0,
    visibleStartRowIndex: 0,
    visibleStopRowIndex: 0,

    overscanStartIndex: 0,
    overscanStopIndex: 0,
    visibleStartIndex: 0,
    visibleStopIndex: 0
  }
};

export const SCROLL_TYPES: TypesConfig<ScrollState, ScrollTypes> = {
  scroll: {
    type: [
      {
        value: 0,
        type: 'top',
        label: { en: 'top', fr: 'top' },
        description: { en: 'top', fr: 'top' }
      },
      {
        value: 1,
        type: 'middle',
        label: { en: 'middle', fr: 'middle' },
        description: { en: 'middle', fr: 'middle' }
      },
      {
        value: 2,
        type: 'bottom',
        label: { en: 'bottom', fr: 'bottom' },
        description: { en: 'bottom', fr: 'bottom' }
      },
      {
        value: 3,
        type: 'include',
        label: { en: 'include', fr: 'include' },
        description: { en: 'include', fr: 'include' }
      },
      {
        value: 4,
        type: 'includeMiddle',
        label: { en: 'includeMiddle', fr: 'includeMiddle' },
        description: { en: 'includeMiddle', fr: 'includeMiddle' }
      },
      {
        value: 5,
        type: 'smart',
        label: { en: 'smart', fr: 'smart' },
        description: { en: 'smart', fr: 'smart' }
      }
    ]
  }
};
