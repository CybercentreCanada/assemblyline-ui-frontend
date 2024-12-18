import type { TooltipProps } from '@mui/material';
import { Tooltip } from '@mui/material';
import React from 'react';

type Props = {
  children?: React.ReactNode;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
};

export const TooltipInput: React.FC<Props> = React.memo(
  ({ children = null, tooltip = null, tooltipProps = null }: Props) =>
    tooltip ? (
      children
    ) : (
      <Tooltip title={tooltip} {...tooltipProps}>
        <div>{children}</div>
      </Tooltip>
    )
);
