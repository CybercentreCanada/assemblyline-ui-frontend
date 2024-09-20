import { Paper, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { memo, ReactNode } from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'grid',
    placeItems: 'center'
  },
  card: {
    maxWidth: '22rem',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '4px',
    padding: '0 2rem 3rem',
    [theme.breakpoints.down('sm')]: {
      backgroundColor: theme.palette.background.default,
      width: '100%',
      maxWidth: '22rem'
    },
    [theme.breakpoints.up('sm')]: {
      width: '22rem'
    },
    [theme.breakpoints.only('xs')]: {
      padding: '0 1rem 2rem'
    }
  }
}));

type Props = {
  children?: ReactNode;
};

const PageCardCentered = ({ children = null }: Props) => {
  const theme = useTheme();
  const classes = useStyles();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <div className={classes.root}>
      <div style={{ padding: theme.spacing(1) }}>
        <Paper className={classes.card} elevation={isXs ? 0 : 4}>
          {children}
        </Paper>
      </div>
    </div>
  );
};

export default memo(PageCardCentered);
