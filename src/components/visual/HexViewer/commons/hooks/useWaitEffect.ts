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
