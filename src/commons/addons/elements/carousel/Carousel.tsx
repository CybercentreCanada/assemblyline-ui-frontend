/* eslint-disable jsx-a11y/no-static-element-interactions */
import makeStyles from '@mui/styles/makeStyles';
import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp, isEscape } from 'commons/addons/elements/utils/keyboard';
import React, { useEffect, useRef } from 'react';

const useStyles = makeStyles(theme => ({
  container: {
    outline: 'none'
  }
}));

export interface CarouselProps {
  autofocus?: boolean;
  disableArrowUp?: boolean;
  disableArrowDown?: boolean;
  disableArrowLeft?: boolean;
  disableArrowRight?: boolean;
  escapeCallback?: () => void;
  enableSwipe?: boolean;
  style?: any;
  children: React.ReactNode;
  onNext: () => void;
  onPrevious: () => void;
}

const Carousel: React.FC<CarouselProps> = ({
  autofocus,
  enableSwipe,
  disableArrowUp,
  disableArrowDown,
  disableArrowLeft,
  disableArrowRight,
  escapeCallback,
  children,
  onPrevious,
  onNext,
  style
}) => {
  const classes = useStyles();
  const touchX = useRef<number>(-1);
  const touchY = useRef<number>(-1);
  const touchStartX = useRef<number>(-1);
  const touchStartY = useRef<number>(-1);
  const touchDirection = useRef<'left' | 'right' | 'scroll'>();
  const touchStale = useRef<boolean>(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const { key } = event;

    if (isEscape(event.key) && escapeCallback) escapeCallback();

    if ((!disableArrowLeft && isArrowLeft(key)) || (!disableArrowUp && isArrowUp(key))) {
      onPrevious();
    } else if ((!disableArrowRight && isArrowRight(key)) || (!disableArrowDown && isArrowDown(key))) {
      onNext();
    }
  };

  const onTouchStart = (event: React.TouchEvent) => {
    touchX.current = event.touches[0].clientX;
    touchY.current = event.touches[0].clientY;
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!touchStale.current) {
      // Where it's at.
      const moveX = event.touches[0].clientX;
      const moveY = event.touches[0].clientY;

      // Touch direction..
      let nextDirection = null;
      const xDistance = Math.abs(moveX - touchStartX.current);
      const yDistance = Math.abs(moveY - touchStartY.current);

      if (xDistance > yDistance) {
        if (moveX > touchX.current) {
          nextDirection = 'right';
        } else if (moveX < touchX.current) {
          nextDirection = 'left';
        } else {
          nextDirection = 'scroll';
        }
      } else {
        nextDirection = 'scroll';
      }

      if (
        touchDirection.current !== 'scroll' &&
        nextDirection !== 'scroll' &&
        touchDirection.current &&
        nextDirection !== touchDirection.current
      ) {
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
      touchY.current = moveY;
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

  useEffect(() => {
    if (autofocus) carouselRef.current.focus();
  }, [autofocus]);

  return (
    <div
      tabIndex={-1}
      className={classes.container}
      onKeyDown={onKeyDown}
      onTouchStart={enableSwipe && onTouchStart}
      onTouchMove={enableSwipe && onTouchMove}
      onTouchEnd={enableSwipe && onTouchEnd}
      style={style}
      ref={carouselRef}
    >
      {children}
    </div>
  );
};

export default Carousel;
