import type { IconButtonProps as MuiIconButtonProps, TooltipProps } from '@mui/material';
import { IconButton as MuiIconButton } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import { CircularProgress } from './CircularProgress';

export type IconButtonProps = MuiIconButtonProps & {
  loading?: boolean;
  preventRender?: boolean;
  tooltip?: TooltipProps['title'];
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
      <Tooltip title={tooltip} placement="bottom" {...tooltipProps}>
        <MuiIconButton disabled={loading || disabled} {...props}>
          {children}
          <CircularProgress loading={loading} />
        </MuiIconButton>
      </Tooltip>
    )
);
