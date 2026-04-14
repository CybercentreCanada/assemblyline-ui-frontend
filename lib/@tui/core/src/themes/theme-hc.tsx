import type { AppTheme } from '../app';

export const BASE_LAYER = {
  D1: '#000000',
  D2: '#111111',
  D3: '#222222',
  D4: '#333333',
  D5: '#555555',
  D6: '#777777',
  D7: '#999999',
  D8: '#BBBBBB',
  D9: '#DDDDDD',
  D10: '#EEEEEE',
  D11: '#F8F8F8',
  D12: '#FFFFFF'
};

export const ACCENT_LAYER = {
  dark: {
    BLUE: '#00BFFF',
    GREEN: '#00FF66',
    ORANGE: '#FFAA00',
    PURPLE: '#CC33FF',
    RED: '#FF4444',
    YELLOW: '#FFFF33'
  },
  light: {
    BLUE: '#005BFF',
    GREEN: '#008800',
    ORANGE: '#FF6600',
    PURPLE: '#6600CC',
    RED: '#CC0000',
    YELLOW: '#FFCC00'
  }
};

export const OPACITY_LAYER = {
  dark: {
    ACTION_ACTIVE: 'rgba(255, 255, 255, 1)',
    ACTION_ACTIVE_OPACITY: 1,
    ACTION_DISABLED: 'rgba(255, 255, 255, 0.5)',
    ACTION_DISABLED_OPACITY: 0.5,
    ACTION_DISABLED_BACKGROUND: 'rgba(255, 255, 255, 0.15)',
    ACTION_FOCUS: 'rgba(255, 255, 255, 0.3)',
    ACTION_FOCUS_OPACITY: 0.3,
    ACTION_HOVER: 'rgba(255, 255, 255, 0.25)',
    ACTION_HOVER_OPACITY: 0.25,
    ACTION_SELECTED: 'rgba(255, 255, 255, 0.35)',
    ACTION_SELECTED_OPACITY: 0.35,
    DIVIDER: 'rgba(255, 255, 255, 1)',
    DIVIDER_OPACITY: 1,
    TEXT_DISABLED: 'rgba(255, 255, 255, 0.6)',
    TEXT_DISABLED_OPACITY: 0.6,
    TEXT_PRIMARY: 'rgba(255, 255, 255, 1)',
    TEXT_PRIMARY_OPACITY: 1,
    TEXT_SECONDARY: 'rgba(255, 255, 255, 0.87)',
    TEXT_SECONDARY_OPACITY: 0.87
  },
  light: {
    ACTION_ACTIVE: 'rgba(0, 0, 0, 1)',
    ACTION_ACTIVE_OPACITY: 1,
    ACTION_DISABLED: 'rgba(0, 0, 0, 0.5)',
    ACTION_DISABLED_OPACITY: 0.5,
    ACTION_DISABLED_BACKGROUND: 'rgba(0, 0, 0, 0.15)',
    ACTION_FOCUS: 'rgba(0, 0, 0, 0.3)',
    ACTION_FOCUS_OPACITY: 0.3,
    ACTION_HOVER: 'rgba(0, 0, 0, 0.25)',
    ACTION_HOVER_OPACITY: 0.25,
    ACTION_SELECTED: 'rgba(0, 0, 0, 0.35)',
    ACTION_SELECTED_OPACITY: 0.35,
    DIVIDER: 'rgba(0, 0, 0, 1)',
    DIVIDER_OPACITY: 1,
    TEXT_DISABLED: 'rgba(0, 0, 0, 0.6)',
    TEXT_DISABLED_OPACITY: 0.6,
    TEXT_PRIMARY: 'rgba(0, 0, 0, 1)',
    TEXT_PRIMARY_OPACITY: 1,
    TEXT_SECONDARY: 'rgba(0, 0, 0, 0.87)',
    TEXT_SECONDARY_OPACITY: 0.87
  }
};

