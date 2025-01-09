import { Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

export const useStyles = makeStyles(theme => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(8)
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(3)
  }
}));

type DemoSectionProps = {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
};

export const DemoSection: React.FC<DemoSectionProps> = React.memo(
  ({ primary, secondary, left, right }: DemoSectionProps) => {
    const theme = useTheme();
    const classes = useStyles();

    return (
      <div className={classes.main}>
        <div className={classes.container}>
          <div>
            <Typography variant="h6">{primary}</Typography>
            <Typography color="textSecondary" variant="body2">
              {secondary}
            </Typography>
          </div>

          <Grid container spacing={2}>
            <Grid
              md={6}
              xs={12}
              sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2), minHeight: '300px' }}
            >
              {left}
            </Grid>
            <Grid
              md={6}
              xs={12}
              sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2), minHeight: '300px' }}
            >
              {right}
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
);
