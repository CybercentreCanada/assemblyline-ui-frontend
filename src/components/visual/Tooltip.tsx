import type { TooltipProps as MuiTooltipProps } from '@mui/material';
import { Tooltip as MuiTooltip } from '@mui/material';
import React, { useState } from 'react';

export type TooltipProps = Omit<MuiTooltipProps, 'title'> & {
  title?: MuiTooltipProps['title'];
};

export const Tooltip: React.FC<TooltipProps> = React.memo(
  ({ children = null, title = null, ...tooltipProps }: TooltipProps) => {
    const [open, setOpen] = useState<boolean>(false);

    return title ? (
      <MuiTooltip
        title={title}
        placement="bottom-start"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          popper: {
            // modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
            onMouseOver: () => setOpen(false)
          }
        }}
        {...tooltipProps}
      >
        <div>{children}</div>
      </MuiTooltip>
    ) : (
      children
    );
  }
);
