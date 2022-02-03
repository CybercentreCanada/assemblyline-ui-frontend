export type HexTranslations = {
  en: Array<{
    label: string;
    value: number;
  }>;
  fr: Array<{
    label: string;
    value: number;
  }>;
};

export const HEX_TRANSLATIONS: HexTranslations = {
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
};
