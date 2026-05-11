import type { TooltipProps as MuiTooltipProps } from '@mui/material';
import { Tooltip as MuiTooltip } from '@mui/material';
import { memo, useState } from 'react';

//*****************************************************************************************
// Tooltip
//*****************************************************************************************

/** Props for Tooltip. */
export type TooltipProps = Omit<MuiTooltipProps, 'children' | 'title'> & {
  /** Content to wrap with the tooltip. */
  children?: React.ReactNode;
  /** Whether to skip the wrapper div. */
  noDiv?: boolean;
  /** Tooltip content. */
  title?: MuiTooltipProps['title'];
};

export const Tooltip = memo(({ children = null, noDiv = false, title = null, ...tooltipProps }: TooltipProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return title ? (
    <MuiTooltip
      title={title}
      placement="bottom-start"
      disableInteractive
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      {...tooltipProps}
      slotProps={{
        ...tooltipProps?.slotProps,
        popper: {
          ...tooltipProps?.slotProps?.popper,
          disablePortal: true,
          // modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
          onMouseOver: () => setOpen(false)
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
  ) : (
    children
  );
});

Tooltip.displayName = 'Tooltip';
