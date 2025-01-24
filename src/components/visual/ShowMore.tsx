import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { ButtonProps } from '@mui/material';
import { Button, IconButton, Tooltip, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type ShowMoreProps =
  | (Omit<ButtonProps, 'children' | 'variant'> & {
      children?: React.ReactNode;
      variant?: 'long';
    })
  | (Omit<ButtonProps, 'children' | 'variant'> & {
      children?: React.ReactNode;
      variant?: 'short';
    })
  | (Omit<ButtonProps, 'children' | 'variant'> & {
      children?: React.ReactNode;
      variant?: 'tiny';
    });

export const ShowMore: React.FC<ShowMoreProps> = React.memo(
  ({ children = null, variant = 'long', ...props }: ShowMoreProps) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const [showMore, setShowMore] = useState<boolean>(false);

    switch (variant) {
      case 'long':
        return !showMore ? (
          <Button
            aria-label="show more"
            size="small"
            variant="outlined"
            onClick={() => setShowMore(true)}
            sx={{ padding: `${theme.spacing(0.25)} ${theme.spacing(1)}`, ...props.sx }}
            {...props}
          >
            {t('show_more')}
          </Button>
        ) : (
          children
        );
      case 'short':
        return !showMore ? (
          <Tooltip title={t('show_more')}>
            <Button aria-label="show more" size="small" variant="outlined" onClick={() => setShowMore(true)} {...props}>
              <MoreHorizIcon />
            </Button>
          </Tooltip>
        ) : (
          children
        );
      case 'tiny':
        return !showMore ? (
          <Tooltip title={t('show_more')} placement="bottom-start">
            <div>
              <IconButton color="primary" size="small" onClick={() => setShowMore(true)} {...props}>
                <MoreHorizIcon />
              </IconButton>
            </div>
          </Tooltip>
        ) : (
          children
        );
      default:
        return null;
    }
  }
);
