import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { useAppBar, useAppBarHeight, useAppLayout, useFullscreenStatus } from '@tui/core';
import browser from 'browser-detect';
import { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContent } from 'ui/pages/PageContent';

export type PageFullscreenProps = {
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

  let isFullscreen = false;
  let setIsFullscreen: (() => void) | null = null;
  let supportsFullscreen = true;

  const barWillHide = layout?.current !== 'top' && appbar?.autoHide;

  const isFirefox = useMemo(() => browser().name === 'firefox', []);

  try {
    [isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement);
  } catch {
    supportsFullscreen = false;
  }

  const handleEnterFullscreen = useCallback(() => {
    if (setIsFullscreen) {
      setIsFullscreen();
    }
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
            position: fsIconPos,
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: 16,
            paddingRight: 16,
            zIndex: theme.zIndex.appBar + 1,
            top: barWillHide || isFullscreen ? 0 : appBarHeight,
            right: 0,
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
          {supportsFullscreen && (
            <Tooltip title={t(isFullscreen ? 'fullscreen.off' : 'fullscreen.on')}>
              <span>
                <IconButton onClick={isFullscreen ? handleExitFullscreen : handleEnterFullscreen} size="large">
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </span>
            </Tooltip>
          )}
        </div>
        {children}
      </PageContent>
    </div>
  );
};

export const PageFullScreen = memo(PageFullscreen);

PageFullScreen.displayName = 'PageFullScreen';
