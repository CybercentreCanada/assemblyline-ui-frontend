import React, { useCallback, useRef } from 'react';

export const useTrottledCallback = <T>(
  trottledCallback: (props: T) => any,
  delay: number = 1000
): ((props: T) => void) => {
  const trottledCallbackRef = useRef(null);
  const propsRef = useRef(null);
  const timeout = useRef(null);

  React.useEffect(() => {
    trottledCallbackRef.current = trottledCallback;
  }, [trottledCallback]);

  const clear = useCallback(() => {
    clearTimeout(timeout.current);
    propsRef.current = null;
    timeout.current = null;
  }, []);

  const reset = useCallback(() => {
    timeout.current = setTimeout(() => {
      if (propsRef.current !== null) {
        trottledCallbackRef.current([...propsRef.current]);
        clear();
        reset();
      } else clear();
    }, delay);
  }, [clear, delay]);

  const callback = useCallback(
    (...props) => {
      if (timeout.current === null) {
        trottledCallbackRef.current([...props]);
        propsRef.current = null;
        reset();
      } else {
        propsRef.current = [...props];
      }
    },
    [reset]
  );

  return callback;
};

export default useTrottledCallback;