export const HC_THEME: AppTheme = {
  id: 'tui.theme.hc',
  default: true,
  i18nKey: 'tui.theme.hc',
  configs: {
    light: {
      palette: {
        mode: 'light',

        background: {
          default: BASE_LAYER.D12,
          paper: BASE_LAYER.D12
        },

        text: {
          primary: OPACITY_LAYER.light.TEXT_PRIMARY,
          secondary: OPACITY_LAYER.light.TEXT_SECONDARY,
          disabled: OPACITY_LAYER.light.TEXT_DISABLED
        },

        primary: {
          main: ACCENT_LAYER.light.BLUE
        },

        secondary: {
          main: ACCENT_LAYER.light.PURPLE
        },

        error: {
          main: ACCENT_LAYER.light.RED
        },

        info: {
          main: ACCENT_LAYER.light.ORANGE
        },

        success: {
          main: ACCENT_LAYER.light.GREEN
        },

        warning: {
          main: ACCENT_LAYER.light.YELLOW
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
          disabledOpacity: OPACITY_LAYER.light.ACTION_DISABLED_OPACITY,
          disabledBackground: OPACITY_LAYER.light.ACTION_DISABLED_BACKGROUND
        }
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            '.tui-navitem:hover': {
              outline: '2px dashed',
              outlineColor: ACCENT_LAYER.light.BLUE
            },
            '.tui-navitem:focus': {
              outline: '2px dotted',
              outlineColor: ACCENT_LAYER.light.BLUE
            },
            '.tui-appdrawer': {
              border: '1px solid',
              borderColor: OPACITY_LAYER.light.DIVIDER
            }
          }
        },

        MuiDrawer: {
          styleOverrides: {
            paper: {
              border: '1px solid',
              borderColor: OPACITY_LAYER.light.DIVIDER
            }
          }
        },

        MuiButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                outline: '2px dashed',
                outlineColor: ACCENT_LAYER.light.BLUE
              },
              '&.Mui-selected': {
                outline: '2px solid',
                outlineColor: ACCENT_LAYER.light.BLUE
              },
              '&:selected': {
                outline: '2px solid',
                outlineColor: ACCENT_LAYER.light.BLUE
              },

              '&:focus': {
                outline: '2px dotted',
                outlineColor: ACCENT_LAYER.light.BLUE
              }
            }
          }
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                outline: '2px dashed',
                outlineColor: ACCENT_LAYER.light.BLUE
              },
              '&.Mui-selected': {
                outline: '2px solid',
                outlineColor: ACCENT_LAYER.light.BLUE
              },
              '&:focus': {
                outline: '2px dotted',
                outlineColor: ACCENT_LAYER.light.BLUE
              }
            }
          }
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                outline: '2px dashed',
                outlineColor: ACCENT_LAYER.light.BLUE
              },
              '&.Mui-selected': {
                outline: '2px solid',
                outlineColor: ACCENT_LAYER.light.BLUE
              },
              '&:focus': {
                outline: '2px dotted',
                outlineColor: ACCENT_LAYER.light.BLUE
              }
            }
          }
        },
        MuiAccordionSummary: {
          styleOverrides: {
            root: {
              '&:hover': {
                outline: '2px dashed',
                outlineColor: ACCENT_LAYER.light.BLUE
              },
              '&.Mui-selected': {
                outline: '2px solid',
                outlineColor: ACCENT_LAYER.light.BLUE
              },
              '&:focus': {
                outline: '2px dotted',
                outlineColor: ACCENT_LAYER.light.BLUE
              }
            }
          }
        },
        MuiList: {
          styleOverrides: {
            root: {
              marginTop: '2px'
            }
          }
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

        text: {
          primary: OPACITY_LAYER.dark.TEXT_PRIMARY,
          secondary: OPACITY_LAYER.dark.TEXT_SECONDARY,
          disabled: OPACITY_LAYER.dark.TEXT_DISABLED
        },

        primary: {
          main: ACCENT_LAYER.dark.BLUE
        },

        secondary: {
          main: ACCENT_LAYER.dark.PURPLE
        },

        error: {
          main: ACCENT_LAYER.dark.RED
        },

        info: {
          main: ACCENT_LAYER.dark.ORANGE
        },

        success: {
          main: ACCENT_LAYER.dark.GREEN
        },

        warning: {
          main: ACCENT_LAYER.dark.YELLOW
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
          disabledOpacity: OPACITY_LAYER.dark.ACTION_DISABLED_OPACITY,
          disabledBackground: OPACITY_LAYER.dark.ACTION_DISABLED_BACKGROUND
        }
      },

      components: {
        MuiCssBaseline: {
          styleOverrides: {
            '.tui-navitem:hover': {
              outline: '2px dashed',
              outlineColor: ACCENT_LAYER.dark.BLUE
            },
            '.tui-navitem:focus': {
              outline: '2px dotted',
              outlineColor: ACCENT_LAYER.dark.BLUE
            },
            '.tui-appdrawer': {
              border: '1px solid',
              borderColor: OPACITY_LAYER.dark.DIVIDER
            }
          }
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              border: '1px solid',
              borderColor: OPACITY_LAYER.dark.DIVIDER
            }
          }
        },
        MuiButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                outline: '2px dashed',
                outlineColor: ACCENT_LAYER.dark.BLUE
              },
              '&.Mui-selected': {
                outline: '2px solid',
                outlineColor: ACCENT_LAYER.dark.BLUE
              },
              '&:focus': {
                outline: '2px dotted',
                outlineColor: ACCENT_LAYER.dark.BLUE
              }
            }
          }
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                outline: '2px dashed',
                outlineColor: ACCENT_LAYER.dark.BLUE
              },
              '&.Mui-selected': {
                outline: '2px solid',
                outlineColor: ACCENT_LAYER.dark.BLUE
              },
              '&:focus': {
                outline: '2px dotted',
                outlineColor: ACCENT_LAYER.dark.BLUE
              }
            }
          }
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                outline: '2px dashed',
                outlineColor: ACCENT_LAYER.dark.BLUE
              },
              '&.Mui-selected': {
                outline: '2px solid',
                outlineColor: ACCENT_LAYER.dark.BLUE
              },
              '&:focus': {
                outline: '2px dotted',
                outlineColor: ACCENT_LAYER.dark.BLUE
              }
            }
          }
        },
        MuiAccordionSummary: {
          styleOverrides: {
            root: {
              '&:hover': {
                outline: '2px dashed',
                outlineColor: ACCENT_LAYER.dark.BLUE
              },
              '&.Mui-selected': {
                outline: '2px solid',
                outlineColor: ACCENT_LAYER.dark.BLUE
              },
              '&:focus': {
                outline: '2px dotted',
                outlineColor: ACCENT_LAYER.dark.BLUE
              }
            }
          }
        },
        MuiList: {
          styleOverrides: {
            root: {
              marginTop: '2px'
            }
          }
        }
      }
    }
  }
};
