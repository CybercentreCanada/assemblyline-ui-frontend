import { HIGHER_ASCII_TABLE, NON_PRINTABLE_ASCII_TABLE, Store, toHexChar2 } from '..';

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

export const get8BitsDirectTextExpression = (value: string): string =>
  Buffer.from(value)
    .toString('hex')
    .replace(/(.{2})/g, '$& ')
    .split(' ')
    .filter(e => e !== '' && e.length >= 2)
    .join(' ')
    .concat(' ');

export const get16BitsDirectTextExpression = (value: string): string =>
  value
    .split('')
    .map(char => char.charCodeAt(0).toString(16).padStart(4, '0'))
    .join('')
    .match(/.{2}/g)
    .join(' ')
    .concat(' ');

export const spliceBackslash = (array: Array<string>): Array<string> => {
  let i = array.length - 1;
  while (i >= 1) {
    if (array[i - 1] === '\\') {
      array.splice(i - 1, 2, array[i - 1] + array[i]);
      i--;
    }
    i--;
  }
  if (array[array.length - 1] === '\\') array.splice(array.length - 1, 1);
  return array;
};

export const reduceRegex = (array: Array<string>): Array<string> => {
  let i = array.length - 1;
  while (i >= 1) {
    let j = i - 1;
    let sameValues = false;
    while (j >= 0) {
      if (array[i] === array[j]) sameValues = true;
      else break;
      j--;
    }
    if (sameValues) {
      array.splice(j + 1, i - j, '(' + array[i] + '){' + (i - j) + '}');
      i = j;
    } else i--;
  }
  return array;
};

export const getNonPrintableASCIILookUpMap = (store: Store): Map<string, string> => {
  const map = new Map<string, string>();
  map.set(' ', '(?!00)([0-1]([0-9]|[a-f]))');
  for (let i = 8; i <= 13; i++) {
    const ascii = NON_PRINTABLE_ASCII_TABLE.get(i);
    map.set(ascii.copy, ascii.hex);
  }
  if (store.hex.nonPrintable.set === 'hidden') map.set(store.hex.nonPrintable.char, '(?!00)([0-1]([0-9]|[a-f]))');
  else if (['CP437', 'caret'].includes(store.hex.nonPrintable.set))
    Array.from(NON_PRINTABLE_ASCII_TABLE.values()).forEach(ascii =>
      map.set(ascii[store.hex.nonPrintable.set], ascii.hex)
    );
  return map;
};

export const getHigherASCIILookUpMap = (store: Store): Map<string, string> => {
  const map = new Map<string, string>();
  if (store.hex.higher.set === 'hidden') map.set(store.hex.higher.char, '(7f)|(([8-9]|[a-f])([0-9]|[a-f]))');
  else if (['CP437', 'windows1252'].includes(store.hex.higher.set))
    Array.from(HIGHER_ASCII_TABLE.values()).forEach(ascii => map.set(ascii[store.hex.higher.set], ascii.hex));
  return map;
};

export const addPadToBytes = (store: Store, value: string, pad: number) =>
  value
    .split('')
    .map(char => char.charCodeAt(0).toString(16).padStart(pad, '0'))
    .join('')
    .match(/.{2}/g)
    .map(char => toHexChar2(store, char))
    .join('');

export const getWideTextExpression = (store: Store, value: string): string => {
  const nonPrintableASCII = getNonPrintableASCIILookUpMap(store);
  const higherASCII = getHigherASCIILookUpMap(store);
  const regex: string[][] = value.split('').map(character => {
    let array: string[] = [];

    // Null Character
    if (character === ' ' || character === store.hex.null.char) array.push('(00)');

    // Non-Printable ASCII Character
    const nonPrintableChars = nonPrintableASCII.get(character);
    if (nonPrintableChars !== undefined) array.push('(' + nonPrintableChars + ')');

    // Lower ASCII Character
    const lowerChars = Buffer.from(character).toString('hex');
    if (lowerChars.length === 2) array.push('(' + lowerChars + ')');

    // Higher ASCII Character
    const higherChars = higherASCII.get(character);
    if (higherChars !== undefined) array.push('(' + higherChars + ')');

    return array;
  });

  const flatReg = regex.map(element => (element.length === 0 ? '(XX)' : '(' + element.join('|') + ')'));
  const expression =
    flatReg.length === 0 || flatReg.includes('(XX)')
      ? '(XX)'
      : reduceRegex(flatReg.map(e => e + ' '))
          .join('')
          .toLowerCase();

  return expression;
};

