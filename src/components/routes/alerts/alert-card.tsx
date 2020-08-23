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
import React, { Fragment } from 'react';
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
    padding: 0,
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
  },
  separatedList: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    marginLeft: -theme.spacing(0.5),
    padding: 0,
    boxShadow: 'inherit',
    margin: 0,
    '& a::after': {
      content: "'|'",
      margin: '0 5px',
      fontWeight: 'bold',
      fontSize: 'larger'
    },
    '& li:last-child > a::after': {
      display: 'none'
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
  alert_id: string;
  type: string;
  reporting_ts: string;
  label: string[];
  priority: string;
  status: string;
  file: AlertFile;
  owner: string;
  category: string;
  metadata: {
    [key: string]: any;
  }[];
  heuristic: { name: string[] };
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
                <Typography>{item.reporting_ts}</Typography>
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
              {/* row 6: File Info */}
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
              {/* row 7: Owner */}
              <Grid item xs={4}>
                <Typography component="span" className={classes.typoLabel}>
                  {t('page.alerts.ownership')}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{item.owner}</Typography>
              </Grid>
              {/* row 8: Metadata */}
              <Grid item xs={12}>
                <Grid container>
                  {Object.keys(item.metadata).map(k => (
                    <Fragment key={k}>
                      <Grid item xs={4}>
                        <Typography className={classes.typoLabel}>{k}</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography>{item.metadata[k]}</Typography>
                      </Grid>
                    </Fragment>
                  ))}
                </Grid>
              </Grid>
              {/* row 9: Category */}
              {item.category ? (
                <>
                  <Grid item xs={4}>
                    <Typography component="span" className={classes.typoLabel}>
                      {t('page.alerts.cateory')}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{item.category}</Typography>
                  </Grid>
                </>
              ) : null}
              {/* row 10: Patterns */}

              {/* row 11: Heurisitics */}
              {item.heuristic ? (
                <>
                  <Grid item xs={4}>
                    <Typography component="span" className={classes.typoLabel}>
                      {t('page.alerts.heuristic')}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <ul className={classes.separatedList}>
                      {item.heuristic.name.map(h => (
                        <li key={h}>
                          <Link href="#">{h}</Link>
                        </li>
                      ))}
                    </ul>
                  </Grid>
                </>
              ) : null}
              {/* row 12: Behaviours. */}
              {/* row 13: Attibutions */}
              {/* row 14: AV Hits */}
              {/* row 15: IPs */}
              {/* row 16: Domains */}
              {/* row 17: Yara Hits */}
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
