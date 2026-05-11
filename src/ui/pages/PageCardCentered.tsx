import type { CardProps } from '@mui/material';
import { Card, styled, useMediaQuery, useTheme } from '@mui/material';
import { memo } from 'react';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  width: '22rem',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),

  [theme.breakpoints.down('sm')]: {
    width: '100%',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

export const PageCardCentered = memo(({ children, ...props }: CardProps) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <div
      style={{
        height: '100%',
        display: 'grid',
        placeItems: 'center'
      }}
    >
      <StyledCard elevation={isXs ? 0 : 4} {...props}>
        {children}
      </StyledCard>
    </div>
  );
});

PageCardCentered.displayName = 'PageCardCentered';
