import { mergeThemeConfigs } from 'core/theme/theme.utils';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// mergeThemeConfigs
//*****************************************************************************************
describe('mergeThemeConfigs', () => {
  it('returns global config when no mode-specific config exists', () => {
    const configs = { global: { palette: { primary: { main: '#000' } } } };
    const result = mergeThemeConfigs(configs, 'light');
    expect(result).toEqual({ palette: { primary: { main: '#000' } } });
  });

  it('merges dark config over global config', () => {
    const configs = {
      global: { palette: { primary: { main: '#000' } } },
      dark: { palette: { primary: { main: '#fff' } } }
    };
    const result = mergeThemeConfigs(configs, 'dark');
    expect(result.palette.primary.main).toBe('#fff');
  });

  it('merges light config over global config', () => {
    const configs = {
      global: { palette: { primary: { main: '#000' } } },
      light: { palette: { primary: { main: '#aaa' } } }
    };
    const result = mergeThemeConfigs(configs, 'light');
    expect(result.palette.primary.main).toBe('#aaa');
  });

  it('does not apply dark config when mode is light', () => {
    const configs = {
      global: { palette: { primary: { main: '#000' } } },
      dark: { palette: { primary: { main: '#fff' } } }
    };
    const result = mergeThemeConfigs(configs, 'light');
    expect(result.palette.primary.main).toBe('#000');
  });

  it('does not apply light config when mode is dark', () => {
    const configs = {
      global: { palette: { primary: { main: '#000' } } },
      light: { palette: { primary: { main: '#aaa' } } }
    };
    const result = mergeThemeConfigs(configs, 'dark');
    expect(result.palette.primary.main).toBe('#000');
  });

  it('returns empty object when configs is empty', () => {
    const result = mergeThemeConfigs({}, 'light');
    expect(result).toEqual({});
  });

  it('returns mode config when global is missing', () => {
    const configs = { dark: { palette: { mode: 'dark' } } };
    const result = mergeThemeConfigs(configs, 'dark');
    expect(result).toEqual({ palette: { mode: 'dark' } });
  });

  it('deep merges nested objects', () => {
    const configs = {
      global: { palette: { primary: { main: '#000' }, secondary: { main: '#111' } } },
      dark: { palette: { primary: { main: '#fff' } } }
    };
    const result = mergeThemeConfigs(configs, 'dark');
    expect(result.palette.primary.main).toBe('#fff');
    expect(result.palette.secondary.main).toBe('#111');
  });
});
