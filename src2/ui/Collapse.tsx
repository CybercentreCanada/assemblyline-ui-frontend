import type { CollapseProps as MuiCollapseProps } from '@mui/material';
import { Collapse as MuiCollapse } from '@mui/material';
import { memo, useDeferredValue, useEffect, useState } from 'react';

//*****************************************************************************************
// Collapse
//*****************************************************************************************

/** Props for Collapse (same as MUI CollapseProps). */
export type CollapseProps = MuiCollapseProps;

export const Collapse = memo(({ children, in: inProp, ...collapseProps }: CollapseProps) => {
  const [render, setRender] = useState<boolean>(inProp);
  const deferredIn = useDeferredValue(inProp);

  useEffect(() => {
    if (inProp) setRender(true);
  }, [inProp]);

  return !render ? null : (
    <MuiCollapse in={deferredIn} {...collapseProps}>
      {children}
    </MuiCollapse>
  );
});

Collapse.displayName = 'Collapse';
