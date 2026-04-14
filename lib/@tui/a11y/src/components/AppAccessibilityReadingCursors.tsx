import { Box, useTheme } from '@mui/material';
import { useAppAccessibilityStates, useAppMousePosition } from '../hooks';

export const AppAccessibilityReadingCursors = () => {
  const accessibilityStates = useAppAccessibilityStates();
  const mousePosition = useAppMousePosition();
  const theme = useTheme();

  if (accessibilityStates?.cursor === 'readingMask') {
    return (
      <>
        <Box
          id="ReadingMaskTopZone"
          sx={{
            position: 'fixed !important',
            zIndex: '2147483647 !important',
            width: '100% !important',
            top: '0px !important',
            background: 'rgba(0, 0, 0, 0.5) !important',
            height: `${mousePosition.y - 50}px`,
            borderBottom: '10px solid',
            borderBottomColor: theme.palette.info.main
          }}
        ></Box>
        <Box
          id="ReadingMaskBottomZone"
          sx={{
            position: 'fixed !important',
            zIndex: '2147483647 !important',
            width: '100% !important',
            bottom: '0px !important',
            background: 'rgba(0, 0, 0, 0.5) !important',
            height: `${window.innerHeight - mousePosition.y - 50}px`,
            borderTop: '10px solid',
            borderTopColor: theme.palette.success.main
          }}
        ></Box>
      </>
    );
  } else if (accessibilityStates?.cursor === 'readingGuide') {
    return (
      <>
        <Box
          id="ReadingGuideTopArrow"
          sx={{
            position: 'fixed !important',
            zIndex: '2147483647 !important',
            top: `calc(${mousePosition.y}px - 1.5rem) !important`,
            left: `calc(${mousePosition.x}px - 0.5rem) !important`,
            width: '0.75rem',
            height: '0.75rem',
            backgroundColor: theme.palette.text.primary,
            borderLeft: '2px solid',
            borderTop: '2px solid',
            borderColor: theme.palette.warning.main,
            transform: 'rotate(45deg)'
          }}
        ></Box>
        <Box
          id="ReadingGuideBarBottom"
          sx={{
            position: 'fixed !important',
            zIndex: '2147483646 !important',
            top: `calc(${mousePosition.y}px - 1.15rem) !important`,
            left: `calc(${mousePosition.x}px - 10rem) !important`,
            width: '20rem',
            height: '0.75rem',
            backgroundColor: theme.palette.text.primary,
            border: '2px solid',
            borderColor: theme.palette.warning.main
          }}
        ></Box>
      </>
    );
  }

  return null;
};
