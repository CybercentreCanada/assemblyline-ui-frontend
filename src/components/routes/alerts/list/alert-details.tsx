import {
  Box,
  Chip,
  Divider,
  Grid,
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles
} from '@material-ui/core';
import useClipboard from 'commons/components/hooks/useClipboard';
import { AlertItem } from 'components/routes/alerts/alerts';
import React from 'react';
import { BsClipboard } from 'react-icons/bs';
import { ChipList } from '../panels/chips';
import AlertPriority from './alert-priority';

const useStyles = makeStyles(theme => ({
  section: {
    marginBottom: theme.spacing(3),
    '& > hr': {
      marginBottom: theme.spacing(1)
    }
  },
  sectionTitle: {
    fontWeight: 'bold'
  },
  sectionContent: {},
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
          {/* Labels Section */}
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>Labels</Typography>
            <Divider />
            <Box className={classes.sectionContent}>
              <ChipList items={item.label.map(label => ({ label }))} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={isLteSm ? 12 : 3}>
          {/* Priority Section. */}
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>Priority</Typography>
            <Divider />
            <Box className={classes.sectionContent}>
              <Box display="flex">
                <AlertPriority name={item.priority} withText withChip />
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={isLteSm ? 12 : 3}>
          {/* Status Section */}
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>Status</Typography>
            <Divider />
            <Box className={classes.sectionContent}>
              <DefaultChip label={item.status} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* File Info */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>File Info</Typography>
        <Divider />
        <Box className={classes.sectionContent}>
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
      </Box>

      {/* Ownership Section */}
      {item.owner ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Ownership</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <DefaultChip label={item.owner} />
          </Box>
        </Box>
      ) : null}

      {/* Metadata Section */}
      {item.metadata && Object.keys(item.metadata).length > 0 ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Metadata</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <pre style={{ margin: 0 }}>
              {Object.keys(item.metadata).map(k => (
                <span key={`alert-metadata-${k}`}>
                  {k}: {item.metadata[k]}
                  <br />
                </span>
              ))}
            </pre>
          </Box>
        </Box>
      ) : null}

      {/* Attack Section */}
      {item.attack.category ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Attack</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
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
                  <ChipList items={item.attack.pattern.map(label => ({ label }))} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      ) : null}

      {/* Heuristics Section */}
      {item.heuristic && item.heuristic.name && item.heuristic.name.length > 0 ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Heuristics</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.heuristic.name.map(label => ({ label }))} />
          </Box>
        </Box>
      ) : null}

      {/* AL Behaviours Section */}
      {item.al.behavior ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Behaviours</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.al.behavior.map(label => ({ label }))} />
          </Box>
        </Box>
      ) : null}

      {/* AL Attributions Section */}
      {item.al.attrib ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Attributions</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.al.attrib.map(label => ({ label }))} />
          </Box>
        </Box>
      ) : null}

      {/* AL AV Hits */}
      {item.al.av ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>AV Hits</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.al.av.map(label => ({ label }))} />
          </Box>
        </Box>
      ) : null}

      {/* IPs sections */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>IPs</Typography>
        <Divider />
        <Box className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={isLteSm ? 12 : 4}>
              {item.al.ip.map((ip, i) => (
                <div key={`alert-ip-${i}`}>{ip}</div>
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
                  {item.al.ip_dynamic.map((ip, i) => (
                    <div key={`alert-ipdynamic-${i}`}>{ip}</div>
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
                  {item.al.ip_static.map((ip, i) => (
                    <div key={`alert-ipdynamic-${i}`}>{ip}</div>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Domains sections */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>Domains</Typography>
        <Divider />
        <Box className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={isLteSm ? 12 : 4}>
              {item.al.domain.map((d, i) => (
                <div key={`alert-domain-${i}`}>{d}</div>
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
                  {item.al.domain_dynamic.map((d, i) => (
                    <div key={`alert-domain-${i}`}>{d}</div>
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
                  {item.al.domain_static.map((d, i) => (
                    <div key={`alert-domain-${i}`}>{d}</div>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* YARA Hits */}
      {item.al.yara ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>Yara Hits</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.al.yara.map(label => ({ label }))} />
          </Box>
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
