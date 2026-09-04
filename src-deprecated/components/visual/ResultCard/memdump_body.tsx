import { styled } from '@mui/material';
import type { MemDumpBody as MemDumpData } from 'components/models/base/result_body';
import { default as React } from 'react';

const MemDumpContainer = styled('pre')(({ theme }) => ({
  '@media print': {
    backgroundColor: '#00000005',
    border: '1px solid #DDD'
  },
  backgroundColor: theme.palette.mode === 'dark' ? '#ffffff05' : '#00000005',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  padding: '4px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  margin: '0.25rem 0'
}));

type Props = {
  body: MemDumpData;
};

const WrappedMemDumpBody = ({ body }: Props) => {
  return <MemDumpContainer>{body}</MemDumpContainer>;
};

export const MemDumpBody = React.memo(WrappedMemDumpBody);
