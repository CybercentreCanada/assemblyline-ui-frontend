import { CursorState, PartialR, ScrollState, SearchState, SearchType, SelectState, TypesConfig } from '..';

export type LocationParam = {
  key: string;
  type: 'number' | 'string' | 'symbol';
  path: Array<string>;
};

export type LocationQuery = {
  d?: string;
  scroll?: string;
  cursor?: string;
  selectStart?: string;
  selectEnd?: string;
  searchType?: SearchType;
  searchValue?: string;
  searchIndex?: string;
  test?: {
    test1: string;
    test2: string;
  };
};

export type LocationTypes = never;

export type LocationState = {
  location: PartialR<CursorState & SelectState & SearchState & ScrollState> & {
    // loaded: boolean;
    // params: Array<LocationParam>;
    // scroll: number;
    // cursor: number;
    // selectStart: number;
    // selectEnd: number;
    // searchType: SearchType;
    // searchValue: string;
    // searchIndex: number;
  };
};

export const LOCATION_PARAMS: Array<LocationParam> = [
  { key: 'a', type: 'number', path: ['cursor', 'index'] },
  { key: 'b', type: 'number', path: ['select', 'startIndex'] },
  { key: 'c', type: 'number', path: ['select', 'endIndex'] },
  { key: 'd', type: 'string', path: ['search', 'mode', 'type'] },
  { key: 'e', type: 'string', path: ['search', 'inputValue'] },
  { key: 'f', type: 'number', path: ['search', 'selectedResult'] }
];

export const LOCATION_STATE: LocationState = {
  location: {
    cursor: { index: null },
    select: { startIndex: -1, endIndex: -1 },
    scroll: { index: 0, rowIndex: 0, type: 'top' },
    search: { mode: { type: 'text', encoding: 'both', textSpan: 'wide' }, inputValue: '', selectedResult: null }
  }
};

export const LOCATION_TYPES: TypesConfig<LocationState, LocationTypes | SearchType> = {
  location: {
    // searchType: [
    //   {
    //     value: 0,
    //     type: 'cursor',
    //     label: { en: 'cursor', fr: 'cursor' },
    //     description: { en: 'cursor', fr: 'cursor' }
    //   },
    //   {
    //     value: 1,
    //     type: 'hex',
    //     label: { en: 'hex', fr: 'hex' },
    //     description: { en: 'hex', fr: 'hex' }
    //   },
    //   {
    //     value: 2,
    //     type: 'text',
    //     label: { en: 'text', fr: 'text' },
    //     description: { en: 'text', fr: 'text' }
    //   }
    // ]
  }
};
