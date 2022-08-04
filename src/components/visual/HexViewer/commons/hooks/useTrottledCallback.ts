import React from 'react';

export const useTrottledCallback = <T>(
  trottledCallback: (props: T) => any,
  delay: number = 1000
): ((props: T) => void) => {
  const trottledCallbackRef = React.useRef(null);
  const propsRef = React.useRef(null);
  const timeout = React.useRef(null);

  React.useEffect(() => {
    trottledCallbackRef.current = trottledCallback;
  }, [trottledCallback]);

  const clear = React.useCallback(() => {
    clearTimeout(timeout.current);
    propsRef.current = null;
    timeout.current = null;
  }, []);

  const reset = React.useCallback(() => {
    timeout.current = setTimeout(() => {
      if (propsRef.current !== null) {
        trottledCallbackRef.current([...propsRef.current]);
        clear();
        reset();
      } else clear();
    }, delay);
  }, [clear, delay]);

  const callback = React.useCallback(
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
