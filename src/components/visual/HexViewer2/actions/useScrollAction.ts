import { ChangeEvent, TouchEvent, useCallback } from 'react';
import { ACTIONS, DispatchProp } from '..';

export type ScrollActions = {
  scrollButtonClick: 'SCROLL_CLICK_BUTTON_ACTION';
  scrollSliderChange: 'SCROLL_SLIDER_CHANGE_ACTION';
  scrollSliderMouseDown: 'SCROLL_SLIDER_MOUSE_DOWN_ACTION';
  scrollTouchStart: 'SCROLL_TOUCH_START_ACTION';
  scrollTouchEnd: 'SCROLL_TOUCH_END_ACTION';
  scrollTouchMove: 'SCROLL_TOUCH_MOVE_ACTION';
};

export const SCROLL_ACTIONS: ScrollActions = {
  scrollButtonClick: 'SCROLL_CLICK_BUTTON_ACTION',
  scrollSliderChange: 'SCROLL_SLIDER_CHANGE_ACTION',
  scrollSliderMouseDown: 'SCROLL_SLIDER_MOUSE_DOWN_ACTION',
  scrollTouchStart: 'SCROLL_TOUCH_START_ACTION',
  scrollTouchEnd: 'SCROLL_TOUCH_END_ACTION',
  scrollTouchMove: 'SCROLL_TOUCH_MOVE_ACTION'
} as ScrollActions;

export type ScrollActionProps = {
  onScrollButtonClick: (deltaY: number) => void;
  onScrollSliderChange: (event: ChangeEvent, newValue: number) => void;
  onScrollSliderMouseDown: () => void;
  onScrollTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  onScrollTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
  onScrollTouchMove: (event: TouchEvent<HTMLDivElement>) => void;
};

export const useScrollAction = (dispatch: DispatchProp): ScrollActionProps => {
  const onScrollButtonClick = useCallback(
    (value: number) => dispatch(ACTIONS.scrollButtonClick, { value }),
    [dispatch]
  );

  const onScrollSliderChange = useCallback(
    (event: ChangeEvent, newValue: number) => dispatch(ACTIONS.scrollSliderChange, { event, newValue }),
    [dispatch]
  );

  const onScrollSliderMouseDown = useCallback(() => dispatch(ACTIONS.scrollSliderMouseDown, null), [dispatch]);

  const onScrollTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => dispatch(ACTIONS.scrollTouchStart, { event }),
    [dispatch]
  );

  const onScrollTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => dispatch(ACTIONS.scrollTouchEnd, { event }),
    [dispatch]
  );

  const onScrollTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => dispatch(ACTIONS.scrollTouchMove, { event }),
    [dispatch]
  );

  return {
    onScrollButtonClick,
    onScrollSliderChange,
    onScrollSliderMouseDown,
    onScrollTouchStart,
    onScrollTouchEnd,
    onScrollTouchMove
  };
};
