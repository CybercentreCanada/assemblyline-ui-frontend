import { useContext, useMemo } from 'react';
import { AppAccessibilityContext } from '../configs/AccessibilityContext';
import { AppDefaultsAccessibilityPreferences } from '../configs/AppAccessibilityDefaults';
import type { AppAccessibilityPreferences } from '../configs/AppAccessibilityPreferences';

export const useAppAccessibilityPreferences = () => {
  const context = useContext(AppAccessibilityContext);

  return useMemo(() => {
    // Ensure there is a context provider.
    if (!context) {
      return null;
    }

    // Merge user provided configs with defaults.
    const { preferences } = context;
    return {
      ...AppDefaultsAccessibilityPreferences,
      ...(preferences || {})
    } as AppAccessibilityPreferences;
  }, [context]);
};
