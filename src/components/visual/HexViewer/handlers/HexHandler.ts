import { HexASCII } from '../models/Hex';

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

export const parseDataToHexcodeMap = (data: string) => {
  let map = new Map();
  data.split(/[ ]+/).forEach((hex, index) => {
    map.set(index, hex);
  });
  return map;
};

export const parseStringToHexString = (text: string) =>
  Buffer.from(text)
    .toString('hex')
    .replace(/(.{2})/g, '$& ');

export const parseDataToHexMap = (data: string) => {
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
};

export const parseDataToTextMap = (data: string) => {
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
};

export const parseDataToTextContent = (data: string) =>
  data
    .split('\n')
    .map(el => el.slice(61, 77))
    .join('');

export const parseHexDataToHexMap = (data: string) => {
  let map = new Map();
  data.split(/[ ]+/).forEach((hex, index) => {
    map.set(index, hex);
  });
  return map;
};

export const toHexChar = (hexcode: string) => {
  const value: number = parseInt(hexcode, 16);
  const char: string = Buffer.from(hexcode, 'hex').toString();
  const ascii = ASCII.find(element => value >= element.range.start && value <= element.range.end);

  if (ascii.type === 'null') return ascii.value;
  else if (ascii.type === 'non printable') return ascii.value;
  else if (ascii.type === 'lower ASCII') return char;
  else if (ascii.type === 'higher ASCII') return ascii.value;
  else return '';
};

export const getAddressValue = (offsetBase: number, offsetSize: number, index: number) =>
  index.toString(offsetBase).toUpperCase().padStart(offsetSize, '0');

export const getHexValue = (hexCodes: Map<number, string>, index: number) =>
  index >= 0 && index < hexCodes.size ? hexCodes.get(index).toUpperCase() : '';

export const getTextValue = (hexCodes: Map<number, string>, index: number) =>
  index >= 0 && index < hexCodes.size ? toHexChar(hexCodes.get(index)) : '';
