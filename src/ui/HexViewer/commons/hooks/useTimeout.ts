import { useCallback, useEffect, useRef } from 'react';

export const useTimeout = (callback, delay) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const set = useCallback(
    (...props) => {
      timeoutRef.current = setTimeout(() => callbackRef.current(...props), delay);
    },
    [delay]
  );

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);

  const reset = useCallback(
    (...props) => {
      clear();
      set(...props);
    },
    [clear, set]
  );

  return [reset, clear];
};

export default useTimeout;
