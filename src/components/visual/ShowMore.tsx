import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { ButtonProps } from '@mui/material';
import { Button, IconButton, Tooltip, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ShowMoreProps =
  | (Omit<ButtonProps, 'variant'> & {
      variant?: 'long';
    })
  | (Omit<ButtonProps, 'variant'> & {
      variant?: 'short';
    })
  | (Omit<ButtonProps, 'variant'> & {
      variant?: 'tiny';
    });

export const ShowMore: React.FC<ShowMoreProps> = React.memo(({ variant = 'long', ...props }: ShowMoreProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  switch (variant) {
    case 'long':
      return (
        <Button
          aria-label="show more"
          size="small"
          variant="outlined"
          sx={{ padding: `${theme.spacing(0.25)} ${theme.spacing(1)}`, ...props.sx }}
          {...props}
        >
          {t('show_more')}
        </Button>
      );
    case 'short':
      return (
        <Tooltip title={t('show_more')}>
          <Button aria-label="show more" size="small" variant="outlined" {...props}>
            <MoreHorizIcon />
          </Button>
        </Tooltip>
      );
    case 'tiny':
      return (
        <Tooltip title={t('show_more')}>
          <div>
            <IconButton color="primary" size="small" {...props}>
              <MoreHorizIcon />
            </IconButton>
          </div>
        </Tooltip>
      );
    default:
      return null;
  }
});
