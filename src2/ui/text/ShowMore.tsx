import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { ButtonProps } from '@mui/material';
import { Button, IconButton, Tooltip, useTheme } from '@mui/material';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

//*****************************************************************************************
// ShowMore
//*****************************************************************************************

/** Props for ShowMore. */
export type ShowMoreProps = Omit<ButtonProps, 'children' | 'variant'> & {
  /** Content to show when expanded. */
  children?: React.ReactNode;
  /** If true, renders nothing. */
  preventRender?: boolean;
  /** Display variant for the trigger. */
  variant?: 'long' | 'short' | 'tiny';
};

export const ShowMore = memo(
  ({ children = null, preventRender = false, variant = 'long', ...props }: ShowMoreProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [showMore, setShowMore] = useState<boolean>(false);

    return preventRender ? null : variant === 'long' ? (
      !showMore ? (
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
      )
    ) : variant === 'short' ? (
      !showMore ? (
        <Tooltip title={t('show_more')}>
          <Button aria-label="show more" size="small" variant="outlined" onClick={() => setShowMore(true)} {...props}>
            <MoreHorizIcon />
          </Button>
        </Tooltip>
      ) : (
        children
      )
    ) : variant === 'tiny' ? (
      !showMore ? (
        <Tooltip title={t('show_more')} placement="bottom-start">
          <div>
            <IconButton color="primary" size="small" onClick={() => setShowMore(true)} {...props}>
              <MoreHorizIcon />
            </IconButton>
          </div>
        </Tooltip>
      ) : (
        children
      )
    ) : null;
  }
);

ShowMore.displayName = 'ShowMore';
