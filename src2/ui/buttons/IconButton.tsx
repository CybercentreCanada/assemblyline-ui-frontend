import type { IconButtonProps as MuiIconButtonProps, TooltipProps } from '@mui/material';
import { IconButton as MuiIconButton, Skeleton, useTheme } from '@mui/material';
import { AppLink, useAppRouteLocation } from 'core/router';
import { AppRoute, CreatedAppRouteParamsMap } from 'core/routes';
import type { CSSProperties } from 'react';
import React, { useMemo } from 'react';
import { getTextContent } from 'shared/utils/utils';
import type { CircularProgressProps } from 'ui/buttons/CircularProgress';
import { CircularProgress } from 'ui/buttons/CircularProgress';
import { Tooltip } from 'ui/Tooltip';

export type IconButtonProps = MuiIconButtonProps & {
  loading?: boolean;
  preventRender?: boolean | (() => boolean);
  progress?: CircularProgressProps['progress'];
  to?: CreatedAppRouteParamsMap<AppRoute>;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
};

export const IconButton: React.FC<IconButtonProps> = React.memo(
  ({
    children = null,
    color = null,
    disabled = false,
    id = null,
    loading = false,
    preventRender: preventRenderProp = false,
    progress = false,
    size = 'medium',
    to: toProp = null,
    tooltip = null,
    tooltipProps = null,
    ...props
  }: IconButtonProps) => {
    const theme = useTheme();

    const preventRender = useMemo<boolean>(
      () => (loading ? false : typeof preventRenderProp === 'function' ? preventRenderProp() : preventRenderProp),
      [loading, preventRenderProp]
    );

    const resolvedColor = useMemo<CSSProperties['color']>(() => {
      if (!color) return;
      if (disabled || progress !== false) return theme.palette.grey[750];

      switch (color) {
        case 'primary':
        case 'secondary':
          return theme.palette[color].main;
        case 'error':
        case 'success':
        case 'warning':
        case 'info':
          return theme.palette.mode === 'dark' ? theme.palette[color].light : theme.palette[color].dark;
        default:
          return color;
      }
    }, [color, disabled, progress, theme.palette]);

    const { href, state } = useAppRouteLocation(toProp as never);

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
          disabled={disabled || progress !== false}
          size={size}
          {...(!href ? null : { component: AppLink, to: href, state: state })}
          {...props}
          sx={{ height: 'fit-content', color: resolvedColor, ...props?.sx }}
        >
          {children}
          <CircularProgress progress={progress} />
        </MuiIconButton>
      </Tooltip>
    );
  }
);

IconButton.displayName = 'IconButton';
