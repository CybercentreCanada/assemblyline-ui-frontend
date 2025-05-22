import type { ButtonProps as MuiButtonProps, TooltipProps } from '@mui/material';
import { Button as MuiButton, Skeleton } from '@mui/material';
import { CircularProgress } from 'components/visual/Buttons/CircularProgress';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

export type ButtonProps = MuiButtonProps & {
  link?: boolean;
  loading?: boolean;
  preventRender?: boolean;
  progress?: boolean;
  to?: LinkProps['to'] | (() => LinkProps['to']);
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
};

export const Button: React.FC<ButtonProps> = React.memo(
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
  }: ButtonProps) =>
    preventRender ? null : loading ? (
      <MuiButton disabled size={size} sx={{ padding: 0 }}>
        <Skeleton
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
    ) : (
      <Tooltip title={tooltip} placement="bottom" {...tooltipProps}>
        <MuiButton
          disabled={progress || disabled}
          size={size}
          {...(!to || loading ? null : { component: Link, to: typeof to === 'function' ? to() : to })}
          {...props}
        >
          {children}
          <CircularProgress progress={progress} />
        </MuiButton>
      </Tooltip>
    )
);
