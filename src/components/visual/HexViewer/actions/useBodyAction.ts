import { KeyboardEvent, MouseEvent, useCallback } from 'react';
import { ListOnItemsRenderedProps } from 'react-window';
import { ACTIONS, DispatchProp, isArrowKey, isCopyKey, isFocus, isHomeEndKey, isPageKey, Store } from '..';

export type BodyActions = {
  bodyInit: 'BODY_INIT_ACTION';
  bodyResize: 'BODY_RESIZE_ACTION';
  bodyMouseLeave: 'BODY_MOUSE_LEAVE_ACTION';
  bodyMouseUp: 'BODY_MOUSE_UP_ACTION';
  bodyScrollWheel: 'BODY_SCROLL_WHEEL_ACTION';
  bodyItemsRendered: 'BODY_ITEMS_RENDERED_ACTION';
  cursorKeyDown: 'CURSOR_KEY_DOWN_ACTION';
  copyKeyDown: 'COPY_KEYDOWN_ACTION';
};

export const BODY_ACTIONS: BodyActions = {
  bodyInit: 'BODY_INIT_ACTION',
  bodyResize: 'BODY_RESIZE_ACTION',
  bodyMouseLeave: 'BODY_MOUSE_LEAVE_ACTION',
  bodyMouseUp: 'BODY_MOUSE_UP_ACTION',
  bodyScrollWheel: 'BODY_SCROLL_WHEEL_ACTION',
  bodyItemsRendered: 'BODY_ITEMS_RENDERED_ACTION',
  cursorKeyDown: 'CURSOR_KEY_DOWN_ACTION',
  copyKeyDown: 'COPY_KEYDOWN_ACTION'
} as BodyActions;

export type BodyActionProps = {
  onBodyInit: (value: boolean) => void;
  onBodyResize: ({ width: height }: { width: number; height: number }) => void;
  onBodyMouseLeave: () => void;
  onBodyScrollWheel: (...props: any[]) => void;
  onBodyItemsRendered: (event: ListOnItemsRenderedProps) => void;
  onBodyKeyDown: (event: KeyboardEvent, store: Store) => void;
  onBodyMouseUp: (event: MouseEvent, store: Store) => void;
};

export const useBodyAction = (dispatch: DispatchProp): BodyActionProps => {
  const onBodyInit = useCallback((value: boolean) => dispatch(ACTIONS.bodyInit, { value }), [dispatch]);

  const onBodyResize = useCallback(
    ({ width = 1000, height = 1000 }: { width?: number; height?: number }) =>
      dispatch(ACTIONS.bodyResize, { width, height }, false, true),
    [dispatch]
  );

  const onBodyMouseLeave = useCallback(() => dispatch(ACTIONS.bodyMouseLeave, null, false, false), [dispatch]);

  const onBodyScrollWheel = useCallback((deltaY: number) => dispatch(ACTIONS.bodyScrollWheel, { deltaY }), [dispatch]);

  const onBodyItemsRendered = useCallback(
    (event: ListOnItemsRenderedProps) => dispatch(ACTIONS.bodyItemsRendered, { event }),
    [dispatch]
  );

  const cursorKeyDownGuard = useCallback(
    (event: KeyboardEvent): boolean => isArrowKey(event) || isHomeEndKey(event) || isPageKey(event),
    []
  );

  const onBodyKeyDown = useCallback(
    (event: KeyboardEvent, store: Store) => {
      if (!isFocus.body(store) && !(cursorKeyDownGuard(event) || isCopyKey(event))) return;
      event.preventDefault();
      if (cursorKeyDownGuard(event)) dispatch(ACTIONS.cursorKeyDown, { event });
      else if (isCopyKey(event)) dispatch(ACTIONS.copyKeyDown, null, true, false);
    },
    [cursorKeyDownGuard, dispatch]
  );

  const onBodyMouseUp = useCallback(
    (event: MouseEvent, store: Store) => {
      console.log('test', store.layout.isFocusing);
      if (isFocus.body(store)) dispatch(ACTIONS.bodyMouseUp, { event });
    },
    [dispatch]
  );

  return {
    onBodyInit,
    onBodyResize,
    onBodyMouseLeave,
    onBodyScrollWheel,
    onBodyItemsRendered,
    onBodyKeyDown,
    onBodyMouseUp
  };
};
