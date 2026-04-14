import type { AppTheme } from '../app';

export const BASE_LAYER = {
  D1: '#000000',
  D1_5: '#0E0E0E',
  D2: '#171717',
  D2_5: '#232323',
  D3: '#2E2E2E',
  D4: '#464646',
  D5: '#5D5D5D',
  D6: '#747474',
  D7: '#8B8B8B',
  D8: '#A2A2A2',
  D9: '#B9B9B9',
  D10: '#D1D1D1',
  D11: '#E8E8E8',
  D11_5: '#F5F5F5',
  D12: '#FFFFFF'
};

export const ACCENT_LAYER = {
  dark: {
    SECONDARY: '#9575cd'
  },
  light: {
    SECONDARY: '#512da8'
  }
};

export const OPACITY_LAYER = {
  dark: {
    ACTION_ACTIVE: 'rgba(255, 255, 255, 0.65)',
    ACTION_ACTIVE_OPACITY: 0.65,
    ACTION_DISABLED: 'rgba(93, 93, 93, 0.4)',
    ACTION_DISABLED_OPACITY: 0.4,
    ACTION_FOCUS: 'rgba(255, 255, 255, 0.16)',
    ACTION_FOCUS_OPACITY: 0.16,
    ACTION_HOVER: 'rgba(255, 255, 255, 0.12)',
    ACTION_HOVER_OPACITY: 0.12,
    ACTION_SELECTED: 'rgba(255, 255, 255, 0.20)',
    ACTION_SELECTED_OPACITY: 0.2,
    DIVIDER: 'rgba(255, 255, 255, 0.12)',
    DIVIDER_OPACITY: 0.12,
    TEXT_DISABLED: 'rgba(255, 255, 255, 0.27)',
    TEXT_DISABLED_OPACITY: 0.27,
    TEXT_PRIMARY: 'rgba(255, 255, 255, 0.64)',
    TEXT_PRIMARY_OPACITY: 0.64,
    TEXT_SECONDARY: 'rgba(255, 255, 255, 0.45)',
    TEXT_SECONDARY_OPACITY: 0.45
  },
  light: {
    ACTION_ACTIVE: 'rgba(0, 0, 0, 0.65)',
    ACTION_ACTIVE_OPACITY: 0.65,
    ACTION_DISABLED: 'rgba(185, 185, 185, 0.4)',
    ACTION_DISABLED_OPACITY: 0.4,
    ACTION_FOCUS: 'rgba(0, 0, 0, 0.14)',
    ACTION_FOCUS_OPACITY: 0.14,
    ACTION_HOVER: 'rgba(0, 0, 0, 0.12)',
    ACTION_HOVER_OPACITY: 0.12,
    ACTION_SELECTED: 'rgba(0, 0, 0, 0.16)',
    ACTION_SELECTED_OPACITY: 0.16,
    DIVIDER: 'rgba(0, 0, 0, 0.10)',
    DIVIDER_OPACITY: 0.1,
    TEXT_DISABLED: 'rgba(0, 0, 0, 0.3)',
    TEXT_DISABLED_OPACITY: 0.3,
    TEXT_PRIMARY: 'rgba(0, 0, 0, 0.75)',
    TEXT_PRIMARY_OPACITY: 0.75,
    TEXT_SECONDARY: 'rgba(0, 0, 0, 0.47)',
    TEXT_SECONDARY_OPACITY: 0.47
  }
};

export const CHILL_THEME: AppTheme = {
  id: 'tui.theme.chill',
  default: true,
  i18nKey: 'tui.theme.chill',
  configs: {
    light: {
      palette: {
        mode: 'light',

        background: {
          default: BASE_LAYER.D12,
          paper: BASE_LAYER.D12
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
