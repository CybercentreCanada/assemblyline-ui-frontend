import { KeyboardEvent, useCallback } from 'react';
import { ListOnItemsRenderedProps } from 'react-window';
import {
  ACTIONS,
  ActionTypesConfig,
  Dispatch,
  DispatchersConfig,
  isArrowKey,
  isCopyKey,
  isHomeEndKey,
  isPageKey,
  isType,
  Store
} from '..';

export type BodyAction =
  | { type: 'bodyInit'; payload: { initialized: boolean } }
  | { type: 'bodyRefInit'; payload: { ready: boolean } }
  | { type: 'bodyScrollInit'; payload: void }
  | { type: 'bodyResize'; payload: { width?: number; height?: number }; tracked: false; repeat: true }
  | { type: 'bodyMouseLeave'; payload: void; tracked: false; repeat: false }
  | { type: 'bodyMouseUp'; payload: void; guard: { store: Store; event: MouseEvent } }
  | { type: 'bodyScrollWheel'; payload: { event: React.WheelEvent<HTMLDivElement> } }
  | { type: 'bodyItemsRendered'; payload: { event: ListOnItemsRenderedProps | null } }
  | { type: 'cursorKeyDown'; payload: { event: KeyboardEvent }; guard: { store: Store } }
  | { type: 'copyKeyDown'; payload: void; guard: { event: KeyboardEvent; store: Store }; tracked: true; repeat: false };

export type BodyActionTypes = ActionTypesConfig<BodyAction>;
export type BodyDispatchers = DispatchersConfig<BodyAction>;

export const BODY_ACTION_TYPES: BodyActionTypes = {
  bodyInit: 'BodyInit_Action',
  bodyRefInit: 'BodyRefInit_Action',
  bodyScrollInit: 'BodyScrollInit_Action',
  bodyResizeInit: 'BodyResizeInit_Action',
  bodyResize: 'BodyResize_Action',
  bodyMouseLeave: 'BodyMouseLeave_Action',
  bodyMouseUp: 'BodyMouseUp_Action',
  bodyScrollWheel: 'BodyScrollWheel_Action',
  bodyItemsRendered: 'BodyItemsRendered_Action',
  cursorKeyDown: 'CursorKeyDown_Action',
  copyKeyDown: 'CopyKeyDown_Action'
} as BodyActionTypes;

export const useBodyDispatcher = (dispatch: Dispatch): BodyDispatchers => {
  const cursorKeyDownGuard = useCallback(
    (event: KeyboardEvent): boolean => isArrowKey(event) || isHomeEndKey(event) || isPageKey(event),
    []
  );

  const onBodyResize: BodyDispatchers['onBodyResize'] = useCallback(
    ({ width = 1000, height = 1000 }) =>
      dispatch({ type: ACTIONS.bodyResize, payload: { width, height }, tracked: false, repeat: true }),
    [dispatch]
  );

  const onCursorKeyDown: BodyDispatchers['onCursorKeyDown'] = useCallback(
    ({ event }, { store }) => {
      if (!(isType.layout.isFocusing(store, 'body') && cursorKeyDownGuard(event))) return;
      event.preventDefault();
      dispatch({ type: ACTIONS.cursorKeyDown, payload: { event } });
    },
    [cursorKeyDownGuard, dispatch]
  );

  const onCopyKeyDown: BodyDispatchers['onCopyKeyDown'] = useCallback(
    (_, { event, store }) => {
      if (!(isType.layout.isFocusing(store, 'body') && isCopyKey(event))) return;
      event.preventDefault();
      dispatch({ type: ACTIONS.copyKeyDown, payload: null, tracked: true, repeat: false });
    },
    [dispatch]
  );

  const onBodyMouseUp: BodyDispatchers['onBodyMouseUp'] = useCallback(
    (payload, { store, event }) => {
      if (!isType.layout.isFocusing(store, 'body') || event.button !== 0) return;
      event.preventDefault();
      dispatch({ type: ACTIONS.bodyMouseUp, payload: null });
    },
    [dispatch]
  );

  return {
    onBodyInit: payload => dispatch({ type: ACTIONS.bodyInit, payload }),
    onBodyRefInit: payload => dispatch({ type: ACTIONS.bodyRefInit, payload }),
    onBodyScrollInit: payload => dispatch({ type: ACTIONS.bodyScrollInit, payload }),
    onBodyResize,
    onBodyMouseLeave: () => dispatch({ type: ACTIONS.bodyMouseLeave, payload: null, tracked: false, repeat: false }),
    onBodyScrollWheel: payload => dispatch({ type: ACTIONS.bodyScrollWheel, payload }),
    onBodyItemsRendered: payload => dispatch({ type: ACTIONS.bodyItemsRendered, payload }),
    onCursorKeyDown,
    onCopyKeyDown,
    onBodyMouseUp
  };
};
