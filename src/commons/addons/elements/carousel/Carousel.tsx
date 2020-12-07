/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Fab, makeStyles } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import React, { useRef } from 'react';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    outline: 'none'
  },
  left: {
    position: 'absolute',
    zIndex: 100,
    top: 0,
    left: 0,
    bottom: 0,
    width: 75,
    '&:hover $button': {
      opacity: 1
    }
  },
  content: {
    overflow: 'auto',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  right: {
    position: 'absolute',
    zIndex: 100,
    top: 0,
    right: 20, // gets over scrollbar.
    bottom: 0,
    width: 75,
    '&:hover $button': {
      opacity: 1
    }
  },
  button: {
    opacity: 0,
    position: 'absolute',
    top: '50%'
  }
}));

export interface CarouselProps {
  enableSwipe?: boolean;
  children: React.ReactNode;
  onNext: () => void;
  onPrevious: () => void;
}

const Carousel: React.FC<CarouselProps> = ({ enableSwipe, children, onPrevious, onNext }) => {
  const classes = useStyles();
  const touchX = useRef<number>(-1);
  const touchDirection = useRef<'left' | 'right'>();
  const touchStale = useRef<boolean>(false);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const { key } = event;
    if (isArrowLeft(key) || isArrowUp(key)) {
      onPrevious();
    } else if (isArrowRight(key) || isArrowDown(key)) {
      onNext();
    }
  };

  const onTouchStart = (event: React.TouchEvent) => {
    touchX.current = event.touches[0].clientX;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!touchStale.current) {
      // Where it's at.
      const moveX = event.touches[0].clientX;

      // Touch direction..
      let nextDirection = null;
      if (moveX > touchX.current) {
        nextDirection = 'right';
      } else {
        nextDirection = 'left';
      }

      if (touchDirection.current && nextDirection !== touchDirection.current) {
        // if there is a change in direction, we mark the touch as stale.
        // this will let users scroll left-right when there is overflow.
        touchStale.current = true;
        touchDirection.current = null;
      } else {
        // the direction of the touch motion.
        touchDirection.current = nextDirection;
      }

      // Track last touch position to detect direction change next time around.
      touchX.current = moveX;
    }
  };

  const onTouchEnd = () => {
    if (touchDirection.current === 'right') {
      onNext();
    } else if (touchDirection.current === 'left') {
      onPrevious();
    }
    touchDirection.current = null;
    touchStale.current = false;
  };

  return (
    <div
      tabIndex={-1}
      className={classes.container}
      onKeyDown={onKeyDown}
      onTouchStart={enableSwipe && onTouchStart}
      onTouchMove={enableSwipe && onTouchMove}
      onTouchEnd={enableSwipe && onTouchEnd}
    >
      <div className={classes.left}>
        <Fab className={classes.button} style={{ left: 10 }} color="default" onClick={onPrevious}>
          <ChevronLeftIcon />
        </Fab>
      </div>
      <div className={classes.content}>{children}</div>
      <div className={classes.right}>
        <Fab className={classes.button} style={{ right: 0 }} color="default" onClick={onNext}>
          <ChevronRightIcon />
        </Fab>
      </div>
    </div>
  );
};

export default Carousel;
