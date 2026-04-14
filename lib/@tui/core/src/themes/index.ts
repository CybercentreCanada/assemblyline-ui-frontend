import { CHILL_THEME } from './theme-chill';
import { DEFAULT_THEME } from './theme-default';
import { HC_THEME } from './theme-hc';
import { SOLARIZED_THEME } from './theme-solarized';
import './tui-theme';

export * from './density';
export * from './elements/AppDensity';
export * from './hooks/useAppThemeBuilder';

export const TUI_THEMES = [DEFAULT_THEME, CHILL_THEME, SOLARIZED_THEME, HC_THEME];
