import React, { useEffect } from 'react';

//tracked, untracked forced, update
export type Dispatch<Action> = { type: Action | any; payload: any; tracked?: boolean; repeat?: boolean };

type NonObject = null | Array<any> | Date | Map<any, any>;
type IsObject<O> = O extends NonObject ? never : O extends object ? (keyof O extends never ? never : O) : never;
type Value<O, P> = IsObject<O> extends never ? never : P extends keyof O ? O[P] : never;
type PartialR<T> = {
  [P in keyof T]?: IsObject<T> extends never ? T[P] : PartialR<T[P]>;
};

export type UpdateMemo<O, S> = {
  [K in keyof O as K extends string ? `set${Capitalize<K>}` : K]: (
    data: PartialR<Value<O, K>> | ((data: Value<O, K>, tracked?: boolean, repeat?: boolean) => PartialR<Value<O, K>>)
  ) => S;
} & {
  [K in keyof O as IsObject<O[K]> extends never ? never : K]: UpdateMemo<O[K], S>;
};

const isObject = (data: any, empty: boolean = true): boolean => {
  if (typeof data !== 'object') return false;
  else if ([null, undefined].includes(data)) return false;
  else if (Object.is({}, data)) return empty;
  else if (Array.isArray(data)) return false;
  else if (Object.keys(data).length === 0) return false;
  else return true;
};

const getValueFromPath = (obj: any, path: Array<string>): any => {
  let current = obj;
  if (obj === undefined || obj === null) return null;
  for (let i = 0; i < path.length; ++i) {
    if (current[path[i]] === undefined) return undefined;
    current = current[path[i]];
  }
  return current;
};

const updateObject = (first: any, second: any): any => {
  if (isObject(first))
    return Object.fromEntries(
      Object.keys(first).map(key =>
        Object.keys(second).includes(key) ? [key, updateObject(first[key], second[key])] : [key, first[key]]
      )
    );
  else
    return second !== undefined && (first === null || second === null || typeof second === typeof first)
      ? second
      : first;
};

const applySubObject = (
  origin: any,
  value: any,
  path: Array<string> = [],
  method: (origin: any, value: any) => any
): any => {
  if (path !== null && path.length === 0) return method(origin, value);
  else if (isObject(origin) && Object.keys(origin).includes(path[0])) {
    const obj = Object.fromEntries([[path[0], applySubObject(origin[path[0]], value, [...path.slice(1)], method)]]);
    return { ...origin, ...obj };
  } else return origin;
};

export const useAdvanceReducer = <State, Action>(
  initialState: State,
  reducer: (store: Partial<State>, action: Dispatch<Action>) => State,
  render?: (prevState: Partial<State>, nextState: Partial<State>) => void,
  delay: number = 1000
): [State, (action: Dispatch<Action>) => void, UpdateMemo<{ store: State }, State>, React.MutableRefObject<State>] => {
  const [store, setStore] = React.useState<State>({ ...initialState });
  const initialStateRef = React.useRef<State>({ ...initialState });
  const prevStateRef = React.useRef<State>({ ...initialState });
  const nextStateRef = React.useRef<State>({ ...initialState });

  const reducerRef = React.useRef(reducer);
  const renderRef = React.useRef(render);
  const delayRef = React.useRef<number>(delay);
  const actionRef = React.useRef<Dispatch<Action>>(null);
  const lastActionRef = React.useRef<Action | string>(null);
  const changeRef = React.useRef<{ data: any; path: Array<string>; tracked?: boolean; repeat?: boolean }>(null);
  const lastChangeRef = React.useRef<{ data: any; path: Array<string> }>(null);

  const timeout = React.useRef(null);

  useEffect(() => {
    reducerRef.current = reducer;
  }, [reducer]);

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  const reduce = React.useCallback((action: Dispatch<Action>) => {
    nextStateRef.current = reducerRef.current({ ...nextStateRef.current }, { ...action });
    actionRef.current = null;
  }, []);

  const change = React.useCallback(<T extends any>(data: T, path: Array<string>) => {
    nextStateRef.current = applySubObject(nextStateRef.current, data, path, updateObject);
    changeRef.current = null;
  }, []);

  const set = React.useCallback(() => {
    if (actionRef.current !== null) reduce({ ...actionRef.current });
    if (changeRef.current !== null) change(changeRef.current.data, changeRef.current.path);
    renderRef.current({ ...prevStateRef.current }, { ...nextStateRef.current });
    prevStateRef.current = nextStateRef.current;
    setStore({ ...nextStateRef.current });
  }, [change, reduce]);

  const clear = React.useCallback(() => {
    clearTimeout(timeout.current);
    actionRef.current = null;
    changeRef.current = null;
    timeout.current = null;
  }, []);

  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);

  const reset = React.useCallback(() => {
    timeout.current = setTimeout(() => {
      if (
        !Object.is(prevStateRef.current, nextStateRef.current) ||
        actionRef.current !== null ||
        changeRef.current !== null
      ) {
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

  const changeCallback = React.useCallback(
    <T extends any>(path: Array<string>) =>
      (input: T | ((data: T) => T), tracked = true, repeat = true): void => {
        const newPath = [...path.slice(1)];
        const inputData =
          typeof input === 'function'
            ? (input as (data: T) => T)(getValueFromPath({ ...nextStateRef.current }, newPath))
            : input;

        if (!repeat && JSON.stringify({ data: inputData, path }) === JSON.stringify(lastChangeRef.current)) return;
        lastChangeRef.current = { data: inputData, path };

        if (tracked) change<T>(inputData, newPath);
        else changeRef.current = { data: newPath, path: newPath, tracked, repeat };

        if (timeout.current === null) {
          set();
          reset();
        }
      },
    [change, reset, set]
  );

  const updateCallback = React.useCallback(
    (data: any, path: Array<string> = []) => {
      let newElements: Array<[number | string | symbol, any]> = [];
      Object.keys(data).forEach(key => {
        newElements.push([`set${key.charAt(0).toUpperCase() + key.slice(1)}`, changeCallback([...path, key])]);
        if (isObject(data[key])) newElements.push([key, updateCallback(data[key], [...path, key])]);
      });
      return Object.fromEntries(newElements) as any;
    },
    [changeCallback]
  );

  const updateMemo: UpdateMemo<{ store: State }, State> = React.useMemo(
    () => updateCallback({ store: initialStateRef.current }),
    [updateCallback]
  );

  return [store, dispatchCallback, updateMemo, nextStateRef];
};

export default useAdvanceReducer;
