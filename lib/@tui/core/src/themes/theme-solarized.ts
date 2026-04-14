import type { AppTheme } from '../app';

export const BASE_LAYER = {
  D1: '#00242D',
  D2: '#002B36',
  D3: '#04323D',
  D4: '#073642',
  D4_5: '#23444F',
  D5: '#3F535D',
  D6: '#586E75',
  D7: '#5F7980',
  D8: '#657B83',
  D9: '#839496',
  D10: '#93A1A1',
  D10_5: '#C1C5BB',
  D11: '#EEE8D5',
  D11_5: '#F6EFDC',
  D12: '#FDF6E3'
};

export const ACCENT_LAYER = {
  dark: {
    BLUE: '#268BD2',
    BLUE_BRIGHT: '#4FA3DC',
    CYAN: '#2AA198',
    CYAN_BRIGHT: '#56B8B1',
    GREEN: '#859900',
    MAGENTA: '#D33682',
    ORANGE: '#CB4B16',
    RED: '#DC322F',
    VIOLET: '#6C71C4',
    YELLOW: '#B58900'
  },
  light: {
    BLUE: '#268BD2',
    BLUE_BRIGHT: '#4FA3DC',
    CYAN: '#2AA198',
    CYAN_BRIGHT: '#56B8B1',
    GREEN: '#859900',
    MAGENTA: '#D33682',
    ORANGE: '#CB4B16',
    RED: '#DC322F',
    VIOLET: '#6C71C4',
    YELLOW: '#B58900'
  }
};

export const OPACITY_LAYER = {
  light: {
    ACTION_ACTIVE: 'rgba(0, 36, 45, 0.54)',
    ACTION_ACTIVE_OPACITY: 0.54,
    ACTION_DISABLED: 'rgba(0, 36, 45, 0.40)',
    ACTION_DISABLED_OPACITY: 0.4,
    ACTION_FOCUS: 'rgba(0, 36, 45, 0.14)',
    ACTION_FOCUS_OPACITY: 0.14,
    ACTION_HOVER: 'rgba(0, 36, 45, 0.10)',
    ACTION_HOVER_OPACITY: 0.1,
    ACTION_SELECTED: 'rgba(0, 36, 45, 0.16)',
    ACTION_SELECTED_OPACITY: 0.16,
    DIVIDER: 'rgba(0, 36, 45, 0.18)',
    DIVIDER_OPACITY: 0.18,
    TEXT_PRIMARY: 'rgba(0, 36, 45, 0.87)',
    TEXT_PRIMARY_OPACITY: 0.87,
    TEXT_SECONDARY: 'rgba(0, 36, 45, 0.60)',
    TEXT_SECONDARY_OPACITY: 0.6
  },
  dark: {
    ACTION_ACTIVE: 'rgba(253, 246, 227, 0.70)',
    ACTION_ACTIVE_OPACITY: 0.7,
    ACTION_DISABLED: 'rgba(253, 246, 227, 0.40)',
    ACTION_DISABLED_OPACITY: 0.4,
    ACTION_FOCUS: 'rgba(253, 246, 227, 0.14)',
    ACTION_FOCUS_OPACITY: 0.14,
    ACTION_HOVER: 'rgba(253, 246, 227, 0.10)',
    ACTION_HOVER_OPACITY: 0.1,
    ACTION_SELECTED: 'rgba(253, 246, 227, 0.16)',
    ACTION_SELECTED_OPACITY: 0.16,
    DIVIDER: 'rgba(253, 246, 227, 0.18)',
    DIVIDER_OPACITY: 0.18,
    TEXT_PRIMARY: 'rgba(253, 246, 227, 0.87)',
    TEXT_PRIMARY_OPACITY: 0.87,
    TEXT_SECONDARY: 'rgba(253, 246, 227, 0.60)',
    TEXT_SECONDARY_OPACITY: 0.6
  }
};

export const SOLARIZED_THEME: AppTheme = {
  id: 'tui.theme.solarized',
  i18nKey: 'tui.theme.solarized',
  configs: {
    light: {
      palette: {
        mode: 'light',
        background: {
          default: BASE_LAYER.D12,
          paper: BASE_LAYER.D12
        },

        primary: {
          main: ACCENT_LAYER.light.BLUE,
          contrastText: BASE_LAYER.D12
        },

        secondary: {
          main: ACCENT_LAYER.light.CYAN,
          contrastText: BASE_LAYER.D12
        },

        success: {
          main: ACCENT_LAYER.light.GREEN
        },

        warning: {
          main: ACCENT_LAYER.light.YELLOW
        },

        error: {
          main: ACCENT_LAYER.light.RED
        },

        info: {
          main: ACCENT_LAYER.light.VIOLET
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
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarWidth: 'thin',
              scrollbarColor: `${BASE_LAYER.D10} transparent`,
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: BASE_LAYER.D10,
                borderRadius: '4px',
                border: `2px solid ${BASE_LAYER.D10}`
              }
            }
          }
        },
        MuiInputAdornment: {
          styleOverrides: {
            root: {
              color: 'inherit'
            }
          }
        }
      }
    },
    dark: {
      palette: {
        mode: 'dark',

        background: {
          default: BASE_LAYER.D2,
          paper: BASE_LAYER.D2
        },

        primary: {
          main: ACCENT_LAYER.dark.BLUE_BRIGHT
        },

        secondary: {
          main: ACCENT_LAYER.dark.CYAN_BRIGHT
        },

        success: {
          main: ACCENT_LAYER.dark.GREEN
        },

        warning: {
          main: ACCENT_LAYER.dark.YELLOW
        },

        error: {
          main: ACCENT_LAYER.dark.RED
        },

        info: {
          main: ACCENT_LAYER.dark.VIOLET
        },

        text: {
          primary: OPACITY_LAYER.dark.TEXT_PRIMARY,
          secondary: OPACITY_LAYER.dark.TEXT_SECONDARY
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
              scrollbarColor: `${BASE_LAYER.D6} transparent`,
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: BASE_LAYER.D6,
                borderRadius: '4px',
                border: `2px solid ${BASE_LAYER.D6}`
              }
            }
          }
        },
        MuiInputAdornment: {
          styleOverrides: {
            root: {
              color: 'inherit'
            }
          }
        }
      }
    }
  }
};
