import React, { useCallback, useRef } from 'react';

const isFunction = (value: any): value is Function => typeof value === 'function';

export const useTrottledRef = <T>(
  initialState: T,
  delay: number = 1000
): [React.MutableRefObject<Partial<T>>, (newState: Partial<T> | ((prevState: Partial<T>) => Partial<T>)) => void] => {
  const ref = useRef<Partial<T>>(initialState);
  const nextRef = useRef<Partial<T>>(initialState);
  const timeout = useRef(null);

  const clear = useCallback(() => {
    clearTimeout(timeout.current);
    timeout.current = null;
  }, []);

  const reset = useCallback(() => {
    timeout.current = setTimeout(() => {
      if (!Object.is(ref.current, nextRef.current)) {
        ref.current = nextRef.current;
        clear();
        reset();
      } else clear();
    }, delay);
  }, [clear, delay]);

  const setRefCallback = useCallback(
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
