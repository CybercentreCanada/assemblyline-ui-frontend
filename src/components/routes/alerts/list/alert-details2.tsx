import { Box, Chip, Divider, Grid, makeStyles, Typography, useTheme, withStyles } from '@material-ui/core';
import React from 'react';
import { AlertItem } from '../alerts';

const useStyles = makeStyles(theme => ({
  section: {
    margin: theme.spacing(1),
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
    backgroundColor: theme.palette.background.default,
    margin: 0,
    '& li ': {
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5)
    }
  }
}));

type AlertDetailsProps = {
  item: AlertItem;
};

const AlertDetails: React.FC<AlertDetailsProps> = ({ item }) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <Box>
      {/* Labels Section */}
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

      {/* Priority Section */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>Priority</Typography>
        <Divider />
        <DefaultChip label={item.priority} />
      </Box>

      {/* Status Section */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>Status</Typography>
        <Divider />
        <DefaultChip label={item.status} />
      </Box>

      {/* File Info */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>File Info</Typography>
        <Divider />
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <DefaultChip label={item.file.type} />
            &nbsp;{item.file.name}&nbsp;
            <Typography variant="caption">
              {item.file.size}({(item.file.size / 1024).toFixed(2)} Kb)
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <pre style={{ margin: 0 }}>
              MD5:&nbsp;&nbsp;&nbsp;&nbsp;{item.file.md5}
              <br />
              SHA1:&nbsp;&nbsp;&nbsp;{item.file.sha1}
              <br />
              SHA256:&nbsp;{item.file.sha256}
            </pre>
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
            <Grid item xs={4}>
              <Typography variant="caption" style={{ marginRight: theme.spacing(1) }}>
                <i>Type</i>
              </Typography>
              <DefaultChip label={item.attack.category} />
            </Grid>
            <Grid item xs={8}>
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

      {/* IPs sections */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>IPs</Typography>
        <Divider />
        <Grid container spacing={3}>
          <Grid item xs={4}>
            {item.al.ip.map(i => (
              <div>{i}</div>
            ))}
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="caption">
                  <i>Dynamic</i>
                </Typography>
              </Grid>
              <Grid item xs={8}>
                {item.al.ip_dynamic.map(i => (
                  <div>{i}</div>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={0}>
              <Grid item xs={4}>
                <Typography variant="caption">
                  <i>Static</i>
                </Typography>
              </Grid>
              <Grid item xs={8}>
                {item.al.ip_static.map(i => (
                  <div>{i}</div>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

const DefaultChip = ({ label }) => {
  const DChip = withStyles({})(Chip);
  return <DChip label={label} size="small" />;
};

export default AlertDetails;