export const getTextExpression = (store: Store, value: string): RegExp => {
  const nonPrintableASCII = getNonPrintableASCIILookUpMap(store);
  const higherASCII = getHigherASCIILookUpMap(store);

  // eslint-disable-next-line array-callback-return
  const regex: string[][] = value.split('').map(character => {
    let array: string[] = [];

    // Null Character
    if (character === ' ' || character === store.hex.null.char) array.push('(00)');

    // Non-Printable ASCII Character
    const nonPrintableChars = nonPrintableASCII.get(character);
    if (nonPrintableChars !== undefined) array.push('(' + nonPrintableChars + ')');

    // Lower ASCII Character
    const lowerChars = Buffer.from(character).toString('hex');
    if (lowerChars.length === 2) array.push('(' + lowerChars + ')');

    // Higher ASCII Character
    const higherChars = higherASCII.get(character);
    if (higherChars !== undefined) array.push('(' + higherChars + ')');

    return array;
  });

  const flatReg = regex.map(element => (element.length === 0 ? '(XX)' : '(' + element.join('|') + ')'));
  const expression =
    flatReg.length === 0 || flatReg.includes('(XX)')
      ? '(XX)'
      : reduceRegex(flatReg.map(e => e + ' '))
          .join('')
          .toLowerCase();

  return RegExp(expression, 'g');
};

export const countHexcode = (value: string) => value.split(' ').filter(code => code !== '' && code.length === 2).length;

export const filterSearchResult = ({
  search: { results },
  cellsRendered: { overscanStartIndex: firstIndex, overscanStopIndex: lastIndex }
}: Store): Array<{ index: number; length: number }> =>
  results.filter(
    (result: { index: number; length: number }, i: number) =>
      firstIndex <= result.index + result.length && result.index <= lastIndex
  );

export const isSearchIndex = (store: Store, index: number) =>
  store.search.results.findIndex(
    (result: { index: number; length: number }, i: number) =>
      result.index <= index && index < result.index + result.length && i !== store.search.selectedResult
  ) >= 0
    ? true
    : false;

export const isSelectedSearchIndex = (store: Store, index: number) => {
  if (store.search.selectedResult === null || store.search.results.length === 0) return false;
  const selectedResult = store.search.results[store.search.selectedResult];
  return selectedResult.index <= index && index < selectedResult.index + selectedResult.length;
};

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

export const executeSearchHexRegex = (
  data: string,
  expression: string,
  length: number
): Array<{ index: number; length: number }> => {
  let indexes: Array<number> = [];
  const regex = RegExp(expression.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
  while (regex.exec(data) !== null) indexes.push((regex.lastIndex - expression.length) / 3);
  return indexes.map(index => ({ index, length }));
};

export const executeSearchTextRegex = (
  data: string,
  expression: string,
  length: number
): Array<{ index: number; length: number }> => {
  let indexes: Array<number> = [];
  const regex = RegExp(expression, 'g');
  while (regex.exec(data) !== null) indexes.push((regex.lastIndex - length * 3) / 3);
  return indexes.map(index => ({ index, length }));
};

export const executeSearchRegex = (data: string, regex: RegExp, length: number): Array<number> => {
  let indexes: Array<number> = [];
  while (regex.exec(data) !== null) indexes.push((regex.lastIndex - length * 3) / 3);
  return indexes;
};

export const hasValidSearchResult = (store: Store): boolean =>
  store.search.selectedResult !== null && store.search.results !== null && store.search.results.length > 0;

export const prevSearchIndex = (results: Array<{ index: number; length: number }>, origin: number) => {
  if (results === null || results.length === 0) return null;
  else if (origin === null || origin < 0) return results.length - 1;
  else {
    let i = results.length - 1;
    while (i >= 0) {
      if (results[i].index < origin) return i;
      i--;
    }
    return results.length - 1;
  }
};

export const nextSearchIndex = (results: Array<{ index: number; length: number }>, origin: number) => {
  if (results === null || results.length === 0) return null;
  else if (origin === null || origin < 0) return 0;
  else {
    let i = 0;
    while (i < results.length) {
      if (results[i].index > origin) return i;
      i++;
    }
    return 0;
  }
};

export const clampSelectedSearchIndex = (store: Store, index: number): number => {
  if (index < 0) return store.search.results.length + index;
  else if (index >= store.search.results.length) return index - store.search.results.length;
  else return index;
};

// export const getSearchIndexes = (store: Store): number[] => {
//   const { indexes, length, selectedIndex } = store.search;
//   const { overscanStartIndex: start, overscanStopIndex: stop } = store.cellsRendered;
//   return indexes
//     .filter((index: number, i: number) => start <= index + length && index <= stop && i !== selectedIndex)
//     .map(index => Array.from({ length }, (_, i) => i + index))
//     .flat(1);
// };

export const getSearchResultsIndexes = (store: Store): number[] => {
  const { results, selectedResult } = store.search;
  const { overscanStartIndex: start, overscanStopIndex: stop } = store.cellsRendered;
  return results
    .filter((result, i) => start <= result.index + result.length && result.index <= stop && i !== selectedResult)
    .map(result => Array.from({ length: result.length }, (_, i) => i + result.index))
    .flat(1);
};

export const getSelectedSearchResultIndexes = (store: Store): number[] => {
  if (store.search.selectedResult === null || store.search.results.length === 0) return [];
  const selectedResult = store.search.results[store.search.selectedResult];
  const start = selectedResult.index;
  const end = selectedResult.index + selectedResult.length;
  return Array.from({ length: end - start }, (_, i) => i + start).filter(
    index => store.cellsRendered.overscanStartIndex <= index && index <= store.cellsRendered.overscanStopIndex
  );
};
