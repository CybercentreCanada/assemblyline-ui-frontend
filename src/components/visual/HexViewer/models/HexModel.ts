import { TypesConfig } from '..';

/**
 * ASCII encoding : 7 bits
 * extended ASCII encoding : 1 Byte - Base 64
 * UNICODE encoding : 2 bytes - 2 Base 64
 */

export type HexEncoding = 'ASCII' | 'Unicode' | 'Both';
export type HexASCIIZone = 'null' | 'non printable' | 'lower ASCII' | 'higher ASCII';
export type OffsetBase = 8 | 10 | 16;
export type HexSet =
  | 'hidden'
  | 'caret'
  | 'CP437'
  | 'windows1252'
  | 'ascii'
  | 'base64'
  | 'base64url'
  | 'hex'
  | 'latin1'
  | 'ucs-2'
  | 'ucs2'
  | 'utf-8'
  | 'utf16le'
  | 'utf8';

export type HexASCII = {
  type: HexASCIIZone;
  regex: RegExp;
  value?: string;
  range: { start: number; end: number };
};

export type HexTypes = HexEncoding | HexSet | OffsetBase;

export type HexState = {
  hex: {
    data: string;
    codes: Map<number, string>;
    encoding: HexEncoding;
    null: {
      char: string;
    };
    nonPrintable: {
      set: HexSet;
      char: string;
    };
    higher: {
      set: HexSet;
      char: string;
    };
  };
  offset: {
    data: Map<number, number>;
    show: boolean;
    base: OffsetBase;
    size: number;
  };
};

export const HEX_STATE: HexState = {
  hex: {
    data: '',
    codes: new Map(),
    encoding: 'Both',
    null: {
      char: '.'
    },
    nonPrintable: {
      set: 'hidden',
      char: '.'
    },
    higher: {
      set: 'hidden',
      char: '.'
    }
  },
  offset: {
    data: new Map(),
    show: true,
    base: 16,
    size: 8
  }
};

export const HEX_TYPES: TypesConfig<HexState, HexTypes> = {
  hex: {
    encoding: [
      {
        value: 0,
        type: 'Both',
        label: { en: 'Both', fr: 'Both' },
        description: { en: 'Both', fr: 'Both' }
      },
      {
        value: 2,
        type: 'ASCII',
        label: { en: 'ASCII', fr: 'ASCII' },
        description: { en: 'ASCII', fr: 'ASCII' }
      },
      {
        value: 4,
        type: 'Unicode',
        label: { en: 'Unicode', fr: 'Unicode' },
        description: { en: 'Unicode', fr: 'Unicode' }
      }
    ],
    nonPrintable: {
      set: [
        {
          value: 0,
          type: 'hidden',
          label: { en: 'Hidden', fr: 'Caché' },
          description: { en: 'Hidden', fr: 'Caché' }
        },
        {
          value: 1,
          type: 'caret',
          label: { en: 'Caret notation', fr: 'Notation caret' },
          description: { en: 'Caret notation', fr: 'Notation caret' }
        },
        {
          value: 2,
          type: 'CP437',
          label: { en: 'Code page 437', fr: 'Code page 437' },
          description: { en: 'Code page 437', fr: 'Code page 437' }
        }
      ]
    },
    higher: {
      set: [
        {
          value: 0,
          type: 'hidden',
          label: { en: 'Hidden', fr: 'Caché' },
          description: { en: 'Hidden', fr: 'Caché' }
        },
        {
          value: 1,
          type: 'CP437',
          label: { en: 'Code page 437', fr: 'Code page 437' },
          description: { en: 'Code page 437', fr: 'Code page 437' }
        },
        {
          value: 2,
          type: 'windows1252',
          label: { en: 'Windows-1252', fr: 'Windows-1252' },
          description: { en: 'Windows-1252', fr: 'Windows-1252' }
        },
        {
          value: 3,
          type: 'ascii',
          label: { en: 'ASCII', fr: 'ASCII' },
          description: { en: 'ASCII', fr: 'ASCII' }
        },
        {
          value: 4,
          type: 'latin1',
          label: { en: 'Latin-1', fr: 'Latin-1' },
          description: { en: 'Latin-1', fr: 'Latin-1' }
        }
      ]
    }
  },
  offset: {
    base: [
      {
        value: 8,
        type: 8,
        label: { en: 'Octal', fr: 'Octal' },
        description: { en: 'Octal', fr: 'Octal' }
      },
      {
        value: 10,
        type: 10,
        label: { en: 'Decimal', fr: 'Décimal' },
        description: { en: 'Decimal', fr: 'Décimal' }
      },
      {
        value: 16,
        type: 16,
        label: { en: 'Hexadecimal', fr: 'Hexadécimal' },
        description: { en: 'Hexadecimal', fr: 'Hexadécimal' }
      }
    ]
  }
};
