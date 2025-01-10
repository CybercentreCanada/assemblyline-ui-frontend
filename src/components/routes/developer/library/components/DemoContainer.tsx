import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

export const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(8)
  }
}));

type DemoContainerProps = {
  children?: React.ReactNode;
};

export const DemoContainer: React.FC<DemoContainerProps> = React.memo(({ children = null }: DemoContainerProps) => {
  const classes = useStyles();
  return <div className={classes.container}>{children}</div>;
});
