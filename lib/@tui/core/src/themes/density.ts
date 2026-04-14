import type { ThemeOptions } from '@mui/material';
import type { AppDensityMode } from '../app/AppConfigs';

const SPACING_FACTOR: Record<AppDensityMode, number> = {
  comfortable: 8,
  compact: 6,
  dense: 4
};

export const getDensityThemeOverrides = (density: AppDensityMode): Partial<ThemeOptions> => {
  if (density === 'comfortable') return {};

  const isCompact = density === 'compact';
  const size = 'small' as const;

  return {
    spacing: SPACING_FACTOR[density],
    typography: {
      fontSize: isCompact ? 13 : 12,
      body1: { fontSize: isCompact ? '0.875rem' : '0.8125rem' },
      body2: { fontSize: isCompact ? '0.8125rem' : '0.75rem' }
    },
    components: {
      // Tables
      MuiTableCell: {
        styleOverrides: {
          root: { padding: isCompact ? '4px 8px' : '2px 6px' }
        }
      },
      // Buttons
      MuiButton: { defaultProps: { size } },
      MuiIconButton: { defaultProps: { size } },
      MuiFab: { defaultProps: { size } },
      // Inputs
      MuiTextField: { defaultProps: { size, margin: 'dense' } },
      MuiSelect: { defaultProps: { size, margin: 'dense' } },
      MuiAutocomplete: { defaultProps: { size } },
      MuiInputBase: { defaultProps: { margin: 'dense' } },
      MuiFormControl: { defaultProps: { size, margin: 'dense' } },
      // Lists
      MuiList: { defaultProps: { dense: true } },
      MuiListItem: { defaultProps: { dense: true } },
      MuiMenuItem: { defaultProps: { dense: true } },
      MuiListItemIcon: {
        styleOverrides: {
          root: { minWidth: isCompact ? 48 : 40 }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: { minHeight: isCompact ? 40 : 32 }
        }
      },
      // Cards
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: isCompact ? '12px' : '8px',
            '&:last-child': { paddingBottom: isCompact ? '12px' : '8px' }
          }
        }
      },
      MuiCardHeader: {
        styleOverrides: {
          root: { padding: isCompact ? '12px' : '8px' }
        }
      },
      // Toolbar
      MuiToolbar: { defaultProps: { variant: 'dense' } },
      // Chips & Avatars
      MuiChip: { defaultProps: { size } },
      MuiAvatar: {
        styleOverrides: {
          root: {
            width: isCompact ? 32 : 28,
            height: isCompact ? 32 : 28
          }
        }
      },
      // Tabs
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: isCompact ? 40 : 36,
            padding: isCompact ? '6px 12px' : '4px 8px'
          }
        }
      },
      // Accordion
      MuiAccordionSummary: {
        styleOverrides: {
          root: { minHeight: isCompact ? 40 : 36 },
          content: { margin: isCompact ? '8px 0' : '4px 0' }
        }
      }
    }
  };
};
