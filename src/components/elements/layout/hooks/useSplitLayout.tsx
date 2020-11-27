/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from 'react';

export const SPLITLAYOUT_LEFT_OPEN_EVENTNAME = 'mui.elements.splitview.left.open';
export const SPLITLAYOUT_LEFT_CLOSE_EVENTNAME = 'mui.elements.splitview.left.close';
export const SPLITLAYOUT_LEFT_TOGGLE_EVENTNAME = 'mui.elements.splitview.left.toggle';
export const SPLITLAYOUT_RIGHT_OPEN_EVENTNAME = 'mui.elements.splitview.right.open';
export const SPLITLAYOUT_RIGHT_CLOSE_EVENTNAME = 'mui.elements.splitview.right.close';
export const SPLITLAYOUT_RIGHT_TOGGLE_EVENTNAME = 'mui.elements.splitview.right.toggle';

interface UseSplitLayoutHandlers {
  onOpenLeft: () => void;
  onCloseLeft: () => void;
  onOpenRight: () => void;
  onCloseRight: () => void;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

interface UsingSplitLayout {
  openLeft: () => void;
  closeLeft: () => void;
  openRight: () => void;
  closeRight: () => void;
  toggleLeft: () => void;
  toggleRight: () => void;
  register: (handlers: UseSplitLayoutHandlers) => () => void;
}

export default function useSplitLayout(id: string): UsingSplitLayout {
  const openLeft = () => {
    window.dispatchEvent(new CustomEvent(`${SPLITLAYOUT_LEFT_OPEN_EVENTNAME}.${id}`));
  };

  const closeLeft = () => {
    window.dispatchEvent(new CustomEvent(`${SPLITLAYOUT_LEFT_CLOSE_EVENTNAME}.${id}`));
  };

  const openRight = () => {
    window.dispatchEvent(new CustomEvent(`${SPLITLAYOUT_RIGHT_OPEN_EVENTNAME}.${id}`));
  };

  const closeRight = () => {
    window.dispatchEvent(new CustomEvent(`${SPLITLAYOUT_RIGHT_CLOSE_EVENTNAME}.${id}`));
  };

  const toggleLeft = () => {
    window.dispatchEvent(new CustomEvent(`${SPLITLAYOUT_LEFT_TOGGLE_EVENTNAME}.${id}`));
  };

  const toggleRight = () => {
    window.dispatchEvent(new CustomEvent(`${SPLITLAYOUT_LEFT_TOGGLE_EVENTNAME}.${id}`));
  };

  const register = (handlers: UseSplitLayoutHandlers): (() => void) => {
    window.addEventListener(`${SPLITLAYOUT_LEFT_OPEN_EVENTNAME}.${id}`, handlers.onOpenLeft);
    window.addEventListener(`${SPLITLAYOUT_LEFT_CLOSE_EVENTNAME}.${id}`, handlers.onCloseLeft);
    window.addEventListener(`${SPLITLAYOUT_RIGHT_OPEN_EVENTNAME}.${id}`, handlers.onOpenRight);
    window.addEventListener(`${SPLITLAYOUT_RIGHT_CLOSE_EVENTNAME}.${id}`, handlers.onCloseRight);
    window.addEventListener(`${SPLITLAYOUT_LEFT_TOGGLE_EVENTNAME}.${id}`, handlers.onToggleLeft);
    window.addEventListener(`${SPLITLAYOUT_RIGHT_TOGGLE_EVENTNAME}.${id}`, handlers.onToggleRight);
    return () => {
      window.removeEventListener(`${SPLITLAYOUT_LEFT_OPEN_EVENTNAME}.${id}`, handlers.onOpenLeft);
      window.removeEventListener(`${SPLITLAYOUT_LEFT_CLOSE_EVENTNAME}.${id}`, handlers.onCloseLeft);
      window.removeEventListener(`${SPLITLAYOUT_RIGHT_OPEN_EVENTNAME}.${id}`, handlers.onOpenRight);
      window.removeEventListener(`${SPLITLAYOUT_RIGHT_CLOSE_EVENTNAME}.${id}`, handlers.onCloseRight);
      window.removeEventListener(`${SPLITLAYOUT_LEFT_TOGGLE_EVENTNAME}.${id}`, handlers.onToggleLeft);
      window.removeEventListener(`${SPLITLAYOUT_RIGHT_TOGGLE_EVENTNAME}.${id}`, handlers.onToggleRight);
    };
  };

  return {
    openLeft: useCallback(openLeft, []),
    closeLeft: useCallback(closeLeft, []),
    toggleLeft: useCallback(toggleLeft, []),
    openRight: useCallback(openRight, []),
    closeRight: useCallback(closeRight, []),
    toggleRight: useCallback(toggleRight, []),
    register: useCallback(register, [])
  };
}
