import { Typography, type TypographyProps } from '@mui/material';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type ByteNumberProps = Omit<TypographyProps, 'children'> & {
  bytes: number;
  decimals?: number;
  children?: null | ((value: string) => React.ReactNode);
};

export const ByteNumber: React.FC<ByteNumberProps> = React.memo(
  ({ bytes = null, decimals = 2, children = null, ...typographyProps }: ByteNumberProps) => {
    const { i18n } = useTranslation(['submit']);

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
