import { Box, type BoxProps } from '@mui/material';
import { useContext, useMemo, useRef, type FC } from 'react';
import { OverlayContext } from './OverlayProvider';

export const OverlayShadow: FC<Omit<BoxProps, 'component'> & { region: string; id: string }> = ({
  region,
  id,
  children,
  ...boxProps
}) => {
  const ctx = useContext(OverlayContext);

  const ref = useRef<HTMLDivElement | null>(null);

  const enabled = useMemo(() => ctx?.regions.includes(region), [region, ctx?.regions]);

  const active = useMemo(() => ctx?.actives.includes(id), [id, ctx?.actives]);

  if (!enabled) {
    return children;
  }

  return (
    <Box
      ref={ref}
      data-layout-region={region}
      data-layout-id={id}
      style={
        !children
          ? {
              height: '100%',
              width: active ? 100 : 0
            }
          : {}
      }
      {...boxProps}
    >
      {children}
    </Box>
  );
};
