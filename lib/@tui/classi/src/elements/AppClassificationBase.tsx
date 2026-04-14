import { Security } from '@mui/icons-material';
import type { Theme } from '@mui/material';
import { Chip, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { MuiColorType } from '@tui/core';
import { useAppColor, useAppLanguage } from '@tui/core';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { MxProps } from '.';
import { MODULE_NAME } from '../name';
import type { AppClassificationState, AppClassificationValue } from '../providers/AppClassificationProvider';
import { AppClassificationValues } from '../providers/AppClassificationProvider';

export type AppClassificationBaseProps = {
  variant?: 'filled' | 'text' | 'outlined';
  state?: AppClassificationState | 'unsupported';
  full?: boolean;
  short_text_en: string;
  short_text_fr: string;
  long_text_en: string;
  long_text_fr: string;
  color: MuiColorType;
  mx?: MxProps;
};

export const AppClassificationBase: FC<AppClassificationBaseProps> = ({
  variant,
  state,
  full,
  short_text_en,
  short_text_fr,
  long_text_en,
  long_text_fr,
  color,
  mx
}) => {
  const theme = useTheme();
  const errorColor = useAppColor('red', 700, 300);
  const classiColor = useAppColor(color, 700, 300);
  const isLoading = state === 'loading';
  const _isXlDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xl'));
  const isXlDown = !full && _isXlDown;
  const { isEN } = useAppLanguage();
  const { t } = useTranslation(MODULE_NAME);

  const renderer = useMemo(() => {
    if (!state || AppClassificationValues.includes(state as AppClassificationValue)) {
      return 'classi';
    }
    return state;
  }, [state]);

  const sxProps = useMemo(() => {
    const _color = renderer === 'unsupported' ? errorColor : classiColor;
    if (variant === 'filled') {
      return {
        chip: {
          color: theme.palette.getContrastText(_color),
          bgcolor: !isLoading ? _color : null,
          borderColor: 'transparent',
          fontWeight: 600,

          borderRadius: 0
        },
        icon: {
          color: isLoading ? _color : theme.palette.getContrastText(_color),
          opacity: isLoading ? 0.5 : 1
        }
      };
    }

    if (variant === 'outlined') {
      return {
        chip: {
          color: _color,
          borderColor: _color,
          fontWeight: 600,

          borderRadius: 0
        },
        icon: {
          color: _color,
          opacity: isLoading ? 0.5 : 1
        }
      };
    }

    return {
      chip: {
        color: _color,
        borderColor: 'transparent',
        fontWeight: 600,

        borderRadius: 0
      },
      icon: {
        color: _color,
        opacity: isLoading ? 0.5 : 1
      }
    };
  }, [renderer, errorColor, classiColor, variant, isLoading, theme.palette]);

  const text = useMemo(
    () => (isXlDown ? (isEN() ? short_text_en : short_text_fr) : isEN() ? long_text_en : long_text_fr),
    [isXlDown, isEN, short_text_en, short_text_fr, long_text_en, long_text_fr]
  );

  return (
    <Chip
      size="small"
      sx={{ ...sxProps.chip, ...(mx ?? {}), borderRadius: 0, fontWeight: 600 }}
      icon={isXlDown ? null : <Security color="inherit" sx={sxProps.icon} />}
      variant="outlined"
      label={
        {
          classi: text,
          unsupported: isXlDown
            ? t('classification.state.unsupported.short').toUpperCase()
            : t('classification.state.unsupported.long').toUpperCase(),
          error: isXlDown
            ? t('classification.state.error.short').toUpperCase()
            : t('classification.state.error.long').toUpperCase(),
          loading: (
            <Skeleton variant="text" animation="wave" sx={{ minWidth: isXlDown ? 48 : 100 }}>
              <Typography>
                {isXlDown
                  ? t('classification.state.loading.short').toUpperCase()
                  : t('classification.state.loading.long').toUpperCase()}
              </Typography>
            </Skeleton>
          )
        }[renderer]
      }
    />
  );
};
