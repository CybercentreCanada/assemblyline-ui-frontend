import React, { useLayoutEffect } from 'react';
import {
  ActionProps,
  ACTIONS,
  ActionType,
  CellState,
  CELL_STATE,
  CopyState,
  COPY_STATE,
  CursorState,
  CURSOR_STATE,
  HexState,
  HEX_STATE,
  HistoryState,
  HISTORY_STATE,
  HoverState,
  HOVER_STATE,
  LayoutState,
  LAYOUT_STATE,
  LoadingState,
  LOADING_STATE,
  LocationState,
  LOCATION_STATE,
  ModeState,
  MODE_STATE,
  RemoveStoreKeysConfig,
  ScrollState,
  SCROLL_STATE,
  SearchState,
  SEARCH_STATE,
  SelectState,
  SELECT_STATE,
  SetStoreConfig,
  SetStoreWithKeysConfig,
  SetStoreWithoutKeysConfig,
  SetStoreWithPathConfig,
  SettingState,
  SETTING_STATE,
  STORE_TYPES,
  useDispatch,
  useReducer
} from '..';
import useAdvanceReducer, { UpdateMemo } from '../commons/hooks/useAdvanceReducer';

export type Store = CellState &
  CopyState &
  CursorState &
  HexState &
  HistoryState &
  HoverState &
  LayoutState &
  LocationState &
  LoadingState &
  ModeState &
  ScrollState &
  SearchState &
  SelectState &
  SettingState;

export type StoreContextProps = {
  store?: Store;
  dispatch?: React.Dispatch<ActionProps>;
  update?: UpdateMemo<{ store: Store }, Store>;
};

export type StoreProviderProps = {
  children?: React.ReactNode;
};

export type StoreProps = {
  store?: Store;
};

export type AT = (typeof ACTIONS)[keyof typeof ACTIONS];

export const DEFAULT_STORE: Store = Object.freeze({
  ...CELL_STATE,
  ...COPY_STATE,
  ...CURSOR_STATE,
  ...HEX_STATE,
  ...HISTORY_STATE,
  ...HOVER_STATE,
  ...LAYOUT_STATE,
  ...LOADING_STATE,
  ...LOCATION_STATE,
  ...MODE_STATE,
  ...SCROLL_STATE,
  ...SEARCH_STATE,
  ...SELECT_STATE,
  setting: {
    ...SETTING_STATE.setting,
    ...CELL_STATE,
    ...COPY_STATE,
    ...CURSOR_STATE,
    ...HEX_STATE,
    ...HISTORY_STATE,
    ...HOVER_STATE,
    ...LAYOUT_STATE,
    ...LOADING_STATE,
    ...LOCATION_STATE,
    ...MODE_STATE,
    ...SCROLL_STATE,
    ...SEARCH_STATE,
    ...SELECT_STATE
  }
});

export const storeContext = React.createContext<StoreContextProps>(null);
export const useStore = () => React.useContext(storeContext);

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const { dispatchRef } = useDispatch();
  const { reducer, render } = useReducer();
  const [store, dispatch, update] = useAdvanceReducer<Store, ActionType>({ ...DEFAULT_STORE }, reducer, render, 15);

  useLayoutEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch, dispatchRef]);

  return (
    <div id="hex-viewer" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <storeContext.Provider value={{ store, dispatch, update }}>
        {React.useMemo(() => children, [children])}
      </storeContext.Provider>
    </div>
  );
};

// 1. Utils methods
const isObject = (data: any, empty: boolean = true): boolean => {
  if (typeof data !== 'object') return false;
  else if ([null, undefined].includes(data)) return false;
  else if (Object.is({}, data)) return empty;
  else if (Array.isArray(data)) return false;
  else if (Object.keys(data).length === 0) return false;
  else return true;
};

export const getValueFromPath = (obj: object, path: Array<string>): any => {
  let current = obj;
  if (obj === undefined || obj === null) return null;
  for (let i = 0; i < path.length; ++i) {
    if (current[path[i]] === undefined) return undefined;
    current = current[path[i]];
  }
  return current;
};

