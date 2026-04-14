import { createContext, type ReactNode } from 'react';
import type { AppAccessibilityPreferences } from './AppAccessibilityPreferences';
import type { AppAccessibilityStates } from './AppAccessibilityStates';

export type AppAccessbilityContextType = {
  initialized: boolean;
  preferences: AppAccessibilityPreferences;
  features: ReactNode[];
  states: AppAccessibilityStates;
};

// React Context for the AppAccessibilityProvider
export const AppAccessibilityContext = createContext<AppAccessbilityContextType>({
  initialized: false,
  preferences: {},
  features: [],
  states: {
    textSize: 'default',
    textSpacing: 'default',
    lineHeight: 'default',
    cursor: 'default',
    textAlign: 'default',
    animation: 'play',
    tooltipLeaveDelay: 'default'
  }
});
