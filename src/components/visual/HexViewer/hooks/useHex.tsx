import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useStore } from '..';

export type HexContextProps = {
  hexData?: React.MutableRefObject<string>;
  hexMap?: React.MutableRefObject<Map<number, string>>;
  hexBase?: React.MutableRefObject<number>;
  hexOffsetSize?: React.MutableRefObject<number>;
  parseStringToHexString?: (text: string) => string;
  parseStringToHex?: (text: string) => Map<any, any>;
  parseDataToHexMap?: (data: string) => Map<number, string>;
  parseDataToTextMap?: (data: string) => Map<number, string>;
  parseDataToTextContent?: (data: string) => string;
  parseHexDataToHexMap?: (data: string) => Map<number, string>;
  getHexValue?: (index: number) => string;
  getTextValue?: (index: number) => string;
  getAddressValue?: (index: number) => string;
  toHexChar?: (hex: string) => string;
  onHexInit?: (data: string) => void;
  onHexOffsetSizeChange?: (size: number) => void;
};

export const HexContext = React.createContext<HexContextProps>(null);

export const WrappedHexProvider = ({ children }: HexProps) => {
  const { setHexBase, setHexOffsetSize } = useStore();

  const hexData = useRef<string>('');
  const hexMap = useRef<Map<number, string>>(new Map());
  const hexBase = useRef<number>(10);
  const hexOffsetSize = useRef<number>(8);

  const parseStringToHexString = useCallback(
    (text: string) =>
      Buffer.from(text)
        .toString('hex')
        .replace(/(.{2})/g, '$& '),
    []
  );

  const parseDataToHexMap = useCallback((data: string) => {
    let map = new Map();
    data
      .split('\n')
      .map(el => el.slice(11, 58))
      .join(' ')
      .split(/[ ]+/)
      .forEach((hex, index) => {
        map.set(index, hex);
      });
    return map;
  }, []);

  const parseDataToTextMap = useCallback((data: string) => {
    let map = new Map();
    data
      .split('\n')
      .map(el => el.slice(61, 77))
      .join('')
      .split('')
      .forEach((text, index) => {
        text === '.' ? map.set(index, '·') : map.set(index, text);
      });
    return map;
  }, []);

  const parseDataToTextContent = useCallback(
    (data: string) =>
      data
        .split('\n')
        .map(el => el.slice(61, 77))
        .join(''),
    []
  );

  const parseHexDataToHexMap = useCallback((data: string) => {
    let map = new Map();
    data.split(/[ ]+/).forEach((hex, index) => {
      map.set(index, hex);
    });
    return map;
  }, []);

  const toHexChar = useCallback((hex: string) => {
    let char = Buffer.from(hex, 'hex').toString();
    return ['�', ' '].includes(char) || parseInt(hex, 16) < 33 ? '·' : char;
  }, []);

  const getHexValue = useCallback(
    (index: number) => (index < hexMap.current.size ? hexMap.current.get(index).toUpperCase() : ''),
    []
  );

  const getTextValue = useCallback(
    (index: number) => (index < hexMap.current.size ? toHexChar(hexMap.current.get(index)) : ''),
    [toHexChar]
  );

  const getAddressValue = useCallback(
    (index: number) => index.toString(hexBase.current).toUpperCase().padStart(hexOffsetSize.current, '0'),
    []
  );

  const onHexInit = useCallback(
    (data: string) => {
      hexData.current = data;
      hexMap.current = parseHexDataToHexMap(data);
      setHexBase(hexBase.current);
      setHexOffsetSize(hexOffsetSize.current);
    },
    [parseHexDataToHexMap, setHexBase, setHexOffsetSize]
  );

  const onHexOffsetSizeChange = useCallback(
    (size: number) => {
      hexOffsetSize.current = size;
      setHexOffsetSize(size);
    },
    [setHexOffsetSize]
  );

  // const parseStringToHex = useCallback((text: string) => {
  //   let newMap = new Map();
  //   text.split(/[ ]+/).forEach((hex, index) => {
  //     newMap.set(index, hex);
  //   });
  //   return newMap;
  // }, []);

  // const onParseDataToHex = useCallback(
  //   (data: string, { setHexes }: StoreState) => setHexes(parseStringToHex(data)),
  //   [parseStringToHex]
  // );

  // const onClearHex = useCallback(({ setHexes }: StoreState) => setHexes(new Map()), []);

  // const getHexValue = useCallback(
  //   ({ hexChars }: StoreState, index: number) => (index < hexChars.size ? hexChars.get(index).toUpperCase() : ''),
  //   []
  // );

  // const getTextValue = useCallback(({ textChars }: StoreState, index: number) => {
  //   return index < textChars.size ? textChars.get(index) : '';
  //   const hex = index < hexChars.size ? hexChars.get(index) : '';
  //   const character = nullHexValue.includes(hex)
  //     ? ''
  //     : Buffer.from(hex, 'hex')
  //         .toString()
  //         .replace(/[^\x00-\x7F]/g, '');

  //   return character;
  //   return nullTextValue.includes(character) ? '·' : character;
  // }, []);

  return (
    <HexContext.Provider
      value={{
        hexData,
        hexMap,
        hexBase,
        hexOffsetSize,
        parseStringToHexString,
        parseDataToHexMap,
        parseDataToTextMap,
        parseDataToTextContent,
        parseHexDataToHexMap,
        getHexValue,
        getTextValue,
        getAddressValue,
        toHexChar,
        onHexInit,
        onHexOffsetSizeChange
      }}
    >
      {useMemo(() => children, [children])}
    </HexContext.Provider>
  );
};

export const HexProvider = React.memo(WrappedHexProvider);
export const useHex = (): HexContextProps => useContext(HexContext) as HexContextProps;
