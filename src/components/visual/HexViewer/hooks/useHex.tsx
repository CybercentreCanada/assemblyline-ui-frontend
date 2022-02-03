import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useStore } from '..';
import { ASCII, DEFAULT_HEX } from '../models/Hex';

export type HexContextProps = {
  hexData?: React.MutableRefObject<string>;
  hexMap?: React.MutableRefObject<Map<number, string>>;
  nextHexOffsetBase?: React.MutableRefObject<number>;
  nextHexOffsetSize?: React.MutableRefObject<number>;
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
  onHexIndexClamp?: (index: number) => number;
  onHexBaseChange?: (
    event: React.ChangeEvent<{
      name?: string;
      value: unknown;
    }>,
    child: React.ReactNode
  ) => void;
  onHexBaseValueChange?: (value: number) => void;
  onHexLanguageChange?: (language: string) => void;
};

export const HexContext = React.createContext<HexContextProps>(null);

export const WrappedHexProvider = ({ children }: HexProps) => {
  const { setHexOffsetBase, setHexOffsetSize, setHexBaseValues } = useStore();

  const hexData = useRef<string>('');
  const hexMap = useRef<Map<number, string>>(new Map());
  const nextHexOffsetBase = useRef<number>(DEFAULT_HEX.hexOffsetBase);
  const nextHexOffsetSize = useRef<number>(DEFAULT_HEX.hexOffsetSize);
  const nextHexOffsetBaseValues = useRef<
    Array<{
      label: string;
      value: number;
    }>
  >([
    { label: 'Octal', value: 8 },
    { label: 'Decimal', value: 10 },
    { label: 'Hexadecimal', value: 16 }
  ]);
  const hexBaseTranslations = useMemo<{
    en: Array<{
      label: string;
      value: number;
    }>;
    fr: Array<{
      label: string;
      value: number;
    }>;
  }>(
    () => ({
      en: [
        { label: 'Octal', value: 8 },
        { label: 'Decimal', value: 10 },
        { label: 'Hexadecimal', value: 16 }
      ],
      fr: [
        { label: 'Octal', value: 8 },
        { label: 'Décimal', value: 10 },
        { label: 'Hexadécimal', value: 16 }
      ]
    }),
    []
  );

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
    // let char = Buffer.from(hex, 'hex').toString();
    // return ['�', ' '].includes(char) || parseInt(hex, 16) < 33 ? '·' : char;

    const value: number = parseInt(hex, 16);
    const char: string = Buffer.from(hex, 'hex').toString();
    const ascii = ASCII.find(element => value >= element.range.start && value <= element.range.end);

    if (ascii.type === 'null') return ascii.value;
    else if (ascii.type === 'non printable') return ascii.value;
    else if (ascii.type === 'lower ASCII') return char;
    else if (ascii.type === 'higher ASCII') return ascii.value;
    else return '';
  }, []);

  const getHexValue = useCallback((index: number) => {
    return index >= 0 && index < hexMap.current.size ? hexMap.current.get(index).toUpperCase() : '';
  }, []);

  const getTextValue = useCallback(
    (index: number) => (index < hexMap.current.size ? toHexChar(hexMap.current.get(index)) : ''),
    [toHexChar]
  );

  const getAddressValue = useCallback(
    (index: number) => index.toString(nextHexOffsetBase.current).toUpperCase().padStart(nextHexOffsetSize.current, '0'),
    []
  );

  const onHexInit = useCallback(
    (data: string) => {
      hexData.current = data;
      hexMap.current = parseHexDataToHexMap(data);
      setHexOffsetBase(nextHexOffsetBase.current);
      setHexOffsetSize(nextHexOffsetSize.current);
    },
    [parseHexDataToHexMap, setHexOffsetBase, setHexOffsetSize]
  );

  const onHexOffsetSizeChange = useCallback(
    (size: number) => {
      nextHexOffsetSize.current = size;
      setHexOffsetSize(size);
    },
    [setHexOffsetSize]
  );

  const onHexIndexClamp = useCallback((index: number) => {
    if (index <= 0) return 0;
    else if (index >= hexMap.current.size) return hexMap.current.size - 1;
    else return index;
  }, []);

  const onHexLanguageChange = useCallback(
    (language: string) => {
      if (language === 'en') {
        nextHexOffsetBaseValues.current = hexBaseTranslations.en;
        setHexBaseValues(hexBaseTranslations.en);
      } else if (language === 'fr') {
        nextHexOffsetBaseValues.current = hexBaseTranslations.fr;
        setHexBaseValues(hexBaseTranslations.fr);
      }
    },
    [hexBaseTranslations.en, hexBaseTranslations.fr, setHexBaseValues]
  );

  const onHexBaseChange = useCallback(
    (
      event: React.ChangeEvent<{
        name?: string;
        value: unknown;
      }>,
      child: React.ReactNode
    ) => {
      nextHexOffsetBase.current = event.target.value as number;
      setHexOffsetBase(event.target.value as number);
    },
    [setHexOffsetBase]
  );

  const onHexBaseValueChange = useCallback(
    (value: number) => {
      nextHexOffsetBase.current = value;
      setHexOffsetBase(value);
    },
    [setHexOffsetBase]
  );

  return (
    <HexContext.Provider
      value={{
        hexData,
        hexMap,
        nextHexOffsetBase,
        nextHexOffsetSize,
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
        onHexOffsetSizeChange,
        onHexIndexClamp,
        onHexBaseChange,
        onHexBaseValueChange,
        onHexLanguageChange
      }}
    >
      {useMemo(() => children, [children])}
    </HexContext.Provider>
  );
};

export const HexProvider = React.memo(WrappedHexProvider);
export const useHex = (): HexContextProps => useContext(HexContext) as HexContextProps;
