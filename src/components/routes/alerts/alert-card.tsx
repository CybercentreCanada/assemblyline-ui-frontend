import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Link,
  makeStyles,
  Paper,
  Typography,
  useTheme,
  withStyles
} from '@material-ui/core';
import ClipboardIcon from '@material-ui/icons/AssignmentReturned';
import useClipboard from 'components/hooks/useClipboard';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(2),
    height: '100%'
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
  },
  typoLabel: {
    fontWeight: 'bold'
  },
  textWithIcon: {
    display: 'flex',
    alignItems: 'center'
  },
  longValues: {
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  clipboardIcon: {
    '& :hover': {
      cursor: 'pointer'
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

const AlertCard: React.FC<AlertProps> = ({ item }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { copy } = useClipboard();
  const { t } = useTranslation();
  return (
    <Card className={classes.card}>
      {/* <CardHeader /> .*/}
      <CardContent>
        <Box display="flex" flexDirection="row">
          <Box width={150} flex="0 0 auto">
            <StatusChip label={item.status} />
          </Box>
          <Box display="flex" flexGrow={1} flexDirection="column">
            <Grid container spacing={1}>
              {/* row 1 .*/}
              <Grid item xs={4}>
                <Typography component="span" className={classes.typoLabel}>
                  {item.type}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography component="span">{item.reporting_ts}</Typography>
              </Grid>
              {/* row 2 */}
              <Grid item xs={4}></Grid>
              <Grid item xs={8}></Grid>
              {/* row 3 */}
              <Grid item xs={4}>
                <Typography component="span" className={classes.typoLabel}>
                  {t('page.alerts.label')}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Paper component="ul" className={classes.labelList}>
                  {item.label.map((label, i) => (
                    <li key={`alert-label-${i}`}>
                      <DefaultChip label={label} />
                    </li>
                  ))}
                </Paper>
              </Grid>
              {/* row 4 */}
              <Grid item xs={4}>
                <Typography component="span" className={classes.typoLabel}>
                  {t('page.alerts.priority')}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <DefaultChip label={item.priority} />
              </Grid>
              {/* row 5 */}
              <Grid item xs={4}>
                <Typography component="span" className={classes.typoLabel}>
                  {t('page.alerts.status')}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <DefaultChip label={item.status} />
              </Grid>
              {/* row 6 */}
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={4}>
                    <Typography component="div" className={classes.typoLabel}>
                      {t('page.alerts.fileinfo')}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Link href="#">{item.file.name}</Link>
                    <Box component="span" paddingLeft={theme.spacing(0.1)}>
                      <Typography variant="caption">
                        {item.file.size} ({(item.file.size / 1024).toFixed(2)}Kb)
                      </Typography>
                    </Box>
                    <Typography>{item.file.type}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography style={{ marginLeft: theme.spacing(0.5) }}>MD5</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Box className={classes.textWithIcon}>
                      <Typography className={classes.longValues}>{item.file.md5}</Typography>
                      <ClipboardIcon className={classes.clipboardIcon} onClick={event => copy(item.file.md5)} />
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography style={{ marginLeft: theme.spacing(0.5) }}>SHA1</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Box className={classes.textWithIcon}>
                      <Typography className={classes.longValues}>{item.file.sha1}</Typography>
                      <ClipboardIcon className={classes.clipboardIcon} onClick={() => copy(item.file.sha1)} />
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography style={{ marginLeft: theme.spacing(0.5) }}>SHA256</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Box className={classes.textWithIcon}>
                      <Typography className={classes.longValues}>{item.file.sha256}</Typography>
                      <ClipboardIcon className={classes.clipboardIcon} onClick={event => copy(item.file.sha256)} />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              {/* row 7 */}
              <Grid item xs={4}>
                <Typography component="div" className={classes.typoLabel}>
                  {t('page.alerts.ownership')}
                </Typography>
              </Grid>
              <Grid item xs={8}></Grid>
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

export default AlertCard;
