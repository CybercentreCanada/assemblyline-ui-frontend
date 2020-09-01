import {
  Badge,
  Box,
  Card,
  CardContent,
  CardHeader,
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
import ScoreIcon from '@material-ui/icons/Score';
import useClipboard from 'commons/components/hooks/useClipboard';
import AlertCardActions from 'components/routes/alerts/alert-card-actions';
import { AlertItem } from 'components/routes/alerts/alerts';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

//
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
    padding: 0,
    boxShadow: 'inherit',
    margin: 0,
    '& a': {
      color: theme.palette.primary.main
    },
    '& a::after': {
      content: "'|'",
      margin: '0 5px',
      fontWeight: 'bold'
    },
    '& li:last-child > a::after': {
      display: 'none'
    },
    '& span': {
      color: theme.palette.primary.main,
      fontWeight: 'bold'
    },
    '& span::after': {
      content: "'|'",
      margin: '0 5px',
      fontWeight: 'bold'
    },
    '& li:last-child > span::after': {
      display: 'none'
    }
  }
}));

type AlertCardProps = {
  item: AlertItem;
};

//
const AlertCard: React.FC<AlertCardProps> = ({ item }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { copy } = useClipboard();
  const { t } = useTranslation();

  const header = (
    <Box display="flex" flexDirection="row">
      <StatusChip label="Malicious" />
      <Badge badgeContent={item.al.score} color="error" max={10000}>
        <ScoreIcon />
      </Badge>
      <Box display="inline-flex" paddingLeft={theme.spacing(0.2)} />
      <Typography variant="h6">{item.group_count}x</Typography>
      <Box display="inline-flex" flexGrow={1} />
      <AlertCardActions />
    </Box>
  );

  return (
    <Card className={classes.card}>
      <CardHeader title={header} />
      <CardContent>
        <Grid container spacing={1}>
          {/* row 1 */}{' '}
          <Grid item xs={4}>
            <Typography component="span" className={classes.typoLabel}>
              {item.type}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography>{item.reporting_ts}</Typography>
          </Grid>
          {/* row 2 */}
          <Grid item xs={4} />
          <Grid item xs={8} />
          {/* row 3 */}
          <Grid item xs={4}>
            <Typography className={classes.typoLabel}>{t('page.alerts.label')}</Typography>
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
            <Typography className={classes.typoLabel}>{t('page.alerts.priority')}</Typography>
          </Grid>
          <Grid item xs={8}>
            <DefaultChip label={item.priority} />
          </Grid>
          {/* row 5 */}
          <Grid item xs={4}>
            <Typography className={classes.typoLabel}>{t('page.alerts.status')}</Typography>
          </Grid>
          <Grid item xs={8}>
            <DefaultChip label={item.status} />
          </Grid>
          {/* row 6: File Info */}
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography className={classes.typoLabel}>{t('page.alerts.fileinfo')}</Typography>
              </Grid>
              <Grid item xs={8}>
                <Link href={item.file.name}>{item.file.name}</Link>
                <Typography variant="caption" style={{ marginLeft: theme.spacing(1) }}>
                  {item.file.size}({(item.file.size / 1024).toFixed(2)}Kb)
                </Typography>
                <Typography>{item.file.type}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography className={classes.typoLabel}>MD5</Typography>
              </Grid>
              <Grid item xs={8}>
                <Box className={classes.textWithIcon}>
                  <Typography className={classes.longValues}>{item.file.md5}</Typography>
                  <ClipboardIcon className={classes.clipboardIcon} onClick={event => copy(item.file.md5)} />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Typography className={classes.typoLabel}>SHA1</Typography>
              </Grid>
              <Grid item xs={8}>
                <Box className={classes.textWithIcon}>
                  <Typography className={classes.longValues}>{item.file.sha1}</Typography>
                  <ClipboardIcon className={classes.clipboardIcon} onClick={() => copy(item.file.sha1)} />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Typography className={classes.typoLabel}>SHA256</Typography>
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
          {item.owner ? (
            <>
              <Grid item xs={4}>
                <Typography className={classes.typoLabel}>{t('page.alerts.ownership')}</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{item.owner}</Typography>
              </Grid>
            </>
          ) : null}
          {/* row 8: Metadata */}
          <Grid item xs={12}>
            <Grid container spacing={1}>
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
          {item.attack.category ? (
            <>
              <Grid item xs={4}>
                <Typography className={classes.typoLabel}>{t('page.alerts.category')}</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography style={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {item.attack.category}
                </Typography>
              </Grid>
            </>
          ) : null}
          {/* row 10: Patterns */}
          <SeparatedList label={t('page.alerts.patterns')} list={item.attack.pattern} />
          {/* row 11: Heurisitics. */}
          <SeparatedList label={t('page.alerts.heuristic')} list={item.heuristic.name} component="link" />
          {/* row 12: Behaviours. */}
          <SeparatedList label={t('page.alerts.behaviours')} list={item.al.behavior} />
          {/* row 13: Attibutions */}
          <SeparatedList label={t('page.alerts.attributions')} list={item.al.attrib} />
          {/* row 14: AV Hits */}
          <SeparatedList label={t('page.alerts.avhits')} list={item.al.av} />
          {/* row 15: IPs */}
          <SeparatedList label={t('page.alerts.ip')} list={item.al.ip} />
          {/* row 16: Domains */}
          <SeparatedList label={t('page.alerts.domain')} list={item.al.domain} />
          {/* row 17: Yara Hits */}
          <SeparatedList label={t('page.alerts.yara')} list={item.al.yara} />
        </Grid>
      </CardContent>
    </Card>
  );
};

const StatusChip = ({ label }) => {
  const theme = useTheme();
  const SChip = withStyles({
    root: {
      backgroundColor: theme.palette.error.dark,
      color: theme.palette.common.white
    }
  })(Chip);
  return <SChip label={label} size="small" />;
};

const DefaultChip = ({ label }) => {
  const theme = useTheme();
  const DChip = withStyles({
    root: {
      background: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText
    }
  })(Chip);
  return <DChip label={label} size="small" />;
};

const SeparatedList = ({ label, list, component = 'span' }) => {
  const classes = useStyles();
  if (!list) {
    return null;
  }
  return (
    <>
      <Grid item xs={4}>
        <Typography className={classes.typoLabel}>{label}</Typography>
      </Grid>
      <Grid item xs={8}>
        <Paper component="ul" className={classes.separatedList}>
          {list.map((t: string, i: number) => (
            <li key={`alert-list-${i}`}>
              {component === 'link' ? <Link href={t}>{t}</Link> : <Typography component="span">{t}</Typography>}
            </li>
          ))}
        </Paper>
      </Grid>
    </>
  );
};

export default AlertCard;
