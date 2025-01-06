import type { TooltipProps } from '@mui/material';
import { Tooltip } from '@mui/material';
import React, { useState } from 'react';

type Props = Omit<TooltipProps, 'title'> & {
  tooltip?: TooltipProps['title'];
};

export const TooltipInput: React.FC<Props> = React.memo(
  ({ children = null, tooltip = null, ...tooltipProps }: Props) => {
    const [open, setOpen] = useState<boolean>(false);

    return tooltip ? (
      <Tooltip
        title={tooltip}
        placement="bottom-start"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          popper: {
            modifiers: [{ name: 'offset', options: { offset: [0, -9] } }],
            onMouseOver: () => setOpen(false)
          }
        }}
        {...tooltipProps}
      >
        <div>{children}</div>
      </Tooltip>
    ) : (
      children
    );
  }
);
