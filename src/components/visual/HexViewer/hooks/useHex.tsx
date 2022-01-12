import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useStore } from '..';

export type HexContextProps = {
  hexData?: React.MutableRefObject<string>;
  hexMap?: React.MutableRefObject<Map<number, string>>;
  nextHexBase?: React.MutableRefObject<number>;
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
  onHexLanguageChange?: (language: string) => void;
};

export const HexContext = React.createContext<HexContextProps>(null);

export const WrappedHexProvider = ({ children }: HexProps) => {
  const { setHexBase, setHexOffsetSize, setHexBaseValues } = useStore();

  const hexData = useRef<string>('');
  const hexMap = useRef<Map<number, string>>(new Map());
  const nextHexBase = useRef<number>(10);
  const nextHexOffsetSize = useRef<number>(8);
  const nextHexBaseValues = useRef<
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
    (index: number) => index.toString(nextHexBase.current).toUpperCase().padStart(nextHexOffsetSize.current, '0'),
    []
  );

  const onHexInit = useCallback(
    (data: string) => {
      hexData.current = data;
      hexMap.current = parseHexDataToHexMap(data);
      setHexBase(nextHexBase.current);
      setHexOffsetSize(nextHexOffsetSize.current);
    },
    [parseHexDataToHexMap, setHexBase, setHexOffsetSize]
  );

  const onHexOffsetSizeChange = useCallback(
    (size: number) => {
      nextHexOffsetSize.current = size;
      setHexOffsetSize(size);
    },
    [setHexOffsetSize]
  );

  const onHexIndexClamp = useCallback((index: number) => {
    if (index < 0) return 0;
    else if (index >= hexMap.current.size) return hexMap.current.size - 1;
    else return index;
  }, []);

  const onHexLanguageChange = useCallback(
    (language: string) => {
      if (language === 'en') {
        nextHexBaseValues.current = hexBaseTranslations.en;
        setHexBaseValues(hexBaseTranslations.en);
      } else if (language === 'fr') {
        nextHexBaseValues.current = hexBaseTranslations.fr;
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
      nextHexBase.current = event.target.value as number;
      setHexBase(event.target.value as number);
    },
    [setHexBase]
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
        nextHexBase,
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
        onHexLanguageChange
      }}
    >
      {useMemo(() => children, [children])}
    </HexContext.Provider>
  );
};

export const HexProvider = React.memo(WrappedHexProvider);
export const useHex = (): HexContextProps => useContext(HexContext) as HexContextProps;
