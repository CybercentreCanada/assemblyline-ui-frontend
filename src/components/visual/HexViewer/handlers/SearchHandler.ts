import { Store } from '..';

type Search = { cursor: 'cursor'; hex: 'hex'; text: 'text' };
const SEARCH: Search = { cursor: 'cursor', hex: 'hex', text: 'text' };
export type SearchType = typeof SEARCH[keyof typeof SEARCH];
export type IsSearch = { [Property in SearchType]: (store: Store) => boolean };
export const isSearchType = Object.fromEntries(
  Object.keys(SEARCH).map(key => [key, (store: Store) => store.search.type === SEARCH[key]])
) as IsSearch;

export const formatHexString = (value: string): string =>
  value
    .replace(/ /g, '')
    .toLowerCase()
    .replace(/(.{2})/g, '$& ')
    .split(' ')
    .filter(e => e !== '' && e.length >= 2)
    .join(' ');

export const formatTextString = (value: string): string =>
  Buffer.from(value)
    .toString('hex')
    .replace(/(.{2})/g, '$& ')
    .split(' ')
    .filter(e => e !== '' && e.length >= 2)
    .join(' ');

export const countHexcode = (value: string) => value.split(' ').filter(code => code !== '' && code.length === 2).length;

export const filterSearchIndexes = ({
  search: { length, indexes, selectedIndex },
  cellsRendered: { overscanStartIndex: firstIndex, overscanStopIndex: lastIndex }
}: Store): Array<number> =>
  indexes.filter((index: number, i: number) => firstIndex <= index + length && index <= lastIndex);

export const isSearchIndex = (store: Store, index: number) =>
  store.search.indexes.findIndex(
    (searchIndex: number, i: number) =>
      searchIndex <= index && index < searchIndex + store.search.length && i !== store.search.selectedIndex
  ) >= 0
    ? true
    : false;

export const isSelectedSearchIndex = (store: Store, index: number) =>
  store.search.indexes[store.search.selectedIndex] <= index &&
  index < store.search.indexes[store.search.selectedIndex] + store.search.length;

export const removeSearchQuotes = (value: string): string => {
  const firstChar = value.charAt(0);
  const lastChar = value.charAt(value.length - 1);
  return (firstChar === '"' && lastChar === '"') ||
    (firstChar === "'" && lastChar === "'") ||
    (firstChar === '`' && lastChar === '`')
    ? value.substring(1, value.length - 1)
    : value;
};

export const getSearchQuery = (inputValue: string): { key: string; value: string; length: number } => {
  const key = inputValue.substring(0, inputValue.indexOf(':'));
  const value = removeSearchQuotes(inputValue.substring(inputValue.indexOf(':') + 1));
  const length = value.length;
  return {
    key: key,
    value: value,
    length: length
  };
};

export const findSearchPattern = (data: string, value: string): Array<number> => {
  let indexes: Array<number> = [];
  const regex = RegExp(value, 'g');
  while (regex.exec(data) !== null) indexes.push((regex.lastIndex - value.length) / 3);
  return indexes;
};

export const prevSearchIndex = (indexes: Array<number>, origin: number) => {
  if (indexes === null || indexes.length === 0) return null;
  else if (origin === null || origin < 0) return indexes.length - 1;
  else {
    let i = indexes.length - 1;
    while (i >= 0) {
      if (indexes[i] < origin) return i;
      i--;
    }
    return indexes.length - 1;
  }
};

export const nextSearchIndex = (indexes: Array<number>, origin: number) => {
  if (indexes === null || indexes.length === 0) return null;
  else if (origin === null || origin < 0) return 0;
  else {
    let i = 0;
    while (i < indexes.length) {
      if (indexes[i] > origin) return i;
      i++;
    }
    return 0;
  }
};

export const clampSelectedSearchIndex = (store: Store, index: number): number => {
  if (index < 0) return store.search.indexes.length + index;
  else if (index >= store.search.indexes.length) return index - store.search.indexes.length;
  else return index;
};

export const getSearchIndexes = (store: Store): number[] => {
  const { indexes, length, selectedIndex } = store.search;
  const { overscanStartIndex: start, overscanStopIndex: stop } = store.cellsRendered;
  return indexes
    .filter((index: number, i: number) => start <= index + length && index <= stop && i !== selectedIndex)
    .map(index => Array.from({ length }, (_, i) => i + index))
    .flat(1);
};

export const getSelectedSearchIndexes = (store: Store): number[] => {
  const start = store.search.indexes[store.search.selectedIndex];
  const end = start + store.search.length;
  return Array.from({ length: end - start }, (_, i) => i + start).filter(
    index => store.cellsRendered.visibleStartIndex <= index && index <= store.cellsRendered.visibleStopIndex
  );
};
