import type { TooltipProps } from '@mui/material';
import { Tooltip } from '@mui/material';
import React from 'react';

type Props = Omit<TooltipProps, 'title'> & {
  tooltip?: TooltipProps['title'];
};

export const TooltipInput: React.FC<Props> = React.memo(({ children = null, tooltip = null, ...tooltipProps }: Props) =>
  tooltip ? (
    <Tooltip title={tooltip} placement="bottom-start" {...tooltipProps}>
      <div>{children}</div>
    </Tooltip>
  ) : (
    children
  )
);
