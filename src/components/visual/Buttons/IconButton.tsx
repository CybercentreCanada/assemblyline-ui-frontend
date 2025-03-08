import type { IconButtonProps as MuiIconButtonProps, TooltipProps } from '@mui/material';
import { CircularProgress, IconButton as MuiIconButton } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

type IconButtonProps = MuiIconButtonProps & {
  loading?: boolean;
  preventRender?: boolean;
  tooltip?: string;
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
};

export const IconButton: React.FC<IconButtonProps> = React.memo(
  ({
    disabled = false,
    loading = false,
    preventRender = false,
    tooltip = null,
    tooltipProps = null,
    children = null,
    ...props
  }: IconButtonProps) =>
    preventRender ? null : (
      <Tooltip title={tooltip} {...tooltipProps}>
        <MuiIconButton disabled={loading || disabled} {...props}>
          {children}
          {loading && (
            <CircularProgress
              size={24}
              style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }}
            />
          )}
        </MuiIconButton>
      </Tooltip>
    )
);
