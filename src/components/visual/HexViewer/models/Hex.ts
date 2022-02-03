/* eslint-disable no-control-regex */
import { Dispatch, SetStateAction } from 'react';

export type HexASCIIType = 'null' | 'non printable' | 'lower ASCII' | 'higher ASCII';

export type HexASCII = {
  type: HexASCIIType;
  regex: RegExp;
  value?: string;
  range: { start: number; end: number };
};

export type HexState = {
  hexOffsetBase?: number;
  hexOffsetSize?: number;
  hexBaseValues?: Array<{
    label: string;
    value: number;
  }>;
};

export type HexDispatch = {
  setHexOffsetBase?: Dispatch<SetStateAction<number>>;
  setHexOffsetSize?: Dispatch<SetStateAction<number>>;
  setHexBaseValues?: Dispatch<
    SetStateAction<
      Array<{
        label: string;
        value: number;
      }>
    >
  >;
};

export type HexContext = {
  setHexOffsetBase?: (value: number) => void;
  setHexOffsetSize?: (value: number) => void;
  setHexBaseValues?: (
    values: Array<{
      label: string;
      value: number;
    }>
  ) => void;
};

export const DEFAULT_HEX: HexState = {
  hexOffsetBase: 16,
  hexOffsetSize: 8
};

export const ASCII: Array<HexASCII> = [
  {
    type: 'null',
    value: '·',
    range: { start: 0, end: 0 },
    regex: new RegExp(/0/)
  },
  {
    type: 'non printable',
    value: '*',
    range: { start: 1, end: 31 },
    regex: new RegExp(/([0-9]|[12][0-9]|3[01])/)
  },
  {
    type: 'lower ASCII',
    range: { start: 32, end: 127 },
    regex: new RegExp(/(3[2-9]|[4-9][0-9]|1[01][0-9]|12[0-7])/)
  },
  {
    type: 'higher ASCII',
    value: '*',
    range: { start: 128, end: 255 },
    regex: new RegExp(/(12[89]|1[3-9][0-9]|2[0-4][0-9]|25[0-5])/)
  }
];
