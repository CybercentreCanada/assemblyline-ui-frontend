import {
  createTheme,
  type CSSObject,
  type Components,
  type PaletteOptions,
  type Theme,
  type TypographyVariantsOptions
} from '@mui/material';
import { enUS, frFR, type Localization } from '@mui/material/locale';
import type { AppThemeConfigs } from 'commons/components/app/AppConfigs';
import { AppDefaultsThemeConfigs } from 'commons/components/app/AppDefaults';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const createTuiTheme = (
  components: Components<Omit<Theme, 'components'>>,
  typography: TypographyVariantsOptions,
  palette: PaletteOptions,
  locale: Localization
) =>
  createTheme(
    {
      components: {
        ...components,
        MuiCssBaseline: {
          ...(components?.MuiCssBaseline || {}),
          styleOverrides: {
            ...((components.MuiCssBaseline?.styleOverrides as CSSObject) || {}),
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
        MuiUseMediaQuery: {
          ...(components.MuiUseMediaQuery || {}),
          defaultProps: {
            noSsr: true
          }
        }
      },
      typography: {
        ...typography
      },
      palette
    },
    locale
  );

const useThemeBuilder = (theme: AppThemeConfigs = AppDefaultsThemeConfigs) => {
  const { i18n } = useTranslation();
  const localizations = useMemo(() => ({ fr: frFR, en: enUS }), []);

  return useMemo(
    () => ({
      darkTheme: createTuiTheme(
        theme.components || {},
        theme.typography || {},
        {
          mode: 'dark',
          ...(theme?.palette?.dark || {})
        } as PaletteOptions,
        localizations[i18n.language]
      ),
      lightTheme: createTuiTheme(
        theme.components || {},
        theme.typography || {},
        {
          mode: 'light',
          ...(theme?.palette?.light || {})
        } as PaletteOptions,
        localizations[i18n.language]
      )
    }),
    [i18n.language, localizations, theme.components, theme?.palette?.dark, theme?.palette?.light, theme.typography]
  );
};

export default useThemeBuilder;
