import { TypesConfig } from '..';

export type SearchType = 'cursor' | 'hex' | 'text';
export type SearchEncoding = '8Bits' | '16Bits' | 'both';
export type SearchTextSpan = 'direct' | 'wide';

export type SearchTypes = SearchType | SearchTextSpan | SearchEncoding;

export type SearchState = {
  search: {
    mode: {
      type: SearchType;
      encoding: SearchEncoding;
      textSpan: SearchTextSpan;
    };
    inputValue: string;

    selectedResult: number;
    results: Array<{
      index: number;
      length: number;
    }>;
  };
};

export const SEARCH_STATE: SearchState = {
  search: {
    mode: {
      type: 'text',
      encoding: 'both',
      textSpan: 'direct'
    },
    inputValue: '',
    results: [],
    selectedResult: null
  }
};

export const SEARCH_TYPES: TypesConfig<SearchState, SearchTypes> = {
  search: {
    mode: {
      type: [
        {
          value: 0,
          type: 'cursor',
          label: { en: 'Cursor', fr: 'Cursor' },
          description: { en: 'Cursor', fr: 'Cursor' }
        },
        {
          value: 1,
          type: 'hex',
          label: { en: 'Hex', fr: 'Hex' },
          description: { en: 'Hex', fr: 'Hex' }
        },
        {
          value: 2,
          type: 'text',
          label: { en: 'Text', fr: 'Text' },
          description: { en: 'Text', fr: 'Text' }
        }
      ],
      encoding: [
        {
          value: 0,
          type: '8Bits',
          label: { en: '8 bits', fr: '8 bits' },
          description: { en: '8 bits', fr: '8 bits' }
        },
        {
          value: 1,
          type: '16Bits',
          label: { en: '16 bits', fr: '16 bits' },
          description: { en: '16 bits', fr: '16 bits' }
        },
        {
          value: 2,
          type: 'both',
          label: { en: '8 bits and 16 bits', fr: '8 bits et 16 bits' },
          description: { en: '8 bits and 16 bits', fr: '8 bits et 16 bits' }
        }
      ],
      textSpan: [
        {
          value: 0,
          type: 'direct',
          label: { en: 'Direct', fr: 'Directe' },
          description: { en: 'Direct', fr: 'Directe' }
        },
        {
          value: 1,
          type: 'wide',
          label: { en: 'Wide', fr: 'Large' },
          description: { en: 'Wide', fr: 'Large' }
        }
      ]
    }
  }
};
