import type { ButtonProps as MuiButtonProps, TooltipProps } from '@mui/material';
import { CircularProgress, Button as MuiButton } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type ButtonProps = MuiButtonProps & {
  loading?: boolean;
  preventRender?: boolean;
  tooltip?: string;
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
          {loading && (
            <CircularProgress
              size={24}
              style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }}
            />
          )}
        </MuiButton>
      </Tooltip>
    )
);