const updateObject = (first: any, second: any): any => {
  if (isObject(first) && isObject(second))
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

const mergeObject = (first: any, second: any): any => {
  if (isObject(first) && isObject(second))
    return Object.fromEntries([
      ...Object.keys(first).map(key => [
        key,
        mergeObject(first[key], Object.keys(second).includes(key) ? second[key] : undefined)
      ]),
      ...Object.keys(second)
        .filter(key => !Object.keys(first).includes(key))
        .map(key => [key, second[key]])
    ]);
  else if (second !== undefined) return second;
  else return first;
};

const applySubObject = (
  origin: object,
  value: any,
  path: Array<string>,
  method: (origin: any, value: any) => any
): any => {
  if (path !== null && path.length === 0) return method(origin, value);
  else if (isObject(origin) && Object.keys(origin).includes(path[0])) {
    const obj = Object.fromEntries([[path[0], applySubObject(origin[path[0]], value, [...path.slice(1)], method)]]);
    return { ...origin, ...obj };
  } else return origin;
};

const cleanTypes = (origin: any, types: any) => {
  if (Array.isArray(types)) {
    if (types.find(type => type.type === origin) !== undefined) return origin;
    else {
      const newType = types[0]?.type;
      return newType === undefined ? origin : newType;
    }
  } else if (isObject(origin) && isObject(types)) {
    const obj = Object.fromEntries(
      Object.keys(types)
        .filter(key => Object.keys(origin).includes(key))
        .map(key => [key, cleanTypes(origin[key], types[key])])
    );
    return { ...origin, ...obj };
  } else return origin;
};

const validateStoreTypes = (origin: any, types: any, path: Array<string> = []) => {
  if (path !== null && path.length === 0) return cleanTypes(origin, types);
  else if (isObject(types) && Object.keys(types).includes(path[0]))
    return validateStoreTypes(origin, types[path[0]], [...path.slice(1)]);
  else return origin;
};

const getObjectWithKeys = (obj: object, keys: Array<any>) =>
  keys === null || keys.length === 0
    ? obj
    : Object.fromEntries(
        Object.keys(obj)
          .filter(key => keys.includes(key))
          .map(key => [key, obj[key]])
      );

const getObjectWithoutKeys = (obj: object, keys: Array<any>) =>
  keys === null || keys.length === 0
    ? obj
    : Object.fromEntries(
        Object.keys(obj)
          .filter(key => !keys.includes(key))
          .map(key => [key, obj[key]])
      );

// 2. Configs
const setStoreConfig =
  <T extends any>(store: Store, path: Array<string>) =>
  (first: Store, second: T, clean: (data: T) => T = null): Store => {
    const newPath = [...path.slice(1)];
    let newStore = applySubObject(DEFAULT_STORE, first, [], mergeObject);
    if (clean !== null) second = clean(second);
    second = validateStoreTypes(second, STORE_TYPES, newPath);
    return applySubObject(newStore, second, newPath, updateObject);
  };

const setStoreWithKeysConfig =
  <T extends object>(store: Store, path: Array<string>) =>
  (first: Store, second: T, keys: (keyof T)[]): Store => {
    const newPath = [...path.slice(1)];
    let newStore = applySubObject(DEFAULT_STORE, first, [], mergeObject);
    let newSecond = getObjectWithKeys(second, keys);
    newSecond = validateStoreTypes(newSecond, STORE_TYPES, newPath);
    return applySubObject(newStore, newSecond, newPath, updateObject);
  };

const setStoreWithoutKeysConfig =
  <T extends object>(store: Store, path: Array<string>) =>
  (first: Store, second: T, keys: (keyof T)[]): Store => {
    const newPath = [...path.slice(1)];
    let newStore = applySubObject(DEFAULT_STORE, first, [], mergeObject);
    let newSecond = getObjectWithoutKeys(second, keys);
    newSecond = validateStoreTypes(newSecond, STORE_TYPES, newPath);
    newStore = applySubObject(newStore, newSecond, newPath, updateObject);
    return newStore;
  };

const removeStoreKeysConfig =
  <T extends object>(store: Store, path: Array<string>) =>
  (first: Store, keys: (keyof T)[]): Store => {
    const newPath = [...path.slice(1)];
    let sub = getValueFromPath(first, newPath);
    if (!isObject(sub)) return first;
    sub = getObjectWithoutKeys(sub as object, keys);
    return applySubObject(first, sub, newPath, (prev, next) => next);
  };

const setStoreWithPathConfig =
  (origin: Store, path: Array<string>) =>
  (store: Store, data: any, valuePath: Array<string> = []): Store => {
    const newPath = [...path.slice(1)];
    let newStore = applySubObject(DEFAULT_STORE, store, [], mergeObject);
    data = validateStoreTypes(data, STORE_TYPES, [...newPath, ...valuePath]);
    return applySubObject(newStore, data, [...newPath, ...valuePath], updateObject);
  };

// 3. Builders
const storeBuilder = (data: any, method: (data: any, p?: Array<string>) => any, path: Array<string> = []) => {
  let newElements: Array<[number | string | symbol, any]> = [];
  Object.keys(data).forEach(key => {
    newElements.push([`${key.charAt(0).toUpperCase() + key.slice(1)}`, method(data[key], [...path, key])]);
    if (isObject(data[key])) newElements.push([key, storeBuilder(data[key], method, [...path, key])]);
  });
  return Object.fromEntries(newElements) as any;
};

// 4. Methods
export const setStore: SetStoreConfig<{ store: Store }> = storeBuilder({ store: DEFAULT_STORE }, setStoreConfig);
export const setStoreWithKeys: SetStoreWithKeysConfig<{ store: Store }> = storeBuilder(
  { store: DEFAULT_STORE },
  setStoreWithKeysConfig
);
export const setStoreWithoutKeys: SetStoreWithoutKeysConfig<{ store: Store }> = storeBuilder(
  { store: DEFAULT_STORE },
  setStoreWithoutKeysConfig
);
export const removeStoreKeys: RemoveStoreKeysConfig<{ store: Store }> = storeBuilder(
  { store: DEFAULT_STORE },
  removeStoreKeysConfig
);
export const setStoreWithPath: SetStoreWithPathConfig<{ store: Store }> = storeBuilder(
  { store: DEFAULT_STORE },
  setStoreWithPathConfig
);
