import type { IconButtonProps as MuiIconButtonProps, TooltipProps } from '@mui/material';
import { IconButton as MuiIconButton } from '@mui/material';
import { CircularProgress } from 'components/visual/Buttons/CircularProgress';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type IconButtonProps = MuiIconButtonProps & {
  label: string;
  loading?: boolean;
  preventRender?: boolean;
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
};

export const IconButton: React.FC<IconButtonProps> = React.memo(
  ({
    label = null,
    disabled = false,
    loading = false,
    preventRender = false,
    tooltipProps = null,
    children = null,
    ...props
  }: IconButtonProps) =>
    preventRender ? null : (
      <Tooltip title={label} placement="bottom" {...tooltipProps}>
        <MuiIconButton aria-label={label} disabled={loading || disabled} {...props}>
          {children}
          <CircularProgress loading={loading} />
        </MuiIconButton>
      </Tooltip>
    )
);
