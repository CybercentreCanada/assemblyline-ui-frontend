import { styled } from '@mui/material';

export const DemoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(8)
}));
