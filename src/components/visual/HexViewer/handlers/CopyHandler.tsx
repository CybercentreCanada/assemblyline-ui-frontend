import { Buffer } from 'buffer';
import { getHigherAsciiFromDec, getNonPrintableAsciiFromDec, Store } from '..';

/**
 * Text Copy Types
 *  - Parsed Hex Conversion : using toHexChar2
 *  - Prefix Notation : using blackslash caret value in one line
 *  - Displayed Values : straight the displayed value shown in one line
 */

export const getCopyHexCharacter = (store: Store, hexcode: string) => {
  const value: number = parseInt(hexcode, 16);
  if (isNaN(value)) return '';

  // Null ASCII Character
  if (value === 0) {
    if (store.copy.nonPrintable.mode === 'parsed') return getNonPrintableAsciiFromDec(0, 'copy');
    else if (store.copy.nonPrintable.mode === 'displayed') return store.hex.null.char;
    else return '';
  }
  // Non Printable ASCII Characters
  else if (1 <= value && value <= 31) {
    if (store.hex.nonPrintable.set === 'hidden' && store.copy.nonPrintable.mode === 'displayed')
      return store.hex.nonPrintable.char;
    else if (store.copy.nonPrintable.mode === 'parsed') return getNonPrintableAsciiFromDec(value, 'copy');
    else if (store.copy.nonPrintable.mode === 'displayed')
      return getNonPrintableAsciiFromDec(value, store.hex.nonPrintable.set as 'CP437' | 'caret' | 'copy');
    else return '';
  }
  // Lower ASCII ASCII Characters
  else if (32 <= value && value <= 127) {
    return Buffer.from(hexcode, 'hex').toString();
  }
  // Higher ASCII Characters
  else if (128 <= value && value <= 255) {
    if (store.hex.higher.set === 'hidden') return store.hex.higher.char;
    else if (['CP437', 'windows1252'].includes(store.hex.higher.set))
      return getHigherAsciiFromDec(value, store.hex.higher.set as 'CP437' | 'windows1252');
    else if (
      ['ascii', 'base64', 'base64url', 'hex', 'latin1', 'ucs-2', 'ucs2', 'utf-8', 'utf16le', 'utf8'].includes(
        store.hex.higher.set
      )
    )
      return Buffer.from(hexcode, 'hex').toString(store.hex.higher.set as BufferEncoding);
    else return '';
  } else return '';
};
