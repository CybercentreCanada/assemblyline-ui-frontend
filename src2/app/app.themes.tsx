import type { AppTheme, AppThemes } from 'core/theme/theme.models';

//*****************************************************************************************
// DEFAULT THEME
//*****************************************************************************************

export const BASE_LAYER = {
  D1: '#202020',
  D2: '#2C2C2C',
  D3: '#383838',
  D4: '#444444',
  D5: '#515151',
  D6: '#5F5F5F',
  D7: '#6D6D6D',
  D8: '#8A8A8A',
  D9: '#A7A7A7',
  D10: '#C4C4C4',
  D11: '#E1E1E1',
  D11_5: '#F5F5F5',
  D12: '#FFFFFF'
};

export const ACCENT_LAYER = {
  dark: {
    PRIMARY: '#7DA1DB',
    SECONDARY: '#C0DEEC'
  },
  light: {
    PRIMARY: '#0062BF',
    SECONDARY: '#619CB7'
  }
};

export const OPACITY_LAYER = {
  dark: {
    ACTION_ACTIVE: 'rgba(255, 255, 255, 0.7)',
    ACTION_ACTIVE_OPACITY: 0.7,
    ACTION_DISABLED: 'rgba(109, 109, 109, 0.4)',
    ACTION_DISABLED_OPACITY: 0.4,
    ACTION_FOCUS: 'rgba(255, 255, 255, 0.16)',
    ACTION_FOCUS_OPACITY: 0.16,
    ACTION_HOVER: 'rgba(255, 255, 255, 0.08)',
    ACTION_HOVER_OPACITY: 0.08,
    ACTION_SELECTED: 'rgba(255, 255, 255, 0.24)',
    ACTION_SELECTED_OPACITY: 0.24,
    DIVIDER: 'rgba(255, 255, 255, 0.12)',
    DIVIDER_OPACITY: 0.12,
    TEXT_DISABLED: 'rgba(255, 255, 255, 0.5)',
    TEXT_DISABLED_OPACITY: 0.5,
    TEXT_PRIMARY: 'rgba(255, 255, 255, 0.87)',
    TEXT_PRIMARY_OPACITY: 0.87,
    TEXT_SECONDARY: 'rgba(255, 255, 255, 0.6)',
    TEXT_SECONDARY_OPACITY: 0.6
  },
  light: {
    ACTION_ACTIVE: 'rgba(0, 0, 0, 0.54)',
    ACTION_ACTIVE_OPACITY: 0.54,
    ACTION_DISABLED: 'rgba(167, 167, 167, 0.4)',
    ACTION_DISABLED_OPACITY: 0.4,
    ACTION_FOCUS: 'rgba(0, 0, 0, 0.10)',
    ACTION_FOCUS_OPACITY: 0.1,
    ACTION_HOVER: 'rgba(0, 0, 0, 0.08)',
    ACTION_HOVER_OPACITY: 0.08,
    ACTION_SELECTED: 'rgba(0, 0, 0, 0.12)',
    ACTION_SELECTED_OPACITY: 0.12,
    DIVIDER: 'rgba(0, 0, 0, 0.12)',
    DIVIDER_OPACITY: 0.12,
    TEXT_DISABLED: 'rgba(0, 0, 0, 0.38)',
    TEXT_DISABLED_OPACITY: 0.38,
    TEXT_PRIMARY: 'rgba(0, 0, 0, 0.87)',
    TEXT_PRIMARY_OPACITY: 0.87,
    TEXT_SECONDARY: 'rgba(0, 0, 0, 0.6)',
    TEXT_SECONDARY_OPACITY: 0.6
  }
};

export const DEFAULT_THEME: AppTheme = {
  i18n: {
    en: 'Default',
    fr: 'Défaut'
  },
  configs: {
    light: {
      palette: {
        mode: 'light',
        background: {
          default: BASE_LAYER.D12,
          paper: BASE_LAYER.D12
        },
        primary: {
          main: ACCENT_LAYER.light.PRIMARY
        },
        secondary: {
          main: ACCENT_LAYER.light.SECONDARY
        },
        text: {
          primary: OPACITY_LAYER.light.TEXT_PRIMARY,
          secondary: OPACITY_LAYER.light.TEXT_SECONDARY,
          disabled: OPACITY_LAYER.light.TEXT_DISABLED
        },
        divider: OPACITY_LAYER.light.DIVIDER,
        action: {
          hover: OPACITY_LAYER.light.ACTION_HOVER,
          hoverOpacity: OPACITY_LAYER.light.ACTION_HOVER_OPACITY,
          focus: OPACITY_LAYER.light.ACTION_FOCUS,
          focusOpacity: OPACITY_LAYER.light.ACTION_FOCUS_OPACITY,
          selected: OPACITY_LAYER.light.ACTION_SELECTED,
          selectedOpacity: OPACITY_LAYER.light.ACTION_SELECTED_OPACITY,
          active: OPACITY_LAYER.light.ACTION_ACTIVE,
          activatedOpacity: OPACITY_LAYER.light.ACTION_ACTIVE_OPACITY,
          disabled: OPACITY_LAYER.light.ACTION_DISABLED,
          disabledOpacity: OPACITY_LAYER.light.ACTION_DISABLED_OPACITY
        }
      }
    },
    dark: {
      palette: {
        mode: 'dark',
        background: {
          default: BASE_LAYER.D1,
          paper: BASE_LAYER.D1
        },
        primary: {
          main: ACCENT_LAYER.dark.PRIMARY
        },
        secondary: {
          main: ACCENT_LAYER.dark.SECONDARY
        },
        text: {
          primary: OPACITY_LAYER.dark.TEXT_PRIMARY,
          secondary: OPACITY_LAYER.dark.TEXT_SECONDARY,
          disabled: OPACITY_LAYER.dark.TEXT_DISABLED
        },
        divider: OPACITY_LAYER.dark.DIVIDER,
        action: {
          hover: OPACITY_LAYER.dark.ACTION_HOVER,
          hoverOpacity: OPACITY_LAYER.dark.ACTION_HOVER_OPACITY,
          focus: OPACITY_LAYER.dark.ACTION_FOCUS,
          focusOpacity: OPACITY_LAYER.dark.ACTION_FOCUS_OPACITY,
          selected: OPACITY_LAYER.dark.ACTION_SELECTED,
          selectedOpacity: OPACITY_LAYER.dark.ACTION_SELECTED_OPACITY,
          active: OPACITY_LAYER.dark.ACTION_ACTIVE,
          activatedOpacity: OPACITY_LAYER.dark.ACTION_ACTIVE_OPACITY,
          disabled: OPACITY_LAYER.dark.ACTION_DISABLED,
          disabledOpacity: OPACITY_LAYER.dark.ACTION_DISABLED_OPACITY
        }
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarWidth: 'thin',
              scrollbarColor: `${BASE_LAYER.D4} transparent`,
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: BASE_LAYER.D4,
                borderRadius: '4px',
                border: `2px solid ${BASE_LAYER.D4}`
              }
            }
          }
        }
      }
    }
  }
};

//*****************************************************************************************
// DEFAULT THEME
//*****************************************************************************************

export const APP_THEMES: AppThemes = {
  default: DEFAULT_THEME
} as const;
