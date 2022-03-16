import React from 'react';
import { HoverActionType, HoverRef, HoverState, HOVER_MOUSE_ENTER } from '../models/Hover';
import { ActionProps, Ref, Store } from '../models/NewStore';
// import { addClass } from '../actions/StyleActions';

export const initialState: HoverState = {
  count: 0
};

export const initialRef: HoverRef = {
  isMouseDown: false
};

const isAction = (action: ActionProps, type: HoverActionType) => action?.type === type;
const isMouseUp = (action: ActionProps) => !action?.refs?.current.isMouseDown;

const mouseEnter = (state: Store, { type, refs, payload }: ActionProps) => {
  console.log(state, payload);
  // !refs.current.isMouseDown ?? addClass(refs.current.body, payload.index, refs.current.classes.cell.hover);

  return { ...state };
};

export const useAction = (
  dispatch: React.MutableRefObject<React.Dispatch<ActionProps>>,
  refs: React.MutableRefObject<Ref>
) => {
  const onHoverMouseEnter = React.useCallback(
    (index: number) => dispatch.current({ type: HOVER_MOUSE_ENTER, refs: refs, payload: { index } }),
    [dispatch]
  );

  return {
    onHoverMouseEnter
  };
};

export const reducer = (state: Store, action: ActionProps) => {
  if (isAction(action, HOVER_MOUSE_ENTER) && isMouseUp(action)) return mouseEnter(state, action);
  else return { ...state };
};
