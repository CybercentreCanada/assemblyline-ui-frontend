import {
  isArrowDown,
  isArrowLeft,
  isArrowRight,
  isArrowUp,
  isEnter,
  isEscape
} from 'commons/addons/elements/utils/keyboard';
import { KeyboardEvent } from 'react';

export const isArrowKey = (event: KeyboardEvent) =>
  isArrowLeft(event.key) || isArrowRight(event.key) || isArrowUp(event.key) || isArrowDown(event.key);

export const isUpDownKey = (event: KeyboardEvent) => isArrowUp(event.key) || isArrowDown(event.key);

export const isEnterKey = (event: KeyboardEvent) => isEnter(event.key);

export const isShiftEnterKey = (event: KeyboardEvent) => isEnter(event.key) && event.shiftKey;

export const isEnterOrShiftKey = (event: KeyboardEvent) => isEnter(event.key) || (isEnter(event.key) && event.shiftKey);

export const isEscapeKey = (event: KeyboardEvent) => isEscape(event.key);

export const isCopyKey = (event: KeyboardEvent) => event.code === 'KeyC' && event.ctrlKey && !event.repeat;

export const isHomeEndKey = (event: KeyboardEvent) => !event.repeat && (event.code === 'Home' || event.code === 'End');

export const isPageKey = (event: KeyboardEvent) => event.code === 'PageUp' || event.code === 'PageDown';

export const isHome = (keyCode: string) => keyCode === 'Home';
export const isEnd = (keyCode: string) => keyCode === 'End';
export const isPageUp = (keyCode: string) => keyCode === 'PageUp';
export const isPageDown = (keyCode: string) => keyCode === 'PageDown';
