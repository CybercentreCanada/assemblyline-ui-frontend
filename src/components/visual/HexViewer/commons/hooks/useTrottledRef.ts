import React from 'react';

const isFunction = (value: any): value is Function => typeof value === 'function';

export const useTrottledRef = <T>(
  initialState: T,
  delay: number = 1000
): [React.MutableRefObject<Partial<T>>, (newState: Partial<T> | ((prevState: Partial<T>) => Partial<T>)) => void] => {
  const ref = React.useRef<Partial<T>>(initialState);
  const nextRef = React.useRef<Partial<T>>(initialState);
  const timeout = React.useRef(null);

  const clear = React.useCallback(() => {
    clearTimeout(timeout.current);
    timeout.current = null;
  }, []);

  const reset = React.useCallback(() => {
    timeout.current = setTimeout(() => {
      if (!Object.is(ref.current, nextRef.current)) {
        ref.current = nextRef.current;
        clear();
        reset();
      } else clear();
    }, delay);
  }, [clear, delay]);

  const setRefCallback = React.useCallback(
    (newState: Partial<T> | ((prevState: Partial<T>) => Partial<T>)) => {
      if (isFunction(newState)) nextRef.current = newState(nextRef.current);
      else nextRef.current = newState;

      if (timeout.current === null) {
        ref.current = nextRef.current;
        reset();
      }
    },
    [reset]
  );

  return [ref, setRefCallback];
};

export default useTrottledRef;
