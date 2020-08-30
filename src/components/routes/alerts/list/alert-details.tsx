import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles
} from '@material-ui/core';
import useClipboard from 'components/hooks/useClipboard';
import { AlertItem } from 'components/routes/alerts/alerts';
import React from 'react';
import { BsClipboard } from 'react-icons/bs';
import AlertPriority from './alert-priority';

const useStyles = makeStyles(theme => ({
  section: {
    // margin: theme.spacing(1),
    marginBottom: theme.spacing(3),
    '& > hr': {
      marginBottom: theme.spacing(1)
    }
  },
  sectionTitle: {
    fontWeight: 'bold'
  },
  labels: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    marginLeft: -theme.spacing(0.5),
    padding: 0,
    boxShadow: 'inherit',
    margin: 0,
    '& li ': {
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5)
    }
  },
  clipboardIcon: {
    '&:hover': {
      cursor: 'pointer',
      transform: 'scale(1.1)'
    }
  }
}));

type AlertDetailsProps = {
  item: AlertItem;
};

const AlertDetails: React.FC<AlertDetailsProps> = ({ item }) => {
  const theme = useTheme();
  const isLteSm = useMediaQuery(theme.breakpoints.down('sm'));
  const classes = useStyles();
  const { copy } = useClipboard();

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={isLteSm ? 12 : 6}>
          {/* Labels Section. */}
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>Labels</Typography>
            <Divider />
            <ul className={classes.labels}>
              {item.label.map((label, i) => (
                <li key={`alert-label-${i}`}>
                  <DefaultChip label={label} />
                </li>
              ))}
            </ul>
          </Box>
        </Grid>
        <Grid item xs={isLteSm ? 12 : 3}>
          {/* Priority Section. */}
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>Priority</Typography>
            <Divider />
            <Box display="flex">
              <AlertPriority name={item.priority} withText withChip />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={isLteSm ? 12 : 3}>
          {/* Status Section */}
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>Status</Typography>
            <Divider />
            <DefaultChip label={item.status} />
          </Box>
        </Grid>
      </Grid>

      {/* File Info */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>File Info</Typography>
        <Divider />
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="caption">Type</Typography>&nbsp;
            <DefaultChip label={item.file.type} /> -
            <Box component="span" ml={1} mr={1}>
              {item.file.name}
            </Box>
            <Typography variant="caption">
              {item.file.size}({(item.file.size / 1024).toFixed(2)} Kb)
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex">
              <BsClipboard className={classes.clipboardIcon} onClick={() => copy(item.file.md5)} />
              &nbsp;
              <pre style={{ margin: 0 }}>MD5:&nbsp;&nbsp;&nbsp;&nbsp;{item.file.md5}</pre>
            </Box>
            <Box display="flex">
              <BsClipboard className={classes.clipboardIcon} onClick={() => copy(item.file.sha1)} />
              &nbsp;
              <pre style={{ margin: 0 }}>SHA1:&nbsp;&nbsp;&nbsp;{item.file.sha1}</pre>
            </Box>
            <Box display="flex">
              <BsClipboard className={classes.clipboardIcon} onClick={() => copy(item.file.sha256)} />
              &nbsp;
              <pre style={{ margin: 0 }}>SHA256:&nbsp;{item.file.sha256}</pre>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Ownership Section */}
      {item.owner ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Ownership</Typography>
          <Divider />
          <DefaultChip label={item.owner} />
        </Box>
      ) : null}

      {/* Metadata Section */}
      {item.metadata && Object.keys(item.metadata).length > 0 ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Metadata</Typography>
          <Divider />
          <pre style={{ margin: 0 }}>
            {Object.keys(item.metadata).map(k => (
              <span>
                {k}: {item.metadata[k]}
                <br />
              </span>
            ))}
          </pre>
        </Box>
      ) : null}

      {/* Attack Section */}
      {item.attack.category ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Attack</Typography>
          <Divider />
          <Grid container spacing={1}>
            <Grid item xs={isLteSm ? 12 : 4}>
              <Typography variant="caption" style={{ marginRight: theme.spacing(1) }}>
                <i>Type</i>
              </Typography>
              <DefaultChip label={item.attack.category} />
            </Grid>
            <Grid item xs={isLteSm ? 12 : 8}>
              <Typography variant="caption" style={{ marginRight: theme.spacing(1) }}>
                <i>Patterns</i>
              </Typography>
              <Box display="inline-block">
                <ul className={classes.labels}>
                  {item.attack.pattern.map(p => (
                    <li>
                      <DefaultChip label={p} />
                    </li>
                  ))}
                </ul>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ) : null}

      {/* Heuristics Section */}
      {item.heuristic && item.heuristic.name && item.heuristic.name.length > 0 ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Heuristics</Typography>
          <Divider />
          <ul className={classes.labels}>
            {item.heuristic.name.map(n => (
              <li>
                <Button size="small" variant="outlined">
                  {n}
                </Button>
              </li>
            ))}
          </ul>
        </Box>
      ) : null}

      {/* AL Behaviours Section */}
      {item.al.behavior ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Behaviours</Typography>
          <Divider />
          <ul className={classes.labels}>
            {item.al.behavior.map(b => (
              <li>
                <DefaultChip label={b} />
              </li>
            ))}
          </ul>
        </Box>
      ) : null}

      {/* AL Attributions Section */}
      {item.al.attrib ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Attributions</Typography>
          <Divider />
          <ul className={classes.labels}>
            {item.al.attrib.map(a => (
              <li>
                <DefaultChip label={a} />
              </li>
            ))}
          </ul>
        </Box>
      ) : null}

      {/* AL AV Hits */}
      {item.al.av ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>AV Hits</Typography>
          <Divider />
          <ul className={classes.labels}>
            {item.al.av.map(a => (
              <li>
                <DefaultChip label={a} />
              </li>
            ))}
          </ul>
        </Box>
      ) : null}

      {/* IPs sections */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>IPs</Typography>
        <Divider />
        <Grid container spacing={3}>
          <Grid item xs={isLteSm ? 12 : 4}>
            {item.al.ip.map(i => (
              <div>{i}</div>
            ))}
          </Grid>
          <Grid item xs={isLteSm ? 12 : 4}>
            <Grid container spacing={1}>
              <Grid item xs={isLteSm ? 12 : 4}>
                <Typography variant="caption">
                  <i>Dynamic</i>
                </Typography>
              </Grid>
              <Grid item xs={isLteSm ? 12 : 8}>
                {item.al.ip_dynamic.map(i => (
                  <div>{i}</div>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={isLteSm ? 12 : 4}>
            <Grid container spacing={0}>
              <Grid item xs={isLteSm ? 12 : 4}>
                <Typography variant="caption">
                  <i>Static</i>
                </Typography>
              </Grid>
              <Grid item xs={isLteSm ? 12 : 8}>
                {item.al.ip_static.map(i => (
                  <div>{i}</div>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Domains sections */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>Domains</Typography>
        <Divider />
        <Grid container spacing={3}>
          <Grid item xs={isLteSm ? 12 : 4}>
            {item.al.domain.map(i => (
              <div>{i}</div>
            ))}
          </Grid>
          <Grid item xs={isLteSm ? 12 : 4}>
            <Grid container spacing={1}>
              <Grid item xs={isLteSm ? 12 : 4}>
                <Typography variant="caption">
                  <i>Dynamic</i>
                </Typography>
              </Grid>
              <Grid item xs={isLteSm ? 12 : 8}>
                {item.al.domain_dynamic.map(i => (
                  <div>{i}</div>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={isLteSm ? 12 : 4}>
            <Grid container spacing={0}>
              <Grid item xs={isLteSm ? 12 : 4}>
                <Typography variant="caption">
                  <i>Static</i>
                </Typography>
              </Grid>
              <Grid item xs={isLteSm ? 12 : 8}>
                {item.al.domain_static.map(i => (
                  <div>{i}</div>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* YARA Hits */}
      {item.al.yara ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Yara Hits</Typography>
          <Divider />
          <ul className={classes.labels}>
            {item.al.yara.map(a => (
              <li>
                <DefaultChip label={a} />
              </li>
            ))}
          </ul>
        </Box>
      ) : null}
    </Box>
  );
};

const DefaultChip = ({ label }) => {
  const DChip = withStyles({})(Chip);
  return <DChip label={label} size="small" />;
};

export default AlertDetails;
