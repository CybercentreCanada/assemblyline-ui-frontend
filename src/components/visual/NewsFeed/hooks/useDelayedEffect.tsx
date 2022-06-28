import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

type UseDelayedEffect = (
  callback?: EffectCallback,
  delayedCallback?: EffectCallback,
  deps?: DependencyList,
  delay?: number
) => void;

export const useDelayedEffect: UseDelayedEffect = (
  callback = () => null,
  delayedCallback = () => null,
  deps = [],
  delay = 1000
) => {
  const delayedCallbackRef = useRef(delayedCallback);
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);
  const delayRef = useRef(delay);
  const timeoutRef = useRef(null);

  useEffect(() => {
    delayedCallbackRef.current = delayedCallback;
  }, [delayedCallback]);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    depsRef.current = deps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  useEffect(() => {
    callbackRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  useEffect(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => delayedCallbackRef.current(), delayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);
};

export default useDelayedEffect;
