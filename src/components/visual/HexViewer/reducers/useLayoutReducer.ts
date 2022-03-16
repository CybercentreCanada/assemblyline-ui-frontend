import { useCallback, useMemo } from 'react';
import { isLayoutChangeAction, isLayoutResizeAction } from '../actions/useLayoutAction';
import { LayoutRef, LayoutState } from '../models/Layout';
import { ActionProps, Store } from '../models/NewStore';
// import { addClass } from '../actions/StyleActions';

export const useLayoutReducer = () => {
  const initialState = useMemo<LayoutState>(
    () => ({
      layoutColumns: 8,
      layoutRows: 5,
      layoutAutoColumns: true,
      layoutAutoRows: true,
      layoutType: 'page',
      bodyType: 'list'
    }),
    []
  );

  const initialRef = useMemo<LayoutRef>(() => ({
    bodyRef: null
  }), []);

  const layoutResize = useCallback(
    (state: Store, { type, refs, payload }: ActionProps) => ({
      ...state,
      data: payload.data
    }),
    []
  );

  const layoutChange = useCallback(
    (state: Store, { type, refs, payload }: ActionProps) => ({
      ...state,
      ...payload
    }),
    []
  );

  const reducer = useCallback(
    (prevState: Store, nextState: Store, refs: React.MutableRefObject<LayoutRef>, action: ActionProps) => {
      if (isLayoutResizeAction(action)) return layoutResize(nextState, action);
      else if (isLayoutChangeAction(action)) return layoutChange(nextState, action);
      else return { ...nextState };
    },
    [layoutChange, layoutResize]
  );

  return { initialState, initialRef, reducer };
};
