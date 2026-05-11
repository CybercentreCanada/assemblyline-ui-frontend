import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import browser from 'browser-detect';
import { useAppBar, useAppBarHeight, useAppLayout } from 'commons/components/app/hooks';
import PageContent from 'commons/components/pages/PageContent';
import useFullscreenStatus from 'commons/components/utils/hooks/useFullscreenStatus';
import { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type PageFullscreenProps = {
  children: React.ReactNode;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  test?: React.CSSProperties;
  fsIconPos?: 'absolute' | 'fixed' | 'relative' | 'static' | 'sticky'; // fullscreen icon position
};

const PageFullscreen = ({
  children,
  margin = null,
  mb = 2,
  ml = 2,
  mr = 2,
  mt = 2,
  fsIconPos = 'sticky'
}: PageFullscreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const appBarHeight = useAppBarHeight();
  const layout = useAppLayout();
  const appbar = useAppBar();

  const maximizableElement = useRef(null);

  let isFullscreen: boolean;
  let setIsFullscreen: () => void;
  let fullscreenSupported: boolean;

  const barWillHide = layout.current !== 'top' && appbar.autoHide;

  const isFirefox = useMemo(() => browser().name === 'firefox', []);

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
    <div
      ref={maximizableElement}
      style={{
        backgroundColor: theme.palette.background.default,
        overflowY: isFullscreen ? 'auto' : 'unset'
      }}
    >
      <PageContent margin={margin} mb={mb} ml={ml} mr={mr} mt={mt}>
        <div
          style={{
            float: 'right',
            paddingTop: theme.spacing(2),
            position: fsIconPos,
            right: theme.spacing(2),
            zIndex: theme.zIndex.appBar + 1,
            top: barWillHide || isFullscreen ? 0 : appBarHeight,
            ...(!isFirefox
              ? null
              : !isFullscreen
                ? {
                    position: 'fixed',
                    top: '96px',
                    right: '32px'
                  }
                : {
                    position: 'fixed',
                    top: '32px',
                    right: '32px'
                  })
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
        {children}
      </PageContent>
    </div>
  );
};

export default memo(PageFullscreen);
