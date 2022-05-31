import { Store } from '..';

export type TypeConfig<T extends string> = { [A in T as A]: `${A}` };
export type IsTypeConfig<T extends string> = { [A in T as A]: (type: T) => boolean };
export type IsStoreTypeConfig<T extends string> = { [A in T as A]: (store: Store) => boolean };

export const getValue = (object: object, keys: string[]): object | any => {
  if (object === null || keys === null || keys.length === 0) return null;
  else if (keys.length === 1) return object.hasOwnProperty(keys[0]) ? object[keys[0]] : null;
  else return object.hasOwnProperty(keys[0]) ? getValue(object[keys[0]], [...keys.slice(1)]) : null;
};

export const isTypeConfig = <Type extends string>(TYPES: TypeConfig<Type>) =>
  Object.fromEntries(Object.keys(TYPES).map(key => [key, (type: Type) => type === TYPES[key]])) as IsTypeConfig<Type>;

export const isStoreTypeConfig = <Type extends string>(TYPES: TypeConfig<Type>, storeKeys: string[]) =>
  Object.fromEntries(
    Object.keys(TYPES).map(key => [key, (store: Store) => getValue(store, storeKeys) === TYPES[key]])
  ) as IsStoreTypeConfig<Type>;

export type AsType<Type> = (type: any) => Type;

export const asType = <Type>(type) => (Object.keys(CELL2).includes(type) ? type : null) as Type;

export type Cell2 = 'hex' | 'text';
export const CELL2: TypeConfig<Cell2> = { hex: 'hex', text: 'text' };
export const isCellType: IsStoreTypeConfig<Cell2> = isStoreTypeConfig<Cell2>(CELL2, ['cell', 'mouseOverType']);
export const asCellType = prop => asType(prop) as Cell2;
