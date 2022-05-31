import React, { useEffect } from 'react';

//tracked, untracked forced, update
export type Dispatch<Action> = { type: Action | any; payload: any; tracked?: boolean; repeat?: boolean };

export const useAdvanceReducer = <State, Action>(
  initialState: State,
  reducer: (state: Partial<State>, action: Dispatch<Action>) => State,
  update?: (prevState: Partial<State>, nextState: Partial<State>) => void,
  delay: number = 1000
): [State, (action: Dispatch<Action>) => void, React.MutableRefObject<State>] => {
  const [state, setState] = React.useState<State>({ ...initialState });
  const prevStateRef = React.useRef<State>({ ...initialState });
  const nextStateRef = React.useRef<State>({ ...initialState });

  const reducerRef = React.useRef(reducer);
  const updateRef = React.useRef(update);
  const delayRef = React.useRef<number>(delay);
  const actionRef = React.useRef<Dispatch<Action>>(null);
  const lastActionRef = React.useRef<Action | string>(null);

  const timeout = React.useRef(null);

  useEffect(() => {
    reducerRef.current = reducer;
  }, [reducer]);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  const reduce = React.useCallback((action: Dispatch<Action>) => {
    nextStateRef.current = reducerRef.current({ ...nextStateRef.current }, { ...action });
    actionRef.current = null;
  }, []);

  const set = React.useCallback(() => {
    if (actionRef.current !== null) reduce({ ...actionRef.current });
    updateRef.current({ ...prevStateRef.current }, { ...nextStateRef.current });
    prevStateRef.current = nextStateRef.current;
    setState({ ...nextStateRef.current });
  }, [reduce]);

  const clear = React.useCallback(() => {
    clearTimeout(timeout.current);
    actionRef.current = null;
    timeout.current = null;
  }, []);

  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);

  const reset = React.useCallback(() => {
    timeout.current = setTimeout(() => {
      if (!Object.is(prevStateRef.current, nextStateRef.current) || actionRef.current !== null) {
        set();
        clear();
        reset();
      } else clear();
    }, delayRef.current);
  }, [clear, set]);

  const dispatchCallback = React.useCallback(
    ({ type, payload, tracked = true, repeat = true }: Dispatch<Action>) => {
      if (!repeat && type === lastActionRef.current) return;
      lastActionRef.current = type;

      if (tracked) reduce({ type, payload: payload, tracked, repeat });
      else actionRef.current = { type, payload: payload, tracked, repeat };

      if (timeout.current === null) {
        set();
        reset();
      }
    },
    [reduce, reset, set]
  );

  return [state, dispatchCallback, nextStateRef];
};

export default useAdvanceReducer;
