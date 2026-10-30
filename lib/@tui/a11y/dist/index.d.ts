import { AppThemeConfigs } from "@tui/core";
import { ReactNode } from "react";
import * as react_jsx_runtime0 from "react/jsx-runtime";
import { i18n } from "i18next";

//#region src/components/AppDrawerAccessibility.d.ts
declare const AppDrawerAccessibilityIconButton: () => react_jsx_runtime0.JSX.Element;
//#endregion
//#region src/configs/AppAccessibilityPreferences.d.ts
type AppAccessibilityPreferences = {
  enableAccessibility?: boolean;
  enableCursor?: boolean;
  enableAnimation?: boolean;
  enableLineHeight?: boolean;
  enableTextSize?: boolean;
  enableTextAlignment?: boolean;
  enableTextSpacing?: boolean;
  enableTooltipLeaveDelay?: boolean;
};
//#endregion
//#region src/configs/AppAccessibilityStates.d.ts
type AppAccessibilityStates = {
  textSize: 'default' | 'sm' | 'md' | 'lg';
  textSpacing: 'default' | 'light' | 'moderate' | 'heavy';
  lineHeight: 'default' | '1.5x' | '1.75x' | '2x';
  cursor: 'default' | 'readingMask' | 'readingGuide';
  textAlign: 'default' | 'alignLeft' | 'alignRight' | 'alignCenter' | 'justified';
  animation: 'play' | 'pause';
  tooltipLeaveDelay: 'default' | 'short' | 'moderate' | 'long';
  nextTextSize?: () => void;
  nextTextSpacing?: () => void;
  nextLineHeight?: () => void;
  nextCursor?: () => void;
  nextTextAlign?: () => void;
  toggleAnimation?: () => void;
  nextTooltipLeaveDelay?: () => void;
  resetToDefault?: () => void;
  getTextSize?: () => 14 | 16 | 18 | 20;
  getTextAlign?: () => 'center' | 'inherit' | 'justify' | 'left' | 'right';
  getLineHeight?: () => 'normal' | '1.5' | '1.75' | '2';
  getTextSpacing?: () => '1px' | '2px' | '4px' | '8px';
  getTooltipLeaveDelay?: () => 0 | 200 | 500 | 1000;
};
//#endregion
//#region src/hooks/useAccessibilityThemeBuilder.d.ts
declare const buildThemeOverride: (accessibilityStates?: AppAccessibilityStates, accessibilityPreferences?: AppAccessibilityPreferences) => Partial<AppThemeConfigs>;
//#endregion
//#region src/configs/AccessibilityContext.d.ts
type AppAccessbilityContextType = {
  initialized: boolean;
  preferences: AppAccessibilityPreferences;
  features: ReactNode[];
  states: AppAccessibilityStates;
};
//#endregion
//#region src/hooks/useAppAccessibilityContext.d.ts
declare function useAppAccessibilityContext(): AppAccessbilityContextType | null;
//#endregion
//#region src/hooks/useAppAccessibilityFeatures.d.ts
declare function useAppAccessibilityFeatures(): ReactNode[];
//#endregion
//#region src/hooks/useAppAccessibilityPreferences.d.ts
declare const useAppAccessibilityPreferences: () => AppAccessibilityPreferences;
//#endregion
//#region src/hooks/useAppAccessibilityStates.d.ts
declare function useAppAccessibilityStates(): AppAccessibilityStates;
//#endregion
//#region src/hooks/useAppKeyboardShortcut.d.ts
type UseAppKeyboardShortcutType = {
  key: string;
  expectControl?: boolean;
  expectShift?: boolean;
  expectAlt?: boolean;
  onKeyPressed: () => void;
};
/**
 * A react hook that will call a function when the necessary keys are pressed in unison
 *
 * @param {string} key Which key needs to be pressed to perform some action
 * @param {boolean} [expectControl=false] An optional field to need CTRL to be pressed as part of the keybind
 * @param {boolean} [expectShift=false] An optional field to need SHIFT to be pressed as part of the keybind
 * @param {boolean} [expectAlt=false] An optional field to need ALT to be pressed as part of the keybind
 * @param {() => void} [onKeyPressed] The action to perform when all of the necessary keys are pressed
 */
declare function useAppKeyboardShortcut({
  key,
  onKeyPressed,
  expectControl,
  expectShift,
  expectAlt
}: UseAppKeyboardShortcutType): void;
//#endregion
//#region src/hooks/useAppMousePosition.d.ts
/**
 * A react hook to get the current mouse position within the visible browser window
 *
 * @returns {{x: number, y: number}} Returns the x and y position of the mouse
 */
declare const useAppMousePosition: () => {
  x: number;
  y: number;
};
//#endregion
//#region src/i18n/index.d.ts
declare function addTranslations(i18n: i18n): void;
//#endregion
//#region src/name.d.ts
declare const MODULE_NAME = "tui.a11y";
//#endregion
//#region src/providers/AppAccessibilityProvider.d.ts
type AppAccessibilityProviderProps = {
  preferences?: AppAccessibilityPreferences;
  features?: ReactNode[];
  children: ReactNode;
};
declare const AppAccessibilityProvider: ({
  children,
  preferences,
  features
}: AppAccessibilityProviderProps) => react_jsx_runtime0.JSX.Element;
//#endregion
export { type AppAccessibilityPreferences, AppAccessibilityProvider, AppAccessibilityProviderProps, AppDrawerAccessibilityIconButton, MODULE_NAME, UseAppKeyboardShortcutType, addTranslations, buildThemeOverride, useAppAccessibilityContext, useAppAccessibilityFeatures, useAppAccessibilityPreferences, useAppAccessibilityStates, useAppKeyboardShortcut, useAppMousePosition };
//# sourceMappingURL=index.d.ts.map