import type { TypographyProps } from '@mui/material';
import { Typography } from '@mui/material';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

//*****************************************************************************************
// ByteNumber
//*****************************************************************************************

/** Props for ByteNumber. */
export type ByteNumberProps = Omit<TypographyProps, 'children'> & {
  /** The byte value to format. */
  bytes: number;
  /** Custom render function receiving the formatted string. */
  children?: null | ((value: string) => React.ReactNode);
  /** Number of decimal places. */
  decimals?: number;
};

export const ByteNumber = memo(
  ({ bytes = null, children = null, decimals = 2, ...typographyProps }: ByteNumberProps) => {
    const { i18n } = useTranslation();

    const sizes = useMemo<string[]>(
      () =>
        i18n.language === 'fr'
          ? ['Octets', 'ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo']
          : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      [i18n.language]
    );

    const parsedBytes = useMemo<string>(() => {
      if (bytes === null || bytes === 0) return i18n.language === 'fr' ? '0 Octet' : '0 Bytes';

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }, [bytes, decimals, i18n.language, sizes]);

    return <Typography {...typographyProps}>{!children ? parsedBytes : children(parsedBytes)}</Typography>;
  }
);

ByteNumber.displayName = 'ByteNumber';
