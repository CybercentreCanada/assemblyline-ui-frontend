import { Chip } from '@mui/material';
import type { FC } from 'react';
import type { MxProps } from '.';

const AMBER_SX = {
  color: '#FFC000',
  backgroundColor: '#000'
};

export const TLP_SCHEMA = {
  red: {
    sx: {
      color: '#FF2B2B',
      backgroundColor: '#000'
    },
    text: 'TLP:RED'
  },
  amber: {
    sx: AMBER_SX,
    text: 'TLP:AMBER'
  },
  'amber+strict': {
    sx: AMBER_SX,
    text: 'TLP:AMBER+STRICT'
  },
  green: {
    sx: {
      color: '#33FF00',
      backgroundColor: '#000'
    },
    text: 'TLP:GREEN'
  },
  clear: {
    sx: {
      color: '#FFFFFF',
      backgroundColor: '#000'
    },
    text: 'TLP:CLEAR'
  }
};

export type AppTLPValue = keyof typeof TLP_SCHEMA;

type AppTLPProps = {
  value: AppTLPValue;
  mx?: MxProps;
};

export const AppTLP: FC<AppTLPProps> = ({ value, mx }) => {
  const configs = TLP_SCHEMA[value];
  return (
    <Chip
      size="small"
      variant="filled"
      label={configs.text}
      sx={{ ...configs.sx, ...(mx ?? {}), borderRadius: 0, fontWeight: 600 }}
    />
  );
};
