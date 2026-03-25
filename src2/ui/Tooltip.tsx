/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { TooltipProps as MuiTooltipProps } from '@mui/material';
import { Tooltip as MuiTooltip } from '@mui/material';
import React, { useState } from 'react';

export type TooltipProps = Omit<MuiTooltipProps, 'title' | 'children'> & {
  children?: React.ReactNode;
  title?: MuiTooltipProps['title'];
  noDiv?: boolean;
  disabled?: boolean;
};

export const Tooltip: React.FC<TooltipProps> = React.memo(
  ({ children = null, title = null, noDiv = false, disabled = false, ...tooltipProps }: TooltipProps) => {
    const [open, setOpen] = useState<boolean>(false);

    return disabled ? (
      children
    ) : (
      <MuiTooltip
        title={title}
        placement="bottom-start"
        disableInteractive
        open={open && !!title}
        onOpen={() => setOpen(true && !!title)}
        onClose={() => setOpen(false)}
        {...tooltipProps}
        slotProps={{
          ...tooltipProps?.slotProps,
          popper: {
            // modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
            onMouseOver: () => setOpen(false),
            ...tooltipProps?.slotProps?.popper
          },
          tooltip: {
            ...tooltipProps?.slotProps?.tooltip,
            sx: {
              textWrap: 'pretty',
              ...tooltipProps?.slotProps?.tooltip?.['sx']
            }
          }
        }}
      >
        {noDiv ? (children as React.ReactElement<unknown, any>) : <div>{children}</div>}
      </MuiTooltip>
    );
  }
);
