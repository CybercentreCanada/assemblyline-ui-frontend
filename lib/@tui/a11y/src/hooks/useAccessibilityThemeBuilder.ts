import type { AppThemeConfigs } from '@tui/core';
import { useMemo } from 'react';
import type { AppAccessibilityPreferences } from '../configs/AppAccessibilityPreferences';
import type { AppAccessibilityStates } from '../configs/AppAccessibilityStates';
import { useAppAccessibilityPreferences } from './useAppAccessibilityPreferences';
import { useAppAccessibilityStates } from './useAppAccessibilityStates';

export const buildThemeOverride = (
  accessibilityStates?: AppAccessibilityStates,
  accessibilityPreferences?: AppAccessibilityPreferences
): Partial<AppThemeConfigs> => ({
  global: {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // disable all transitions and animations when 'paused'
          ...(accessibilityPreferences?.enableAccessibility &&
          accessibilityPreferences?.enableAnimation &&
          accessibilityStates?.animation === 'pause'
            ? {
                '*, *::before, *::after': {
                  transition: 'none !important',
                  animation: 'none !important'
                }
              }
            : {})
        }
      },
      // disable button ripple animation when 'paused'
      ...(accessibilityPreferences?.enableAccessibility &&
      accessibilityPreferences?.enableAnimation &&
      accessibilityStates?.animation === 'pause'
        ? {
            MuiButtonBase: {
              defaultProps: {
                disableRipple: true // No more ripple, on the whole application
              }
            }
          }
        : {}),
      // adjust tooltip leave delay
      ...(accessibilityPreferences?.enableAccessibility && accessibilityPreferences?.enableTooltipLeaveDelay
        ? {
            MuiTooltip: {
              defaultProps: {
                leaveDelay: accessibilityStates?.getTooltipLeaveDelay()
              }
            }
          }
        : {})
    },
    typography: {
      ...{
        allVariants: {
          ...(accessibilityPreferences?.enableAccessibility &&
          accessibilityPreferences?.enableTextAlignment &&
          accessibilityStates?.getTextAlign()
            ? { textAlign: accessibilityStates?.getTextAlign() }
            : {}),
          ...(accessibilityPreferences?.enableAccessibility &&
          accessibilityPreferences?.enableTextSize &&
          accessibilityStates?.getTextSize()
            ? { fontSize: accessibilityStates?.getTextSize() }
            : {}),
          ...(accessibilityPreferences?.enableAccessibility &&
          accessibilityPreferences?.enableLineHeight &&
          accessibilityStates?.getLineHeight()
            ? { lineHeight: accessibilityStates?.getLineHeight() }
            : {}),
          ...(accessibilityPreferences?.enableAccessibility &&
          accessibilityPreferences?.enableTextSpacing &&
          accessibilityStates?.getTextSpacing()
            ? { letterSpacing: accessibilityStates?.getTextSpacing() }
            : {})
        }
      }
    }
  }
});

export default function useAccessibilityThemeBuilder() {
  const accessibilityStates = useAppAccessibilityStates();
  const accessibilityPreferences = useAppAccessibilityPreferences();

  return useMemo(
    () => buildThemeOverride(accessibilityStates, accessibilityPreferences),
    [accessibilityStates, accessibilityPreferences]
  );
}
