import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  makeStyles,
  Paper,
  Typography,
  useTheme,
  withStyles
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(2)
  },
  gridList: {
    width: '100%'
  },
  statusChip: {
    colorPrimary: 'red'
  },
  labelList: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    marginLeft: -theme.spacing(0.5),
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    boxShadow: 'inherit',
    margin: 0,
    '& li ': {
      margin: theme.spacing(0.5)
    }
  }
}));

export type AlertFile = {
  md5: string;
  name: string;
  sha1: string;
  sha256: string;
  size: number;
  type: string;
};

export type AlertItem = {
  sid: string;
  type: string;
  reporting_ts: string;
  label: string[];
  priority: string;
  status: string;
  file: AlertFile;
};

type AlertProps = {
  item: AlertItem;
};

const Alert: React.FC<AlertProps> = ({ item }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Card className={classes.card}>
      {/* <CardHeader /> */}
      <CardContent>
        <Box display="flex" flexDirection="row">
          <Box width={150} flex="0 0 auto">
            <StatusChip label={item.status} />
          </Box>
          <Box display="flex" flexGrow={1} flexDirection="column">
            <Grid container spacing={1}>
              {/* row 1 .*/}
              <Grid item xs={4}>
                <Typography component="span">{item.type}</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography component="span">{item.reporting_ts}</Typography>
              </Grid>
              {/* row 2 */}
              <Grid item xs={4}></Grid>
              <Grid item xs={8}></Grid>
              {/* row 3 */}
              <Grid item xs={4}>
                <Typography component="span">{t('page.alerts.label')}</Typography>
              </Grid>
              <Grid item xs={8}>
                <Paper component="ul" className={classes.labelList}>
                  {item.label.map(label => (
                    <li>
                      <DefaultChip label={label} />
                    </li>
                  ))}
                </Paper>
              </Grid>
              {/* row 4 */}
              <Grid item xs={4}>
                {t('page.alerts.priority')}
              </Grid>
              <Grid item xs={8}>
                <DefaultChip label={item.priority} />
              </Grid>
              {/* row 4 */}
              <Grid item xs={4}>
                {t('page.alerts.status')}
              </Grid>
              <Grid item xs={8}>
                <DefaultChip label={item.status} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const StatusChip = ({ label }) => {
  const theme = useTheme();
  const StatusChip = withStyles({
    root: {
      backgroundColor: theme.palette.error.dark,
      color: theme.palette.common.white
    }
  })(Chip);
  return <StatusChip label={label} size="small" />;
};

const DefaultChip = ({ label }) => {
  const theme = useTheme();
  const DefaultChip = withStyles({
    root: {
      background: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText
    }
  })(Chip);
  return <DefaultChip label={label} size="small" />;
};

export default Alert;
