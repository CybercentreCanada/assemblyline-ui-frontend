import { LayoutSize, LayoutState } from '../models/Layout';
import { ModeState } from '../models/Mode';

export const MODE: ModeState = {
  modeTheme: 'light',
  modeLanguage: 'en',
  modeWidth: 'md',
  modeHeight: 'md'
};

// export const HEX: HexState = {
//   hexOffsetBase: 16,
//   hexOffsetSize: 8
// };

export const LAYOUT: LayoutState = {
  layoutColumns: 0,
  layoutRows: 0,
  layoutAutoColumns: true,
  layoutAutoRows: true,
  layoutType: 'page',
  bodyType: 'list'
};

export const LAYOUT_SIZE: LayoutSize = {
  windowHeight: 350,
  rowHeight: 22.3958,
  offsetWidth: 73.5833,
  hexWidth: 21.8958,
  textWidth: 12.9479,
  spacingWidth: 10
};

export const DEFAULT: ModeState & LayoutState & LayoutSize = { ...MODE, ...LAYOUT_SIZE };
