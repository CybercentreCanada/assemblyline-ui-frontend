import type { AppAccessibilityPreferences } from './AppAccessibilityPreferences';
import type { AppAccessibilityStates } from './AppAccessibilityStates';

export const AppDefaultsAccessibilityPreferences: AppAccessibilityPreferences = {
  enableAccessibility: true,
  enableCursor: true,
  enableAnimation: true,
  enableLineHeight: true,
  enableTextAlignment: true,
  enableTextSize: true,
  enableTextSpacing: true,
  enableTooltipLeaveDelay: true
};

export const AppDefaultsAccessibilityStates: AppAccessibilityStates = {
  textSize: 'default',
  textSpacing: 'default',
  lineHeight: 'default',
  cursor: 'default',
  textAlign: 'default',
  animation: 'play',
  tooltipLeaveDelay: 'default'
};
