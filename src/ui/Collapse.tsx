import type { CollapseProps as MuiCollapseProps } from '@mui/material';
import { Collapse as MuiCollapse } from '@mui/material';
import React, { useDeferredValue, useEffect, useState } from 'react';

export type CollapseProps = MuiCollapseProps;

export const Collapse: React.FC<CollapseProps> = React.memo(
  ({ children, in: inProp, ...collapseProps }: CollapseProps) => {
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
  }
);
