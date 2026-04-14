import { Paper, type PaperProps } from '@mui/material';
import { alpha, darken, getOverlayAlpha, lighten } from '@mui/material/styles';
import type { FC } from 'react';

export type AppSurfaceProps = {
  // The parent surface elevation this paper sits on (Dialog default is 24).
  baseElevation?: number;
  // Positive values increase contrast from base surface; negative values reduce it.
  relativeElevation?: number;
  withBorder?: boolean;
  withShadow?: boolean;
} & PaperProps;

export const AppSurface: FC<AppSurfaceProps> = ({
  baseElevation = 0,
  relativeElevation = 1,
  withBorder = false,
  withShadow = false,
  sx,
  ...props
}) => {
  return (
    <Paper
      {...props}
      sx={[
        theme => {
          const clampedBaseElevation = Math.max(0, Math.min(24, baseElevation));
          const targetElevation = Math.max(0, Math.min(24, clampedBaseElevation + relativeElevation));
          const lightAdjust = Math.min(Math.abs(relativeElevation) * 0.03, 0.16);
          const baseOverlayAlpha = getOverlayAlpha(clampedBaseElevation);
          const targetOverlayAlphaFromElevation = getOverlayAlpha(targetElevation);

          // Dialog often sits at elevation 24, so pure elevation math can flatten deltas.
          // Keep contrast relative by nudging alpha from the base overlay directly.
          const relativeOverlayDelta = relativeElevation * 0.02;
          const targetOverlayAlpha = Math.max(
            0,
            Math.min(1, Math.max(targetOverlayAlphaFromElevation, baseOverlayAlpha + relativeOverlayDelta))
          );

          return {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : relativeElevation >= 0
                  ? darken(theme.palette.background.paper, lightAdjust)
                  : lighten(theme.palette.background.paper, lightAdjust),
            backgroundImage:
              theme.palette.mode === 'dark'
                ? `linear-gradient(${alpha(theme.palette.common.white, targetOverlayAlpha)}, ${alpha(theme.palette.common.white, targetOverlayAlpha)})`
                : 'none',
            ...(withShadow ? {} : { boxShadow: 'none' }),
            ...(withBorder ? { border: `1px solid ${theme.palette.divider}` } : {})
          };
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    />
  );
};
