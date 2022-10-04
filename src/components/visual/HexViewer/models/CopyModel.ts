import { TypesConfig } from '..';

/**
 * Text Copy Types
 *  - Parsed Hex Conversion : using toHexChar2
 *  - Prefix Notation : using blackslash caret value in one line
 *  - Displayed Values : straight the displayed value shown in one line
 */

export type CopyNonPrintableMode = 'displayed' | 'parsed';
export type CopyTypes = CopyNonPrintableMode;

export type CopyState = {
  copy: { nonPrintable: { mode: CopyNonPrintableMode; prefix: string } };
};

export const COPY_STATE: CopyState = {
  copy: { nonPrintable: { mode: 'parsed', prefix: '\\' } }
};

export const COPY_TYPES: TypesConfig<CopyState, CopyTypes> = {
  copy: {
    nonPrintable: {
      mode: [
        {
          value: 0,
          type: 'parsed',
          label: { en: 'Parsed', fr: 'Analysé' },
          description: { en: 'Parsed', fr: 'Analysé' }
        },
        {
          value: 1,
          type: 'displayed',
          label: { en: 'Displayed', fr: 'Affichée' },
          description: { en: 'Displayed', fr: 'Affichée' }
        }
      ]
    }
  }
};
