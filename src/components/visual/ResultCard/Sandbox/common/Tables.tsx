import { useTheme } from '@mui/material';
import { KVBody } from 'components/visual/ResultCard/kv_body';
import TitleKey from 'components/visual/TitleKey';
import React, { useMemo } from 'react';

type DetailTableCellValueProps = {
  value?: unknown;
};

const DetailTableCellValue = React.memo(({ value = null }: DetailTableCellValueProps) => {
  if (Array.isArray(value))
    return (
      <>
        {value.map((v, i) => (
          <DetailTableCellValue key={i} value={v} />
        ))}
      </>
    );
  if (value && typeof value === 'object') return Object.keys(value).length > 0 ? <KVBody body={value} /> : null;
  if (value === null || value === undefined) return null;
  return <>{String(value)}</>;
});

type DetailTableRowProps = {
  label?: string;
  value?: unknown;
  isHeader?: boolean;
  children?: React.ReactNode;
};

export const DetailTableRow = React.memo(({ label, value, isHeader = false, children = null }: DetailTableRowProps) => {
  const theme = useTheme();

  const showValue = useMemo(() => {
    if (children) return true;
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
  }, [children, value]);

  if (isHeader) {
    return (
      <tr>
        <td colSpan={2} style={{ paddingRight: '16px', wordBreak: 'normal', color: theme.palette.text.secondary }}>
          <TitleKey title={label || ''} />
        </td>
      </tr>
    );
  }

  if (showValue)
    return (
      <tr>
        <td style={{ paddingRight: '16px', wordBreak: 'normal' }}>
          <TitleKey title={label || ''} />
        </td>
        <td>{children ?? <DetailTableCellValue value={value} />}</td>
      </tr>
    );
});
