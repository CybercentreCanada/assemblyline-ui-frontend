export type AppAccessibilityPreferences = {
  enableAccessibility?: boolean; // disable all features regarding accessibility
  enableCursor?: boolean; // enables the feature to change cursor accessibility, and to show in accessibility window
  enableAnimation?: boolean; // enables the feature to toggle animation accessibility, and to show in accessibility window
  enableLineHeight?: boolean; // enables the feature to change line height accessibility, and to show in accessibility window
  enableTextSize?: boolean; // enables the feature to change text size accessibility, and to show in accessibility window
  enableTextAlignment?: boolean; // enables the feature to change text alignment accessibility, and to show in accessibility window
  enableTextSpacing?: boolean; // enables the feature to change text spacing accessibility, and to show in accessibility window
  enableTooltipLeaveDelay?: boolean; // enables the feature to delay the on-screen time of the MUI tooltip, and to show in accessibility window
};
