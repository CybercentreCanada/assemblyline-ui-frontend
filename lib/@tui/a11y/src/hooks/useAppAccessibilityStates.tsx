import { useContext, useMemo } from 'react';
import { AppAccessibilityContext } from '../configs/AccessibilityContext';
import { AppDefaultsAccessibilityStates } from '../configs/AppAccessibilityDefaults';
import type { AppAccessibilityStates } from '../configs/AppAccessibilityStates';

export function useAppAccessibilityStates() {
  const { states } = useContext(AppAccessibilityContext);

  return useMemo(() => {
    // Merge user provided configs with defaults.
    const _states = { ...AppDefaultsAccessibilityStates, ...(states || {}) } as AppAccessibilityStates;

    // Rebuild new context.
    return _states;
  }, [states]);
}
