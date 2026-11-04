import { parseAppThemeFromLegacy } from 'core/template';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// parseAppThemeFromLegacy
//*****************************************************************************************
describe('parseAppThemeFromLegacy', () => {
  it('hoists mode-agnostic components/typography into the global bucket', () => {
    const components = { MuiTab: { styleOverrides: { root: { minWidth: '145px' } } } };
    const typography = { fontFamily: 'Roboto' };

    const result = parseAppThemeFromLegacy({
      configs: { components, typography },
      default: true,
      i18nKey: 'theme.default.label',
      id: 'theme.default'
    });

    expect(result.configs.global).toMatchObject({ components, typography });
  });

  it('applies the base theme baseline (breakpoints, cssVariables, MuiCssBaseline sizing) to global', () => {
    const result = parseAppThemeFromLegacy({
      configs: {},
      default: true,
      i18nKey: 'theme.default.label',
      id: 'theme.default'
    });

    expect(result.configs.global).toMatchObject({
      breakpoints: { values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 } },
      components: { MuiCssBaseline: { styleOverrides: { html: { width: '100%', height: '100%' } } } },
      cssVariables: true
    });
  });

  it('splits palette into light/dark buckets, overriding the library default theme', () => {
    const result = parseAppThemeFromLegacy({
      configs: {
        palette: {
          dark: { background: { default: '#202020', paper: '#303030' } },
          light: { background: { default: '#FAFAFA', paper: '#FFFFFF' } }
        }
      },
      default: true,
      i18nKey: 'theme.default.label',
      id: 'theme.default'
    });

    expect(result.configs.dark.palette).toMatchObject({
      background: { default: '#202020', paper: '#303030' },
      mode: 'dark'
    });
    expect(result.configs.light.palette).toMatchObject({
      background: { default: '#FAFAFA', paper: '#FFFFFF' },
      mode: 'light'
    });
  });

  it('maps appbar styles onto MuiAppBar styleOverrides per mode', () => {
    const result = parseAppThemeFromLegacy({
      configs: {
        appbar: {
          dark: { backgroundColor: '#303030' },
          light: { backgroundColor: '#FFFFFF', color: '#000000' }
        }
      },
      default: true,
      i18nKey: 'theme.default.label',
      id: 'theme.default'
    });

    expect(result.configs.dark.components).toMatchObject({
      MuiAppBar: { styleOverrides: { root: { backgroundColor: '#303030' } } }
    });
    expect(result.configs.light.components).toMatchObject({
      MuiAppBar: { styleOverrides: { root: { backgroundColor: '#FFFFFF', color: '#000000' } } }
    });
  });

  it('preserves id, i18nKey, and default', () => {
    const result = parseAppThemeFromLegacy({
      configs: {},
      default: false,
      i18nKey: 'theme.chill.label',
      id: 'theme.chill'
    });

    expect(result.id).toBe('theme.chill');
    expect(result.i18nKey).toBe('theme.chill.label');
    expect(result.default).toBe(false);
  });
});
