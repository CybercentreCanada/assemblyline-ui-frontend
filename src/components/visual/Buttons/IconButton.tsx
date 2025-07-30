import type { IconButtonProps as MuiIconButtonProps, TooltipProps } from '@mui/material';
import { IconButton as MuiIconButton, Skeleton } from '@mui/material';
import type { CircularProgressProps } from 'components/visual/Buttons/CircularProgress';
import { CircularProgress } from 'components/visual/Buttons/CircularProgress';
import { Tooltip } from 'components/visual/Tooltip';
import { getTextContent } from 'helpers/utils';
import React, { useMemo } from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

export type IconButtonProps = MuiIconButtonProps & {
  loading?: boolean;
  preventRender?: boolean | (() => boolean);
  progress?: CircularProgressProps['progress'];
  to?: LinkProps['to'] | (() => LinkProps['to']);
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
};

export const IconButton: React.FC<IconButtonProps> = React.memo(
  ({
    children = null,
    disabled = false,
    id = null,
    loading = false,
    preventRender: preventRenderProp = false,
    progress = false,
    size = 'medium',
    to = null,
    tooltip = null,
    tooltipProps = null,
    ...props
  }: IconButtonProps) => {
    const preventRender = useMemo<boolean>(
      () => (loading ? false : typeof preventRenderProp === 'function' ? preventRenderProp() : preventRenderProp),
      [loading, preventRenderProp]
    );

    return loading ? (
      <Skeleton
        variant="circular"
        sx={{
          margin: `calc(0.5 * var(--mui-spacing))`,
          ...(size === 'small' && { height: '1.5rem', width: '1.5rem' }),
          ...(size === 'medium' && { height: '2rem', width: '2rem' }),
          ...(size === 'large' && { height: '2.5rem', width: '2.5rem' })
        }}
      />
    ) : preventRender ? null : (
      <Tooltip title={tooltip} placement="bottom" {...tooltipProps}>
        <MuiIconButton
          id={id ?? getTextContent(tooltip)}
          aria-label={id ?? getTextContent(tooltip)}
          disabled={loading || disabled || progress !== false}
          size={size}
          {...(!to || loading ? null : { component: Link, to: typeof to === 'function' ? to() : to })}
          {...props}
          sx={{ height: 'fit-content', ...props?.sx }}
        >
          {children}
          <CircularProgress progress={progress} />
        </MuiIconButton>
      </Tooltip>
    );
  }
);
