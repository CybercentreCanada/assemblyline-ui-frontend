/* eslint-disable no-control-regex */

export type HexASCIIType = 'null' | 'non printable' | 'lower ASCII' | 'higher ASCII';

export type HexASCII = {
  type: HexASCIIType;
  regex: RegExp;
  value?: string;
  range: { start: number; end: number };
};

export type HexState = {
  hex?: {
    data: string;
    codes: Map<number, string>;
  };
  offset?: {
    base: number;
    size: number;
    values: Array<{ label: string; value: number }>;
  };
  hexOffsetBase?: number;
  hexOffsetSize?: number;
  hexBaseValues?: Array<{
    label: string;
    value: number;
  }>;
};

export type HexRef = {};

export type HexPayload = any;

export type HexDispatch = {
  onHexInit?: (data: number) => any;
  setHexOffsetBase?: (value: number) => void; // to delete
  setHexOffsetSize?: (value: number) => void; // to delete
  setHexBaseValues?: (
    // to delete
    values: Array<{
      label: string;
      value: number;
    }>
  ) => void;
};

// to delete
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
