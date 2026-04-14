import { useAppTheme } from '@tui/core';
import { AppAccessibilityReadingCursors } from '../components/AppAccessibilityReadingCursors';
import { AppAccessibilityContext, type AppAccessbilityContextType } from '../configs/AccessibilityContext';
import type { AppAccessibilityPreferences } from '../configs/AppAccessibilityPreferences';
import useAccessibilityThemeBuilder from '../hooks/useAccessibilityThemeBuilder';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AppAccessibilityProviderProps = {
  preferences?: AppAccessibilityPreferences;
  features?: ReactNode[];
  children: ReactNode;
};

const AppAccessibilityThemeComponent = ({ children }: AppAccessibilityProviderProps) => {
  const themeOptions = useAccessibilityThemeBuilder();
  const { setOptionsOverride } = useAppTheme();

  useEffect(() => {
    setOptionsOverride(themeOptions);
  }, [themeOptions, setOptionsOverride]);

  return (
    <>
      {children}
      <AppAccessibilityReadingCursors />
    </>
  );
};

export const AppAccessibilityProvider = ({ children, preferences, features }: AppAccessibilityProviderProps) => {
  // accessibility related states
  const [textSize, setTextSize] = useState<AppAccessbilityContextType['states']['textSize']>('default');
  const [textSpacing, setTextSpacing] = useState<AppAccessbilityContextType['states']['textSpacing']>('default');
  const [textAlign, setTextAlign] = useState<AppAccessbilityContextType['states']['textAlign']>('default');
  const [lineHeight, setLineHeight] = useState<AppAccessbilityContextType['states']['lineHeight']>('default');
  const [cursor, setCursor] = useState<AppAccessbilityContextType['states']['cursor']>('default');
  const [animation, setAnimation] = useState<AppAccessbilityContextType['states']['animation']>('play');
  const [tooltipLeaveDelay, setTooltipLeaveDelay] =
    useState<AppAccessbilityContextType['states']['tooltipLeaveDelay']>('default');

  // Callback to set the text size
  const nextTextSize = useCallback(() => {
    switch (textSize) {
      case 'default':
        setTextSize('sm');
        break;
      case 'sm':
        setTextSize('md');
        break;
      case 'md':
        setTextSize('lg');
        break;
      case 'lg':
        setTextSize('default');
        break;
    }
  }, [textSize]);

  // Callback to calculate current font size
  const getTextSize = useCallback(() => {
    switch (textSize) {
      case 'default':
        return null;
      case 'sm':
        return 18;
      case 'md':
        return 20;
      case 'lg':
        return 22;
    }
  }, [textSize]);

  // Callback to set the text spacing
  const nextTextSpacing = useCallback(() => {
    switch (textSpacing) {
      case 'default':
        setTextSpacing('light');
        break;
      case 'light':
        setTextSpacing('moderate');
        break;
      case 'moderate':
        setTextSpacing('heavy');
        break;
      case 'heavy':
        setTextSpacing('default');
        break;
    }
  }, [textSpacing]);

  const getTextSpacing = useCallback(() => {
    switch (textSpacing) {
      case 'default':
        return null;
      case 'light':
        return '2px';
      case 'moderate':
        return '4px';
      case 'heavy':
        return '8px';
    }
  }, [textSpacing]);

  // Callback to set the text align
  const nextTextAlign = useCallback(() => {
    switch (textAlign) {
      case 'default':
        setTextAlign('alignLeft');
        break;
      case 'alignLeft':
        setTextAlign('alignRight');
        break;
      case 'alignRight':
        setTextAlign('alignCenter');
        break;
      case 'alignCenter':
        setTextAlign('justified');
        break;
      case 'justified':
        setTextAlign('default');
        break;
    }
  }, [textAlign]);

  const getTextAlign = useCallback(() => {
    switch (textAlign) {
      case 'default':
        return null;
      case 'alignLeft':
        return 'left';
      case 'alignRight':
        return 'right';
      case 'alignCenter':
        return 'center';
      case 'justified':
        return 'justify';
    }
  }, [textAlign]);

  // Callback to set the line height
  const nextLineHeight = useCallback(() => {
    switch (lineHeight) {
      case 'default':
        setLineHeight('1.5x');
        break;
      case '1.5x':
        setLineHeight('1.75x');
        break;
      case '1.75x':
        setLineHeight('2x');
        break;
      case '2x':
        setLineHeight('default');
        break;
    }
  }, [lineHeight]);

  const getLineHeight = useCallback(() => {
    switch (lineHeight) {
      case 'default':
        return null;
      case '1.5x':
        return '1.5';
      case '1.75x':
        return '1.75';
      case '2x':
        return '2';
    }
  }, [lineHeight]);

  // Callback to set the cursor
  const nextCursor = useCallback(() => {
    switch (cursor) {
      case 'default':
        setCursor('readingGuide');
        break;
      case 'readingGuide':
        setCursor('readingMask');
        break;
      case 'readingMask':
        setCursor('default');
        break;
    }
  }, [cursor]);

  // Callback to set the animation state
  const toggleAnimation = useCallback(() => setAnimation(_state => (_state === 'play' ? 'pause' : 'play')), []);

  // Callback to set the tooltip delay
  const nextTooltipLeaveDelay = useCallback(() => {
    switch (tooltipLeaveDelay) {
      case 'default':
        setTooltipLeaveDelay('short');
        break;
      case 'short':
        setTooltipLeaveDelay('moderate');
        break;
      case 'moderate':
        setTooltipLeaveDelay('long');
        break;
      case 'long':
        setTooltipLeaveDelay('default');
        break;
    }
  }, [tooltipLeaveDelay]);

  const getTooltipLeaveDelay = useCallback(() => {
    switch (tooltipLeaveDelay) {
      case 'default':
        return 0;
      case 'short':
        return 200;
      case 'moderate':
        return 500;
      case 'long':
        return 1000;
    }
  }, [tooltipLeaveDelay]);

  const resetToDefault = useCallback(() => {
    setTextSize('default');
    setTextSpacing('default');
    setTextAlign('default');
    setLineHeight('default');
    setCursor('default');
    setAnimation('play');
    setTooltipLeaveDelay('default');
  }, []);

  // Memoize context value to prevent unnecessary renders.0
  const context = useMemo(() => {
    return {
      initialized: true,
      preferences,
      features,
      states: {
        textSize,
        textSpacing,
        textAlign,
        lineHeight,
        cursor,
        animation,
        tooltipLeaveDelay,
        nextTextSize,
        nextTextSpacing,
        nextTextAlign,
        nextLineHeight,
        nextCursor,
        toggleAnimation,
        resetToDefault,
        getTextSize,
        getTextAlign,
        getLineHeight,
        getTextSpacing,
        nextTooltipLeaveDelay,
        getTooltipLeaveDelay
      }
    } as AppAccessbilityContextType;
  }, [
    preferences,
    features,
    textSize,
    textSpacing,
    textAlign,
    lineHeight,
    cursor,
    animation,
    tooltipLeaveDelay,
    nextTextSize,
    nextTextSpacing,
    nextTextAlign,
    nextLineHeight,
    nextCursor,
    toggleAnimation,
    resetToDefault,
    getTextSize,
    getTextAlign,
    getLineHeight,
    getTextSpacing,
    nextTooltipLeaveDelay,
    getTooltipLeaveDelay
  ]);

  return (
    <AppAccessibilityContext.Provider value={context}>
      <AppAccessibilityThemeComponent>{children}</AppAccessibilityThemeComponent>
    </AppAccessibilityContext.Provider>
  );
};
