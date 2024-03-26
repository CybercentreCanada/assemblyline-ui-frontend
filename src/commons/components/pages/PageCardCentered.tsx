import { Card, styled, useMediaQuery, useTheme } from '@mui/material';
import { memo } from 'react';

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  left: '50%', // X
  top: '50%', // Y
  transform: 'translate(-50%, -50%)',
  maxWidth: '22rem',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '4px',
  maxHeight: '100%',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    maxWidth: '22rem'
  },
  [theme.breakpoints.up('sm')]: {
    width: '22rem'
  }
}));

function PageCardCentered({ children }) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  return (
    <StyledCard elevation={isXs ? 0 : 4}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: isXs ? '0 1rem 2rem' : '0 2rem 3rem',
          overflow: 'auto'
        }}
      >
        {children}
      </div>
    </StyledCard>
  );
}

export default memo(PageCardCentered);
