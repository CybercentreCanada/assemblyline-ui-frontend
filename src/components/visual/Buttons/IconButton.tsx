import type { IconButtonProps as MuiIconButtonProps, TooltipProps } from '@mui/material';
import { IconButton as MuiIconButton, Skeleton } from '@mui/material';
import { CircularProgress } from 'components/visual/Buttons/CircularProgress';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

export type IconButtonProps = MuiIconButtonProps & {
  loading?: boolean;
  preventRender?: boolean;
  progress?: boolean;
  to?: LinkProps['to'] | (() => LinkProps['to']);
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
    size = 'medium',
    to = null,
    tooltip = null,
    tooltipProps = null,
    ...props
  }: IconButtonProps) =>
    preventRender ? null : loading ? (
      <Skeleton
        variant="circular"
        sx={{
          margin: `calc(0.5 * var(--mui-spacing))`,
          ...(size === 'small' && { height: '1.5rem', width: '1.5rem' }),
          ...(size === 'medium' && { height: '2rem', width: '2rem' }),
          ...(size === 'large' && { height: '2.5rem', width: '2.5rem' })
        }}
      />
    ) : (
      <Tooltip title={tooltip} placement="bottom" {...tooltipProps}>
        <MuiIconButton
          aria-label={!tooltip ? null : JSON.stringify(tooltip)}
          disabled={loading || disabled}
          size={size}
          {...(!to || loading ? null : { component: Link, to: typeof to === 'function' ? to() : to })}
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
