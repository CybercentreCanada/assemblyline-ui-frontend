import { IconButton, makeStyles, useTheme } from '@material-ui/core';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import useAppBarHeight from 'commons/components/hooks/useAppBarHeight';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import useFullscreenStatus from 'commons/components/hooks/useFullscreenStatus';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.default
  },
  toggle: {
    float: 'right',
    paddingTop: theme.spacing(2),
    position: 'sticky',
    right: theme.spacing(2),
    zIndex: theme.zIndex.appBar + 1
  }
}));

interface PageFullscreenProps {
  children: React.ReactNode;
  margin?: number;
}
const PageFullscreen: React.FC<PageFullscreenProps> = ({ children, margin = 2 }) => {
  const maximizableElement = React.useRef(null);
  const appBarHeight = useAppBarHeight();
  const { currentLayout, autoHideAppbar } = useAppLayout();
  let isFullscreen;
  let setIsFullscreen;
  let fullscreenSupported;

  const barWillHide = currentLayout !== 'top' && autoHideAppbar;

  try {
    [isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement);
  } catch (e) {
    fullscreenSupported = false;
    isFullscreen = false;
    setIsFullscreen = undefined;
  }

  const classes = useStyles();
  const theme = useTheme();

  const handleEnterFullscreen = () => {
    setIsFullscreen();
  };

  const handleExitFullscreen = () => {
    document.exitFullscreen();
  };

  return (
    <div ref={maximizableElement} className={classes.root}>
      <div className={classes.toggle} style={{ top: barWillHide ? 0 : appBarHeight }}>
        {fullscreenSupported ? null : isFullscreen ? (
          <IconButton onClick={handleExitFullscreen}>
            <FullscreenExitIcon />
          </IconButton>
        ) : (
          <IconButton onClick={handleEnterFullscreen}>
            <FullscreenIcon />
          </IconButton>
        )}
      </div>
      <div style={{ margin: theme.spacing(margin) }}>{children}</div>
    </div>
  );
};

export default PageFullscreen;
