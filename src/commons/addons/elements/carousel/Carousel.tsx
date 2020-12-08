/* eslint-disable jsx-a11y/no-static-element-interactions */
import { makeStyles } from '@material-ui/core';
import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import React, { useRef } from 'react';

const useStyles = makeStyles(theme => ({
  container: {
    outline: 'none'
  }
}));

export interface CarouselProps {
  disableArrowUp?: boolean;
  disableArrowDown?: boolean;
  disableArrowLeft?: boolean;
  disableArrowRight?: boolean;
  enableSwipe?: boolean;
  children: React.ReactNode;
  onNext: () => void;
  onPrevious: () => void;
}

const Carousel: React.FC<CarouselProps> = ({
  enableSwipe,
  disableArrowUp,
  disableArrowDown,
  disableArrowLeft,
  disableArrowRight,
  children,
  onPrevious,
  onNext
}) => {
  const classes = useStyles();
  const touchX = useRef<number>(-1);
  const touchDirection = useRef<'left' | 'right'>();
  const touchStale = useRef<boolean>(false);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const { key } = event;
    if ((!disableArrowLeft && isArrowLeft(key)) || (!disableArrowUp && isArrowUp(key))) {
      onPrevious();
    } else if ((!disableArrowRight && isArrowRight(key)) || (!disableArrowDown && isArrowDown(key))) {
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
      onPrevious();
    } else if (touchDirection.current === 'left') {
      onNext();
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
      {children}
    </div>
  );
};

export default Carousel;
