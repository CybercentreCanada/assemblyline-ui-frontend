import { default as React, useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useStore } from '..';
import { DEFAULT_MODE, ModeLanguage, ModeTheme, ModeWidth } from '../models/Mode';

export type ModeContextProps = {
  nextModeTheme?: React.MutableRefObject<ModeTheme>;
  nextModeLanguage?: React.MutableRefObject<ModeLanguage>;
  nextModeWidth?: React.MutableRefObject<ModeWidth>;
  onModeThemeChange?: (modeTheme: ModeTheme) => void;
  onModeLanguageChange?: (modeLanguage: ModeLanguage) => void;
  onModeWidthChange?: (modeWidth: ModeWidth) => void;
};

export const ModeContext = React.createContext<ModeContextProps>(null);

export const WrappedModeProvider = ({ children }: HexProps) => {
  const { setModeTheme, setModeLanguage, setModeWidth } = useStore();

  const nextModeTheme = useRef<ModeTheme>(DEFAULT_MODE.modeTheme);
  const nextModeLanguage = useRef<ModeLanguage>(DEFAULT_MODE.modeLanguage);
  const nextModeWidth = useRef<ModeWidth>(DEFAULT_MODE.modeWidth);

  const onModeThemeChange = useCallback(
    (modeTheme: ModeTheme) => {
      nextModeTheme.current = modeTheme;
      setModeTheme(modeTheme);
    },
    [setModeTheme]
  );

  const onModeLanguageChange = useCallback(
    (modeLanguage: ModeLanguage) => {
      nextModeLanguage.current = modeLanguage;
      setModeLanguage(modeLanguage);
    },
    [setModeLanguage]
  );

  const onModeWidthChange = useCallback(
    (modeWidth: ModeWidth) => {
      nextModeWidth.current = modeWidth;
      setModeWidth(modeWidth);
    },
    [setModeWidth]
  );

  return (
    <ModeContext.Provider
      value={{
        nextModeTheme,
        nextModeLanguage,
        nextModeWidth,
        onModeThemeChange,
        onModeLanguageChange,
        onModeWidthChange
      }}
    >
      {useMemo(() => children, [children])}
    </ModeContext.Provider>
  );
};

export const ModeProvider = React.memo(WrappedModeProvider);
export const useMode = (): ModeContextProps => useContext(ModeContext) as ModeContextProps;
