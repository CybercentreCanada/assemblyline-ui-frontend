import { useEffect, useRef } from 'react';

// This hook waits until a condition is true to call a function
export const useWaitEffect = (callback: () => void, condition: () => boolean, delay: number = 100): void => {
  const callbackRef = useRef(null);
  const conditionRef = useRef(null);
  const timerRef = useRef(null);
  const delayRef = useRef();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    conditionRef.current = condition;
  }, [condition]);



  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (conditionRef.current()) {
        callbackRef.current();
        clearInterval(timerRef.current);
      }
    }, delayRef.current);
  }, [callbackRef, conditionRef, timerRef, delayRef]);
};

export default useWaitEffect;


// import { useCallback, useEffect, useRef } from 'react';

// export const useWait = (callback, condition, delay) => {
//   const callbackRef = useRef(null);
//   const conditionRef = useRef(null);
//   const timerRef = useRef(null);
//   const delayRef = useRef();

//   uuseEffect(() => {
//     callbackRef.current = callback;
//   }, [callback]);

//   useEffect(() => {
//     conditionRef.current = condition;
//   }, [condition]);

//   const set = useCallback(
//     (...props) => {
//       timeoutRef.current = setTimeout(() => callbackRef.current(...props), delay);
//     },
//     [delay]
//   );

//   const clear = useCallback(() => {
//     timeoutRef.current && clearTimeout(timeoutRef.current);
//   }, []);

//   useEffect(() => {
//     set();
//     return clear;
//   }, [delay, set, clear]);

//   const reset = useCallback(
//     (...props) => {
//       clear();
//       set(...props);
//     },
//     [clear, set]
//   );

//   return [reset, clear];
// };

// export default useWait;
