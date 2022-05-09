import React from 'react';

const isFunction = (value: any): value is Function => typeof value === 'function';

export const useTrottledState = <T>(
  initialState: T | (() => T),
  delay: number = 1000
): [Partial<T>, (newState: Partial<T> | ((prevState: Partial<T>) => Partial<T>)) => void] => {
  const [state, setState] = React.useState<Partial<T>>(initialState);
  const prevStateRef = React.useRef<Partial<T>>(state);
  const nextStateRef = React.useRef<Partial<T>>(state);
  const timeout = React.useRef(null);

  const clear = React.useCallback(() => {
    clearTimeout(timeout.current);
    timeout.current = null;
  }, []);

  const reset = React.useCallback(() => {
    timeout.current = setTimeout(() => {
      if (!Object.is(prevStateRef.current, nextStateRef.current)) {
        prevStateRef.current = nextStateRef.current;
        setState(prevStateRef.current);
        clear();
        reset();
      } else clear();
    }, delay);
  }, [clear, delay]);

  const setStateCallback = React.useCallback(
    (newState: Partial<T> | ((prevState: Partial<T>) => Partial<T>)) => {
      if (isFunction(newState)) nextStateRef.current = newState(nextStateRef.current);
      else nextStateRef.current = newState;

      if (timeout.current === null) {
        prevStateRef.current = nextStateRef.current;
        setState(prevStateRef.current);
        reset();
      }
    },
    [reset]
  );

  return [state, setStateCallback];
};

export default useTrottledState;
