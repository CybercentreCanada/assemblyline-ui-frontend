import { TouchEvent } from 'react';
import { ACTIONS, ActionTypesConfig, Dispatch, DispatchersConfig } from '..';

export type ScrollAction =
  | { type: 'scrollButtonClick'; payload: { value: number } }
  | {
      type: 'scrollSliderChange';
      payload: { event: React.ChangeEvent<{}> | KeyboardEvent; newValue: number | number[] };
    }
  | { type: 'scrollSliderMouseDown'; payload: null }
  | { type: 'scrollTouchStart'; payload: { event: TouchEvent<HTMLDivElement> } }
  | { type: 'scrollTouchEnd'; payload: void }
  | { type: 'scrollTouchMove'; payload: { event: TouchEvent<HTMLDivElement> } };

export type ScrollActionTypes = ActionTypesConfig<ScrollAction>;
export type ScrollDispatchers = DispatchersConfig<ScrollAction>;

export const SCROLL_ACTION_TYPES: ScrollActionTypes = {
  scrollButtonClick: 'ScrollButtonClick_Action',
  scrollSliderChange: 'ScrollSliderChange_Action',
  scrollSliderMouseDown: 'ScrollSliderMouseDown_Action',
  scrollTouchStart: 'ScrollTouchStart_Action',
  scrollTouchEnd: 'ScrollTouchEnd_Action',
  scrollTouchMove: 'ScrollTouchMove_Action'
} as ScrollActionTypes;

export const useScrollDispatcher = (dispatch: Dispatch): ScrollDispatchers => {
  return {
    onScrollButtonClick: payload => dispatch({ type: ACTIONS.scrollButtonClick, payload }),
    onScrollSliderChange: payload => dispatch({ type: ACTIONS.scrollSliderChange, payload }),
    onScrollSliderMouseDown: payload => dispatch({ type: ACTIONS.scrollSliderMouseDown, payload }),
    onScrollTouchStart: payload => dispatch({ type: ACTIONS.scrollTouchStart, payload }),
    onScrollTouchEnd: payload => dispatch({ type: ACTIONS.scrollTouchEnd, payload }),
    onScrollTouchMove: payload => dispatch({ type: ACTIONS.scrollTouchMove, payload })
  };
};
