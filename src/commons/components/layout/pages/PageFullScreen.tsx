import { Box, IconButton, makeStyles, useScrollTrigger } from '@material-ui/core';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import useFullscreenStatus from 'commons/components/hooks/useFullscreenStatus';
import React from 'react';

const useStyles = (isFullscreen, topbarShown) => {
  return makeStyles(theme => ({
    root: {
      backgroundColor: isFullscreen ? theme.palette.background.default : theme.palette.background.default,
      overflow: 'auto'
    },
    page: {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: isFullscreen ? theme.spacing(2) : 'auto',
      marginTop: isFullscreen ? theme.spacing(3) : theme.spacing(6),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        paddingLeft: isFullscreen ? theme.spacing(2) : 0,
        paddingRight: isFullscreen ? theme.spacing(2) : 0
      }
    },
    toggle: {
      position: 'fixed',
      right: isFullscreen ? '30px' : '20px',
      top: isFullscreen || !topbarShown ? '20px' : '84px',
      zIndex: theme.zIndex.appBar + 1,
      transition: theme.transitions.create('top', {
        easing: theme.transitions.easing.easeInOut,
        duration: '0.15s'
      }),
      [theme.breakpoints.down('xs')]: {
        right: '16px',
        top: isFullscreen || !topbarShown ? '8px' : '60px'
      }
    }
  }))();
};

function MoveOnScroll({ children, enabled, isFullscreen }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0
  });

  const classes = useStyles(isFullscreen, !trigger || !enabled);
  return <Box className={classes.toggle}>{children}</Box>;
}

export default function PageFullscreen({ children }) {
  const maximizableElement = React.useRef(null);
  let isFullscreen;
  let setIsFullscreen;
  let fullscreenSupported;

  try {
    [isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement);
  } catch (e) {
    fullscreenSupported = false;
    isFullscreen = false;
    setIsFullscreen = undefined;
  }

  const classes = useStyles(isFullscreen, true);
  const { autoHideAppbar, currentLayout } = useAppLayout();
  const isTopLayout = currentLayout === 'top';

  const handleEnterFullscreen = () => {
    setIsFullscreen();
  };

  const handleExitFullscreen = () => {
    document.exitFullscreen();
  };

  return (
    <div ref={maximizableElement} className={classes.root}>
      <Box className={classes.page}>
        <MoveOnScroll enabled={!isTopLayout && autoHideAppbar} isFullscreen={isFullscreen}>
          {fullscreenSupported ? null : isFullscreen ? (
            <IconButton onClick={handleExitFullscreen}>
              <FullscreenExitIcon />
            </IconButton>
          ) : (
            <IconButton onClick={handleEnterFullscreen}>
              <FullscreenIcon />
            </IconButton>
          )}
        </MoveOnScroll>
        {children}
      </Box>
    </div>
  );
}
