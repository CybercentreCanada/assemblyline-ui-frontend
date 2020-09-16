export const ENTER = 13;
export const ESCAPE = 27;
export const ARROW_LEFT = 37;
export const ARROW_UP = 38;
export const ARROW_RIGHT = 39;
export const ARROW_DOWN = 40;

export function is(keyCode: number, checkCode: number) {
  return keyCode === checkCode;
}

export function isArrowUp(keyCode: number) {
  return is(keyCode, ARROW_UP);
}

export function isArrowDown(keyCode: number) {
  return is(keyCode, ARROW_DOWN);
}

export function isArrowLeft(keyCode: number) {
  return is(keyCode, ARROW_LEFT);
}

export function isArrowRight(keyCode: number) {
  return is(keyCode, ARROW_RIGHT);
}

export function isEscape(keyCode: number) {
  return is(keyCode, ESCAPE);
}

export function isEnter(keyCode: number) {
  return is(keyCode, ENTER);
}
