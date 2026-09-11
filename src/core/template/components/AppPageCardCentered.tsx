import type { CardProps } from '@mui/material';
import { Card, styled, useMediaQuery, useTheme } from '@mui/material';
import { forwardRef, memo } from 'react';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  width: '22rem',
  maxWidth: '22rem',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),

  [theme.breakpoints.down('sm')]: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

export const AppPageCardCentered = memo(
  forwardRef<HTMLDivElement, CardProps>(({ children, ...props }: CardProps, ref) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));

    return (
      <div
        ref={ref}
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
  })
);

AppPageCardCentered.displayName = 'AppPageCardCentered';
