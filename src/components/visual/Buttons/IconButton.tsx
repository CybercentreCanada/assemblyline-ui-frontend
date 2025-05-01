import type { IconButtonProps as MuiIconButtonProps, TooltipProps } from '@mui/material';
import { IconButton as MuiIconButton, Skeleton } from '@mui/material';
import { CircularProgress } from 'components/visual/Buttons/CircularProgress';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type IconButtonProps = MuiIconButtonProps & {
  loading?: boolean;
  preventRender?: boolean;
  progress?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
};

export const IconButton: React.FC<IconButtonProps> = React.memo(
  ({
    children = null,
    disabled = false,
    loading = false,
    preventRender = false,
    progress = false,
    tooltip = null,
    size = 'medium',
    tooltipProps = null,
    ...props
  }: IconButtonProps) =>
    preventRender ? null : loading ? (
      <Skeleton
        variant="circular"
        sx={{
          ...(size === 'small' && { height: '34px', width: '34px' }),
          ...(size === 'medium' && { height: '40px', width: '40px' }),
          ...(size === 'large' && { height: '48px', width: '48px' })
        }}
      />
    ) : (
      <Tooltip title={tooltip} placement="bottom" {...tooltipProps}>
        <MuiIconButton
          aria-label={!tooltip ? null : tooltip.toString()}
          disabled={loading || disabled}
          size={size}
          {...props}
          sx={{ height: 'fit-content', ...props?.sx }}
        >
          {children}
          <CircularProgress progress={progress} />
        </MuiIconButton>
      </Tooltip>
    )
);

// <MuiIconButton sx={{ padding: 0, flexDirection: 'column' }}>
//   <Skeleton variant="circular" sx={{ flex: 1, aspectRatio: '1 / 1' }} />
// </MuiIconButton>
