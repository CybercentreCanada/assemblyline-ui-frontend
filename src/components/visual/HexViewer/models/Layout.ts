import { Dispatch, SetStateAction } from 'react';

export type LayoutType = 'page' | 'fullscreen';
export type BodyType = 'container' | 'list' | 'table';

export type LayoutState = {
  layoutRows?: number;
  layoutAutoRows?: boolean;
  layoutColumns?: number;
  layoutAutoColumns?: boolean;
  layoutType?: LayoutType;
  bodyType?: BodyType;
};

export type LayoutDispatch = {
  setLayoutRows?: Dispatch<SetStateAction<number>>;
  setLayoutAutoRows?: Dispatch<SetStateAction<boolean>>;
  setLayoutColumns?: Dispatch<SetStateAction<number>>;
  setLayoutAutoColumns?: Dispatch<SetStateAction<boolean>>;
  setLayoutType?: Dispatch<SetStateAction<LayoutType>>;
  setBodyType?: Dispatch<SetStateAction<BodyType>>;
};

export type LayoutContext = {
  setLayoutRows?: (value: number) => void;
  setLayoutColumns?: (value: number) => void;
  setLayoutAutoRows?: (value: boolean) => void;
  setLayoutAutoColumns?: (value: boolean) => void;
  setLayoutType?: (value: LayoutType) => void;
  setBodyType?: (value: BodyType) => void;
};

export const DEFAULT_LAYOUT: LayoutState = {
  layoutColumns: 0,
  layoutRows: 0,
  layoutAutoColumns: true,
  layoutAutoRows: true,
  layoutType: 'page',
  bodyType: 'table'
};


export const LAYOUT_SIZE = {
  windowHeight: 350,
  rowHeight: 22.3958,
  offsetWidth: 73.5833,
  hexWidth: 21.8958,
  textWidth: 12.9479,
  spacingWidth: 10
};

export const COLUMNS = [
  { width: 4750, columns: 128 },
  { width: 4160, columns: 112 },
  { width: 3590, columns: 96 },
  { width: 3015, columns: 80 },
  { width: 2450, columns: 64 },
  { width: 1870, columns: 48 },
  { width: 1290, columns: 32 },
  { width: 1000, columns: 24 },
  { width: 860, columns: 20 },
  { width: 715, columns: 16 },
  { width: 575, columns: 12 },
  { width: 425, columns: 8 },
  { width: 285, columns: 4 },
  { width: 0, columns: 0 }
];
