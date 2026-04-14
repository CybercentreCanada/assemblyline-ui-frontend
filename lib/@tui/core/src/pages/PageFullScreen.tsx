import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { memo, useCallback, useRef, type FC, type PropsWithChildren } from 'react';
import { useAppBar, useAppBarHeight, useAppLayout } from '../app/hooks';
import { useFullscreenStatus } from '../utils/hooks/useFullscreenStatus';
import { PageContent } from './PageContent';

type PageFullscreenProps = PropsWithChildren & {
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  test?: React.CSSProperties;
  fsIconPos?: 'absolute' | 'fixed' | 'relative' | 'static' | 'sticky'; // fullscreen icon position
};

const PageFullscreenInternal: FC<PageFullscreenProps> = ({
  children,
  margin = null,
  mb = 2,
  ml = 2,
  mr = 2,
  mt = 2,
  fsIconPos = 'sticky'
}) => {
  const maximizableElement = useRef(null);
  const appBarHeight = useAppBarHeight();
  const layout = useAppLayout();
  const appbar = useAppBar();
  let isFullscreen: boolean;
  let setIsFullscreen: () => void;
  let fullscreenSupported: boolean;

  const barWillHide = layout.current !== 'top' && appbar.autoHide;

  try {
    [isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement);
  } catch {
    fullscreenSupported = false;
    isFullscreen = false;
    setIsFullscreen = undefined;
  }

  const handleEnterFullscreen = useCallback(() => {
    setIsFullscreen();
  }, [setIsFullscreen]);

  const handleExitFullscreen = () => {
    document.exitFullscreen();
  };

  return (
    <Box ref={maximizableElement} component="div" sx={theme => ({ backgroundColor: theme.palette.background.default })}>
      <Box
        component="div"
        sx={theme => ({
          top: barWillHide || isFullscreen ? 0 : appBarHeight,
          float: 'right',
          paddingTop: theme.spacing(2),
          position: fsIconPos,
          right: theme.spacing(2),
          zIndex: theme.zIndex.appBar + 1
        })}
      >
        {fullscreenSupported ? null : isFullscreen ? (
          <IconButton onClick={handleExitFullscreen} size="large">
            <FullscreenExit />
          </IconButton>
        ) : (
          <IconButton onClick={handleEnterFullscreen} size="large">
            <Fullscreen />
          </IconButton>
        )}
      </Box>
      <PageContent margin={margin} mb={mb} ml={ml} mr={mr} mt={mt}>
        {children}
      </PageContent>
    </Box>
  );
};

export const PageFullscreen = memo(PageFullscreenInternal);
