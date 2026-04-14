import { Paper, Typography, useTheme } from '@mui/material';
import type { OverlayProps } from '.';

export const OverlayLabel = ({ label, rect }: OverlayProps) => {
  const theme = useTheme();

  // Use the theme's background color and add alpha
  const bgColor = theme.palette.background.paper; // primary surface color
  const R = parseInt(bgColor.slice(1, 3), 16);
  const G = parseInt(bgColor.slice(3, 5), 16);
  const B = parseInt(bgColor.slice(5, 7), 16);
  const A = 0.85; // 85% opacity
  const overlayBg = `rgba(${R}, ${G}, ${B}, ${A})`;

  // Ensure nothing breaks if window is not defined (e.g., during server-side rendering)
  const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  const scrollX = typeof window !== 'undefined' ? window.scrollX : 0;

  return (
    <Paper
      elevation={1}
      sx={{
        position: 'fixed',
        top: rect.top + scrollY,
        left: rect.left + scrollX,
        width: rect.width,
        height: rect.height,
        bgcolor: overlayBg,
        border: '1px dashed',
        borderColor: 'primary.main',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        textAlign: 'center',
        fontSize: 12
      }}
    >
      <Typography fontWeight={600}>{label}</Typography>
    </Paper>
  );
};
