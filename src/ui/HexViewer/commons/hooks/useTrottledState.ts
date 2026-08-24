import { useCallback, useRef, useState } from 'react';

const isFunction = (value: any): value is Function => typeof value === 'function';

export const useTrottledState = <T>(
  initialState: T | (() => T),
  delay: number = 1000
): [Partial<T>, (newState: Partial<T> | ((prevState: Partial<T>) => Partial<T>)) => void] => {
  const [state, setState] = useState<Partial<T>>(initialState);
  const prevStateRef = useRef<Partial<T>>(state);
  const nextStateRef = useRef<Partial<T>>(state);
  const timeout = useRef(null);

  const clear = useCallback(() => {
    clearTimeout(timeout.current);
    timeout.current = null;
  }, []);

  const reset = useCallback(() => {
    timeout.current = setTimeout(() => {
      if (!Object.is(prevStateRef.current, nextStateRef.current)) {
        prevStateRef.current = nextStateRef.current;
        setState(prevStateRef.current);
        clear();
        reset();
      } else clear();
    }, delay);
  }, [clear, delay]);

  const setStateCallback = useCallback(
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
