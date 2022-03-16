import React from 'react';

export const HOVER_MOUSE_ENTER = 'HOVER_MOUSE_ENTER';
export const HOVER_MOUSE_LEAVE = 'HOVER_MOUSE_LEAVE';
export const HOVER_MOUSE_DOWN = 'HOVER_MOUSE_DOWN';
export const HOVER_MOUSE_UP = 'HOVER_MOUSE_UP';

export type HoverActionType =
  | typeof HOVER_MOUSE_ENTER
  | typeof HOVER_MOUSE_LEAVE
  | typeof HOVER_MOUSE_DOWN
  | typeof HOVER_MOUSE_UP;

export type HoverState = {
  count: number;
};

export type HoverRef = {
  isMouseDown?: boolean;
};

export type HoverPayload = any;

export type HoverActionProps = {
  type: HoverActionType;
  refs?: React.MutableRefObject<HoverRef>;
  payload: HoverPayload;
};

export type HoverDispatch = {
  onHoverMouseEnter: (index: number) => any;
};
