import type { TooltipProps as MuiTooltipProps } from '@mui/material';
import { Tooltip as MuiTooltip } from '@mui/material';
import type { ReactElement } from 'react';
import { memo, useState } from 'react';

//*****************************************************************************************
// Tooltip
//*****************************************************************************************

/** Props for Tooltip. */
export type TooltipProps = Omit<MuiTooltipProps, 'children' | 'title'> & {
  /** Content to wrap with the tooltip. */
  children?: React.ReactNode;
  /** Whether the tooltip is disabled. */
  disabled?: boolean;
  /** Whether to skip the wrapper div. */
  noDiv?: boolean;
  /** Tooltip content. */
  title?: MuiTooltipProps['title'];
};

export const Tooltip = memo(
  ({ children = null, disabled = false, noDiv = false, title = null, ...tooltipProps }: TooltipProps) => {
    const [open, setOpen] = useState<boolean>(false);

    return disabled ? (
      children
    ) : (
      <MuiTooltip
        title={title}
        placement="bottom-start"
        disableInteractive
        open={open && !!title}
        onOpen={() => setOpen(!!title)}
        onClose={() => setOpen(false)}
        {...tooltipProps}
        slotProps={{
          ...tooltipProps?.slotProps,
          popper: {
            onMouseOver: () => setOpen(false),
            ...tooltipProps?.slotProps?.popper
          },
          tooltip: {
            ...tooltipProps?.slotProps?.tooltip,
            sx: {
              textWrap: 'pretty',
              ...(tooltipProps?.slotProps?.tooltip as any)?.sx
            }
          }
        }}
      >
        {noDiv ? (children as ReactElement) : <div>{children}</div>}
      </MuiTooltip>
    );
  }
);

Tooltip.displayName = 'Tooltip';
