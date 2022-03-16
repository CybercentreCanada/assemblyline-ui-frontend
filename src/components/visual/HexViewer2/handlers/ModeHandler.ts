import { Store } from '..';

// Theme
type Theme = { light: 'light'; dark: 'dark' };
const THEMES: Theme = { light: 'light', dark: 'dark' };
export type ThemeType = typeof THEMES[keyof typeof THEMES];
export type IsTheme = { [Property in ThemeType]: (store: Store) => boolean };
export const isTheme = Object.fromEntries(
  Object.keys(THEMES).map(key => [key, (store: Store) => store.mode.theme === THEMES[key]])
) as IsTheme;

// Language
type Language = { en: 'en'; fr: 'fr' };
const LANGUAGE: Language = { en: 'en', fr: 'fr' };
export type LanguageType = typeof LANGUAGE[keyof typeof LANGUAGE];
export type IsLanguage = { [Property in LanguageType]: (store: Store) => boolean };
export const isLanguage = Object.fromEntries(
  Object.keys(LANGUAGE).map(key => [key, (store: Store) => store.mode.language === LANGUAGE[key]])
) as IsLanguage;

// Width
type Width = { xs: 'xs'; sm: 'sm'; md: 'md'; lg: 'lg'; xl: 'xl'; wd: 'wd' };
const WIDTH: Width = { xs: 'xs', sm: 'sm', md: 'md', lg: 'lg', xl: 'xl', wd: 'wd' };
const WIDTH_INDEX = { xs: 0, sm: 1, md: 2, lg: 3, xl: 4, wd: 5 };
export type WidthType = typeof WIDTH[keyof typeof WIDTH];
export type IsWidth = { [Property in WidthType]: (store: Store) => boolean };
export const isWidth = Object.fromEntries(
  Object.keys(WIDTH).map(key => [key, (store: Store) => store.mode.width === WIDTH[key]])
) as IsWidth;
export const isWidthEqualDown = (store: Store, type: WidthType): boolean =>
  WIDTH_INDEX[type] >= WIDTH_INDEX[store.mode.width];

export const isWidthEqualUp = (store: Store, type: WidthType): boolean =>
  WIDTH_INDEX[type] <= WIDTH_INDEX[store.mode.width];

// Layout
type Layout = { page: 'page'; fullscreen: 'fullscreen' };
const LAYOUT: Layout = { page: 'page', fullscreen: 'fullscreen' };
export type LayoutType = typeof LAYOUT[keyof typeof LAYOUT];
export type IsLayout = { [Property in LayoutType]: (store: Store) => boolean };
export const isLayout = Object.fromEntries(
  Object.keys(LAYOUT).map(key => [key, (store: Store) => store.mode.layoutType === LAYOUT[key]])
) as IsLayout;

// Toolbar
type Toolbar = { desktop: 'desktop'; mobile: 'mobile' };
const TOOLBAR: Toolbar = { desktop: 'desktop', mobile: 'mobile' };
export type ToolbarType = typeof TOOLBAR[keyof typeof TOOLBAR];
export type IsToolbar = { [Property in ToolbarType]: (store: Store) => boolean };
export const isToolbar = Object.fromEntries(
  Object.keys(TOOLBAR).map(key => [key, (store: Store) => store.mode.toolbarType === TOOLBAR[key]])
) as IsToolbar;

// Body
type Body = { window: 'window'; table: 'table' };
const BODY: Body = { window: 'window', table: 'table' };
export type BodyType = typeof BODY[keyof typeof BODY];
export type IsBody = { [Property in BodyType]: (store: Store) => boolean };
export const isBody = Object.fromEntries(
  Object.keys(BODY).map(key => [key, (store: Store) => store.mode.bodyType === BODY[key]])
) as IsBody;

export type BodyTypeSettingValues = {
  en: Array<{ label: string; type: BodyType; value: number }>;
  fr: Array<{ label: string; type: BodyType; value: number }>;
};

export const BODY_TYPE_SETTING_VALUES: BodyTypeSettingValues = {
  en: [
    { label: 'Window', type: 'window', value: 0 },
    { label: 'Table', type: 'table', value: 1 }
  ],
  fr: [
    { label: 'Fenêtre', type: 'window', value: 0 },
    { label: 'Table', type: 'table', value: 1 }
  ]
};
