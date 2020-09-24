export const ENTER = 'Enter';
export const ESCAPE = 'Escape';
export const ARROW_LEFT = 'ArrowLeft';
export const ARROW_UP = 'ArrowUp';
export const ARROW_RIGHT = 'ArrowRight';
export const ARROW_DOWN = 'ArrowDown';

export function is(key: string, checkCode: string) {
  return key === checkCode;
}

export function isArrowUp(key: string) {
  return is(key, ARROW_UP);
}

export function isArrowDown(key: string) {
  return is(key, ARROW_DOWN);
}

export function isArrowLeft(key: string) {
  return is(key, ARROW_LEFT);
}

export function isArrowRight(key: string) {
  return is(key, ARROW_RIGHT);
}

export function isEscape(key: string) {
  return is(key, ESCAPE);
}

export function isEnter(key: string) {
  return is(key, ENTER);
}
