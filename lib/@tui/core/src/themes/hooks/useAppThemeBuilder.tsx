import { createTheme, type ThemeOptions } from '@mui/material';
import { cloneDeep, merge } from 'lodash-es';
import { useCallback } from 'react';
import type { AppDensityMode, AppTheme, AppThemeConfigs } from '../..';
import { getDensityThemeOverrides } from '../density';

const BASE_THEME_CONFIG: Partial<ThemeOptions> = {
  zIndex: {
    tui: {
      superOverlay: 2000
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          width: '100%',
          height: '100%'
        },
        body: {
          width: '100%',
          height: '100%'
        },
        '#root': {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRightColor: 'transparent'
        }
      }
    }
  }
};

export const useAppThemeBuilder = () => {
  return useCallback(
    (theme: AppTheme, optionsOverride: Partial<AppThemeConfigs>, density: AppDensityMode = 'comfortable') => {
      // Need to ensure deeply merged object aren't hanging around.
      const baseConfigs = cloneDeep(BASE_THEME_CONFIG);
      const densityOverrides = getDensityThemeOverrides(density);
      const { light, dark, global } = cloneDeep(theme.configs);

      const { light: lightOverrides, dark: darkOverrides, global: globalOverrides } = cloneDeep(optionsOverride) || {};

      return {
        lightTheme: createTheme(
          merge(
            {},
            baseConfigs,
            densityOverrides,
            global || null,
            globalOverrides || null,
            light || null,
            lightOverrides || null
          )
        ),
        darkTheme: createTheme(
          merge(
            {},
            baseConfigs,
            densityOverrides,
            global || null,
            globalOverrides || null,
            dark || null,
            darkOverrides || null
          )
        )
      };
    },
    []
  );
};
