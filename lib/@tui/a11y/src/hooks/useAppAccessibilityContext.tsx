import { useContext } from 'react';
import { AppAccessibilityContext, type AppAccessbilityContextType } from '../configs/AccessibilityContext';

export function useAppAccessibilityContext(): AppAccessbilityContextType | null {
  const context = useContext(AppAccessibilityContext);
  return context;
}
