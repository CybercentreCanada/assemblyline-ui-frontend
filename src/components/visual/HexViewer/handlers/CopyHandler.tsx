import { getHigherAsciiFromDec, getNonPrintableAsciiFromDec, Store } from '..';

/**
 * Text Copy Types
 *  - Parsed Hex Conversion : using toHexChar2
 *  - Prefix Notation : using blackslash caret value in one line
 *  - Displayed Values : straight the displayed value shown in one line
 */

type NonPrintableCopy = { parsed: 'parsed'; displayed: 'displayed' };
const NON_PRINTABLE_COPY_TYPE: NonPrintableCopy = { parsed: 'parsed', displayed: 'displayed' };
export type NonPrintableCopyType = typeof NON_PRINTABLE_COPY_TYPE[keyof typeof NON_PRINTABLE_COPY_TYPE];
export type IsNonPrintableCopyType = { [Property in NonPrintableCopyType]: (store: Store) => boolean };
export const isNonPrintableCopyType = Object.fromEntries(
  Object.keys(NON_PRINTABLE_COPY_TYPE).map(key => [
    key,
    (store: Store) => store.copy.nonPrintable.type === NON_PRINTABLE_COPY_TYPE[key]
  ])
) as IsNonPrintableCopyType;

export const NON_PRINTABLE_COPY_TYPE_VALUES: {
  en: Array<{ label: string; type: NonPrintableCopyType; value: number }>;
  fr: Array<{ label: string; type: NonPrintableCopyType; value: number }>;
} = {
  en: [
    { label: 'Displayed', type: 'displayed', value: 0 },
    { label: 'Parsed', type: 'parsed', value: 1 }
  ],
  fr: [
    { label: 'Affichée', type: 'displayed', value: 0 },
    { label: 'Analysé', type: 'parsed', value: 1 }
  ]
};

export const getCopyHexCharacter = (store: Store, hexcode: string) => {
  const value: number = parseInt(hexcode, 16);
  if (isNaN(value)) return '';

  // Null ASCII Character
  if (value === 0) {
    if (store.copy.nonPrintable.type === 'parsed') return getNonPrintableAsciiFromDec(0, 'copy');
    else if (store.copy.nonPrintable.type === 'displayed') return store.hex.null.char;
    else return '';
  }
  // Non Printable ASCII Characters
  else if (1 <= value && value <= 31) {
    if (store.hex.nonPrintable.encoding === 'hidden' && store.copy.nonPrintable.type === 'displayed')
      return store.hex.nonPrintable.char;
    else if (store.copy.nonPrintable.type === 'parsed') return getNonPrintableAsciiFromDec(value, 'copy');
    else if (store.copy.nonPrintable.type === 'displayed')
      return getNonPrintableAsciiFromDec(value, store.hex.nonPrintable.encoding as 'CP437' | 'caret' | 'copy');
    else return '';
  }
  // Lower ASCII ASCII Characters
  else if (32 <= value && value <= 127) {
    return Buffer.from(hexcode, 'hex').toString();
  }
  // Higher ASCII Characters
  else if (128 <= value && value <= 255) {
    if (store.hex.higher.encoding === 'hidden') return store.hex.higher.char;
    else if (['CP437', 'windows1252'].includes(store.hex.higher.encoding))
      return getHigherAsciiFromDec(value, store.hex.higher.encoding as 'CP437' | 'windows1252');
    else if (
      ['ascii', 'base64', 'base64url', 'hex', 'latin1', 'ucs-2', 'ucs2', 'utf-8', 'utf16le', 'utf8'].includes(
        store.hex.higher.encoding
      )
    )
      return Buffer.from(hexcode, 'hex').toString(store.hex.higher.encoding as BufferEncoding);
    else return '';
  } else return '';
};
