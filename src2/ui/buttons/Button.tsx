import type { ButtonProps as MuiButtonProps, TooltipProps } from '@mui/material';
import { Button as MuiButton, Skeleton } from '@mui/material';
import { AppLink } from 'core/router';
import { AppRoute, CreatedAppRouteParamsMap } from 'core/routes';
import React, { useMemo } from 'react';
import { getTextContent } from 'shared/utils/utils';
import { Tooltip } from 'ui/Tooltip';
import { CircularProgress } from './CircularProgress';

export type ButtonProps = MuiButtonProps & {
  loading?: boolean;
  preventRender?: boolean | (() => boolean);
  progress?: boolean;
  to?: CreatedAppRouteParamsMap<AppRoute>;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
};

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    children = null,
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
  }: ButtonProps) => {
    const preventRender = useMemo<boolean>(
      () => (loading ? false : typeof preventRenderProp === 'function' ? preventRenderProp() : preventRenderProp),
      [loading, preventRenderProp]
    );

    return loading ? (
      <MuiButton disabled size={size} sx={{ padding: 0 }}>
        <Skeleton
          id={id ?? getTextContent(children)}
          variant="rounded"
          width="50px"
          sx={{
            flex: 1,
            ...(size === 'small' && { height: '30.75px' }),
            ...(size === 'medium' && { height: '36.5px' }),
            ...(size === 'large' && { height: '42.25px' })
          }}
        />
      </MuiButton>
    ) : preventRender ? null : (
      <Tooltip title={tooltip} placement="bottom" noDiv {...tooltipProps}>
        <MuiButton
          id={id ?? getTextContent(children)}
          disabled={progress || disabled}
          size={size}
          {...(!toProp ? null : { component: AppLink, to: toProp })}
          {...props}
        >
          {children}
          <CircularProgress progress={progress} />
        </MuiButton>
      </Tooltip>
    );
  }
);

Button.displayName = 'Button';
