import { useCallback, useEffect, useRef } from 'react';

export type TrottledMemo = [stateRef: React.MutableRefObject<any>, callback: (...props: any[]) => void];

export const useTrottledMemo = (trottledCallback, modifyingCallback, delay): TrottledMemo => {
  const valueRef = useRef(null);
  const modifyingCallbackRef = useRef(modifyingCallback);
  const trottledCallbackRef = useRef(trottledCallback);
  const propsRef = useRef(null);
  const midTimerRef = useRef(null);
  const endTimerRef = useRef(null);

  const isMid = useRef(false);
  const isEnd = useRef(false);
  const execCallback = useRef(false);

  useEffect(() => {
    trottledCallbackRef.current = trottledCallback;
  }, [trottledCallback]);

  useEffect(() => {
    modifyingCallbackRef.current = modifyingCallback;
  }, [modifyingCallback]);

  const update = useCallback((...props) => {
    valueRef.current = modifyingCallbackRef.current(...props, valueRef.current);

    trottledCallbackRef.current(...props);
  }, []);

  return [valueRef, update];
};

export default useTrottledMemo;
