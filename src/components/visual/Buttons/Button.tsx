import type { ButtonProps as MuiButtonProps, TooltipProps } from '@mui/material';
import { Button as MuiButton } from '@mui/material';
import { CircularProgress } from 'components/visual/Buttons/CircularProgress';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type ButtonProps = MuiButtonProps & {
  loading?: boolean;
  preventRender?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
};

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    disabled = false,
    loading = false,
    preventRender = false,
    tooltip = null,
    tooltipProps = null,
    children = null,
    ...props
  }: ButtonProps) =>
    preventRender ? null : (
      <Tooltip title={tooltip} {...tooltipProps}>
        <MuiButton disabled={loading || disabled} {...props}>
          {children}
          <CircularProgress loading={loading} />
        </MuiButton>
      </Tooltip>
    )
);
