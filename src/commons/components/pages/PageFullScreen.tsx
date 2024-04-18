import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import useAppBar from 'commons/components/app/hooks/useAppBar';
import useAppBarHeight from 'commons/components/app/hooks/useAppBarHeight';
import useAppLayout from 'commons/components/app/hooks/useAppLayout';
import useFullscreenStatus from 'commons/components/utils/hooks/useFullscreenStatus';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from './PageContent';

type PageFullscreenProps = {
  children: React.ReactNode;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
};

const PageFullscreen = ({ children, margin = null, mb = 2, ml = 2, mr = 2, mt = 2 }: PageFullscreenProps) => {
  const maximizableElement = useRef(null);
  const appBarHeight = useAppBarHeight();
  const layout = useAppLayout();
  const appbar = useAppBar();
  const { t } = useTranslation();
  const theme = useTheme();
  let isFullscreen: boolean;
  let setIsFullscreen: () => void;
  let fullscreenSupported: boolean;

  const barWillHide = layout.current !== 'top' && appbar.autoHide;

  try {
    [isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement);
  } catch (e) {
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
    <div
      ref={maximizableElement}
      style={{
        backgroundColor: theme.palette.background.default,
        overflowY: isFullscreen ? 'auto' : 'unset'
      }}
    >
      <div
        style={{
          top: barWillHide || isFullscreen ? 0 : appBarHeight,
          float: 'right',
          paddingTop: theme.spacing(2),
          position: 'fixed',
          right: theme.spacing(2),
          zIndex: theme.zIndex.appBar + 1
        }}
      >
        {fullscreenSupported ? null : (
          <Tooltip title={t(isFullscreen ? 'fullscreen.off' : 'fullscreen.on')}>
            <div>
              <IconButton onClick={isFullscreen ? handleExitFullscreen : handleEnterFullscreen} size="large">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </div>
          </Tooltip>
        )}
      </div>
      <PageContent margin={margin} mb={mb} ml={ml} mr={mr} mt={mt}>
        {children}
      </PageContent>
    </div>
  );
};

export default memo(PageFullscreen);
