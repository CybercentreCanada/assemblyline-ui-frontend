import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { useFullscreenStatus } from '@tui/core';
import browser from 'browser-detect';
import { useAppInterfaceStore } from 'core/interface';
import { useAppPreferenceStore } from 'core/preference';
import { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export type AppPageFullScreenProps = {
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
}: AppPageFullScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const appBarAutoHides = useAppPreferenceStore(s => s.template.layout !== 'top' && s.template.autoHideAppbar);
  const appBarHeight = useAppInterfaceStore(s => s.template.appBarHeight);

  const maximizableElement = useRef<HTMLDivElement>(null);

  let isFullscreen = false;
  let setIsFullscreen: (() => void) | null = null;
  let supportsFullscreen = true;

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

  const handleExitFullscreen = useCallback(() => {
    void document.exitFullscreen();
  }, []);

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
          ...(margin !== null && { margin: margin }),
          ...(mt !== undefined && { marginTop: mt }),
          ...(mb !== undefined && { marginBottom: mb }),
          ...(ml !== undefined && { marginLeft: ml }),
          ...(mr !== undefined && { marginRight: mr })
        }}
      >
        <div
          style={{
            position: fsIconPos,
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: 16,
            paddingRight: 16,
            zIndex: theme.zIndex.appBar + 1,
            top: appBarAutoHides || isFullscreen ? 0 : appBarHeight,
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
      </div>
    </div>
  );
};

export const AppPageFullScreen = memo(PageFullscreen);

AppPageFullScreen.displayName = 'AppPageFullScreen';
