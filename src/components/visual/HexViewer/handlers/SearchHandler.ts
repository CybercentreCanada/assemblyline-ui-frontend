import { HIGHER_ASCII_TABLE, NON_PRINTABLE_ASCII_TABLE, Store } from '..';

type Search = { cursor: 'cursor'; hex: 'hex'; text: 'text' };
const SEARCH: Search = { cursor: 'cursor', hex: 'hex', text: 'text' };
export type SearchType = typeof SEARCH[keyof typeof SEARCH];
export type IsSearch = { [Property in SearchType]: (store: Store) => boolean };
export const isSearchType = Object.fromEntries(
  Object.keys(SEARCH).map(key => [key, (store: Store) => store.search.type === SEARCH[key]])
) as IsSearch;

type SearchText = { narrow: 'narrow'; wide: 'wide' };
const SEARCH_TEXT: SearchText = { narrow: 'narrow', wide: 'wide' };
export type SearchTextType = typeof SEARCH_TEXT[keyof typeof SEARCH_TEXT];
export type IsSearchText = { [Property in SearchTextType]: (store: Store) => boolean };
export const isSearchTextType = Object.fromEntries(
  Object.keys(SEARCH_TEXT).map(key => [key, (store: Store) => store.search.textType === SEARCH_TEXT[key]])
) as IsSearchText;

export const SEARCH_TEXT_TYPE_VALUES: {
  en: Array<{ label: string; type: SearchTextType; value: number }>;
  fr: Array<{ label: string; type: SearchTextType; value: number }>;
} = {
  en: [
    { label: 'Narrow', type: 'narrow', value: 0 },
    { label: 'Wide', type: 'wide', value: 1 }
  ],
  fr: [
    { label: 'Étroit', type: 'narrow', value: 0 },
    { label: 'Large', type: 'wide', value: 1 }
  ]
};

export const addRegexAlternation = (text1: string, text2: string): string =>
  text1 === '' || text1 === null ? text2 : text1 + '|' + text2;

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

export const getNarrowTextExpression = (store: Store, value: string): RegExp => {
  const { nonPrintable, higher } = store.hex;
  let expression: string = '';

  // eslint-disable-next-line array-callback-return
  value.split('').map(character => {
    let sub: string = '';
    let count: number = 0;

    const char = Buffer.from(character).toString('hex');

    if (char.length === 2) {
      sub = addRegexAlternation(sub, '(' + char + ')');
      count = count + 1;
    } else {
      // Add Non-Printable ASCII Characters
      NON_PRINTABLE_ASCII_TABLE.forEach(ascii => {
        if (
          (nonPrintable.encoding === 'hidden' && nonPrintable.char === character) ||
          ascii[nonPrintable.encoding] === character ||
          [ascii.copy, ' '].includes(character)
        ) {
          sub = addRegexAlternation(sub, '(' + ascii.hex + ')');
          count = count + 1;
        }
      });

      // Add Higher ASCII Characters
      HIGHER_ASCII_TABLE.forEach(ascii => {
        if ((higher.encoding === 'hidden' && higher.char === character) || ascii[higher.encoding] === character) {
          sub = addRegexAlternation(sub, '(' + ascii.hex + ')');
          count = count + 1;
        }
      });
    }
    count <= 5 ? (expression += '(' + sub.toLowerCase() + ') ') : (expression += '(..) ');
  });
  return RegExp(expression, 'g');
};

export const getWideTextExpression = (store: Store, value: string): RegExp => {
  const {
    null: { char: nullChar },
    nonPrintable,
    higher
  } = store.hex;
  let expression: string = '';

  // eslint-disable-next-line array-callback-return
  value.split('').map(character => {
    let sub: string = '';
    let count: number = 0;

    // Add Null Value
    if (nullChar === character || NON_PRINTABLE_ASCII_TABLE.get(0).copy === character) {
      sub = addRegexAlternation(sub, '(00)');
      count = count + 1;
    }

    // Add Non-Printable ASCII Characters
    NON_PRINTABLE_ASCII_TABLE.forEach(ascii => {
      if (
        (nonPrintable.encoding === 'hidden' && nonPrintable.char === character) ||
        ascii[nonPrintable.encoding] === character ||
        [ascii.copy, ' '].includes(character)
      ) {
        sub = addRegexAlternation(sub, '(' + ascii.hex + ')');
        count = count + 1;
      }
    });

    // Add Lower ASCII Characters
    for (let i = 32; i < 127; i++) {
      if (character === String.fromCharCode(i)) {
        sub = addRegexAlternation(sub, '(' + Buffer.from(String.fromCharCode(i)).toString('hex') + ')');
        count = count + 1;
      }
    }

    // Add Higher ASCII Characters
    HIGHER_ASCII_TABLE.forEach(ascii => {
      if ((higher.encoding === 'hidden' && higher.char === character) || ascii[higher.encoding] === character) {
        sub = addRegexAlternation(sub, '(' + ascii.hex + ')');
        count = count + 1;
      }
    });
    count <= 5 ? (expression += '(' + sub.toLowerCase() + ') ') : (expression += '(..) ');
  });
  return RegExp(expression, 'g');
};

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

export const findSearchPattern = (data: string, value: string, length: number): Array<number> => {
  let indexes: Array<number> = [];
  const regex = RegExp(value, 'g');
  while (regex.exec(data) !== null) indexes.push((regex.lastIndex - value.length) / 3);
  return indexes;
};

export const executeSearchRegex = (data: string, regex: RegExp, length: number): Array<number> => {
  let indexes: Array<number> = [];
  while (regex.exec(data) !== null) indexes.push((regex.lastIndex - length * 3) / 3);
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
