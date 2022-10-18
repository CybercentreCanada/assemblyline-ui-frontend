import {
  CellTypes,
  CELL_TYPES,
  CopyTypes,
  COPY_TYPES,
  CursorTypes,
  CURSOR_TYPES,
  FindTypeConfig,
  GetTypeConfig,
  GetValueConfig,
  HexTypes,
  HEX_TYPES,
  HistoryTypes,
  HISTORY_TYPES,
  HoverTypes,
  HOVER_TYPES,
  IsTypeConfig,
  ItemConfig,
  ItemsConfig,
  LayoutTypes,
  LAYOUT_TYPES,
  LoadingTypes,
  LOADING_TYPES,
  LocationTypes,
  LOCATION_TYPES,
  ModeTypes,
  MODE_TYPES,
  ScrollTypes,
  SCROLL_TYPES,
  SearchTypes,
  SEARCH_TYPES,
  SelectTypes,
  SELECT_TYPES,
  Store,
  TypesConfig
} from '..';

export type HexViewerTypes =
  | CellTypes
  | CopyTypes
  | CursorTypes
  | HexTypes
  | HistoryTypes
  | HoverTypes
  | LayoutTypes
  | LoadingTypes
  | LocationTypes
  | ModeTypes
  | ScrollTypes
  | SearchTypes
  | SelectTypes;

export const STORE_TYPES: TypesConfig<Omit<Store, 'setting'>, HexViewerTypes> = Object.freeze({
  ...CELL_TYPES,
  ...COPY_TYPES,
  ...CURSOR_TYPES,
  ...HEX_TYPES,
  ...HISTORY_TYPES,
  ...HOVER_TYPES,
  ...LAYOUT_TYPES,
  ...LOADING_TYPES,
  ...LOCATION_TYPES,
  ...MODE_TYPES,
  ...SCROLL_TYPES,
  ...SEARCH_TYPES,
  ...SELECT_TYPES,
  setting: {
    ...CELL_TYPES,
    ...COPY_TYPES,
    ...CURSOR_TYPES,
    ...HEX_TYPES,
    ...HISTORY_TYPES,
    ...HOVER_TYPES,
    ...LAYOUT_TYPES,
    ...LOADING_TYPES,
    ...LOCATION_TYPES,
    ...MODE_TYPES,
    ...SCROLL_TYPES,
    ...SEARCH_TYPES,
    ...SELECT_TYPES
  }
});

// 1. Helper functions
const getValueFromPath = (obj: object, path: Array<string>): number | string | object => {
  let current = obj;
  if (obj === undefined || obj === null) return null;
  for (let i = 0; i < path.length; ++i) {
    if (current[path[i]] === undefined) return undefined;
    current = current[path[i]];
  }
  return current;
};

// 2. Type methods
const methodConfig = (data: any, method: (data: any, p?: Array<string>) => any, path: Array<string> = []) => {
  if ([null, undefined].includes(data)) return data;
  else if (Array.isArray(data)) return method(data, path);
  else if (typeof data === 'object')
    return Object.fromEntries(Object.keys(data).map(key => [key, methodConfig(data[key], method, [...path, key])]));
  else return data;
};

const isTypeConfig =
  <T extends string | number | symbol>(properties: Array<ItemConfig<T>>, path: Array<string>) =>
  (property: T | object, match: T = null) => {
    const types: Array<string | number | symbol> = properties.map(p => p.type);
    if ([undefined, null].includes(property)) return false;
    else if (typeof property === 'string' || typeof property === 'number') {
      if ([null, undefined].includes(match)) return types.includes(property);
      else if (property === match) return types.includes(property);
    } else if (typeof property === 'object') {
      const value = getValueFromPath(property, path);
      if ([null, undefined].includes(value) || typeof value !== 'string') return false;
      else if ([null, undefined].includes(match)) return types.includes(value);
      else if (value === match) return types.includes(value);
    }
    return false;
  };

const getItemsConfig =
  <T extends ItemConfig<any>>(properties: Array<T>) =>
  (store: Store) =>
    properties.map(i => ({
      value: i.value,
      label: i.label[store.mode.language]
    }));

const getValueConfig =
  <T extends ItemConfig<any>>(properties: Array<T>, path: Array<string>) =>
  (input: T | Store) => {
    if (properties === null || properties.length === 0) return null;
    else if ([undefined, null].includes(input)) return properties[0]?.value;
    else if (typeof input === 'string' || typeof input === 'number') {
      const item = properties.find(i => i.type === input);
      return item === undefined ? properties[0].value : item.value;
    } else if (typeof input === 'object') {
      const type = getValueFromPath(input, path);
      const item = properties.find(i => i.type === type);
      return item === undefined ? properties[0].value : item.value;
    }
  };

const getTypeConfig =
  <T extends ItemConfig<any>>(properties: Array<T>, path: Array<string>) =>
  (value: T | Store) => {
    if (properties === null || properties.length === 0) return null;
    else if (typeof value === 'number') {
      const item = properties.find(i => i.value === value);
      return item === undefined ? properties[0].type : item.type;
    } else if (typeof value === 'object') {
      const prop = getValueFromPath(value, path);
      const item = properties.find(i => i.type === prop);
      return item === undefined ? properties[0].type : item.type;
    }
  };

const findTypeConfig =
  <T extends ItemConfig<any>>(properties: Array<T>, path: Array<string>) =>
  (first: T | Store, second: T | Store = null) => {
    if (properties === null || properties.length === 0) return null;

    let type: boolean;
    let value: any;
    let item: ItemConfig<string | number | symbol>;

    type = typeof second === 'string' || typeof second === 'number';
    item = properties.find(i => i.type === second);
    if (type && item !== undefined) return item.type;

    type = second !== null && second !== undefined && typeof second === 'object';
    value = getValueFromPath(second, path);
    item = properties.find(i => i.type === value);
    if (type && item !== undefined) return item.type;

    type = typeof first === 'string' || typeof first === 'number';
    item = properties.find(i => i.type === first);
    if (type && item !== undefined) return item.type;

    type = first !== null && first !== undefined && typeof first === 'object';
    value = getValueFromPath(first, path);
    item = properties.find(i => i.type === value);
    if (type && item !== undefined) return item.type;

    type = properties[0]?.type;
    return type === undefined ? null : type;
  };

export const isType: IsTypeConfig<Store, HexViewerTypes> = methodConfig(STORE_TYPES, isTypeConfig);
export const getItems: ItemsConfig<Store, HexViewerTypes> = methodConfig(STORE_TYPES, getItemsConfig);
export const getValue: GetValueConfig<Store, HexViewerTypes> = methodConfig(STORE_TYPES, getValueConfig);
export const getType: GetTypeConfig<Store, HexViewerTypes> = methodConfig(STORE_TYPES, getTypeConfig);
export const findType: FindTypeConfig<Store, HexViewerTypes> = methodConfig(STORE_TYPES, findTypeConfig);
