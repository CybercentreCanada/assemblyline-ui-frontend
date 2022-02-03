import { Dispatch, SetStateAction } from 'react';

export type ModeTheme = 'light' | 'dark';
export type ModeLanguage = 'en' | 'fr';
export type ModeWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'wd';
export type ModeHeight = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'wd';

export type ModeState = {
  modeTheme?: ModeTheme;
  modeLanguage?: ModeLanguage;
  modeWidth?: ModeWidth;
  modeHeight?: ModeHeight;
};

export type ModeDispatch = {
  setModeTheme?: Dispatch<SetStateAction<ModeTheme>>;
  setModeLanguage?: Dispatch<SetStateAction<ModeLanguage>>;
  setModeWidth?: Dispatch<SetStateAction<ModeWidth>>;
  setModeHeight?: Dispatch<SetStateAction<ModeHeight>>;
};

export type ModeContext = {
  setModeTheme?: (value: ModeTheme) => void;
  setModeLanguage?: (value: ModeLanguage) => void;
  setModeWidth?: (value: ModeWidth) => void;
  setModeHeight?: (value: ModeHeight) => void;
};

export const DEFAULT_MODE: ModeState = {
  modeTheme: 'light',
  modeLanguage: 'en',
  modeWidth: 'md',
  modeHeight: 'md'
};
