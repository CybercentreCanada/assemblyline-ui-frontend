import { Box, Divider, Grid, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import useClipboard from 'commons/components/hooks/useClipboard';
import { ChipList } from 'components/elements/mui/chips';
import { AlertItem } from 'components/routes/alerts/useAlerts';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { format } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';
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
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const isLteSm = useMediaQuery(theme.breakpoints.down('sm'));
  const classes = useStyles();
  const { copy } = useClipboard();

  return (
    <Box>
      <Box mb={1}>
        <Classification c12n={item.classification} type="text" />
      </Box>
      {item.filtered ? (
        <Box mb={2}>
          <Alert severity="warning">{t('page.alerts.details.data_filtered_msg')}</Alert>
        </Box>
      ) : null}
      <Grid container spacing={2}>
        <Grid item xs={isLteSm ? 12 : 6}>
          {/* Labels Section */}
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('page.alerts.details.label')}</Typography>
            <Divider />
            <Box className={classes.sectionContent}>
              <ChipList items={item.label.map(label => ({ label, variant: 'outlined' }))} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={isLteSm ? 12 : 3}>
          {/* Priority Section. */}
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('page.alerts.details.priority')}</Typography>
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
            <Typography className={classes.sectionTitle}>{t('page.alerts.details.status')}</Typography>
            <Divider />
            <Box className={classes.sectionContent}>
              <CustomChip type="round" variant="outlined" label={item.status} size="small" />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/*  Reporting Date, Type and Owner */}
      <Grid container spacing={2}>
        {/* Reporting Tyupe Section */}
        <Grid item xs={isLteSm ? 12 : 6}>
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('page.alerts.details.reporting_date')}</Typography>
            <Divider />
            <Box className={classes.sectionContent}>
              {format(new Date(item.reporting_ts), 'yyyy-MM-dd HH:mm:ss.SSSSSS')}
            </Box>
          </Box>
        </Grid>
        {/* Type Section. */}
        <Grid item xs={isLteSm ? 12 : 3}>
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('page.alerts.details.type')}</Typography>
            <Divider />
            <Box className={classes.sectionContent}>{item.type}</Box>
          </Box>
        </Grid>
        {/* Owner Section. */}
        <Grid item xs={isLteSm ? 12 : 3}>
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('page.alerts.details.ownership')}</Typography>
            <Divider />
            <Box className={classes.sectionContent}>
              {item.owner ? item.owner : item.hint_owner ? 'assigned' : 'none'}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* File Info */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>{t('page.alerts.details.file_info')}</Typography>
        <Divider />
        <Box className={classes.sectionContent}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="caption">{t('page.alerts.details.file_type')}</Typography>&nbsp;
              <CustomChip label={item.file.type} variant="outlined" size="small" /> -
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

      {/* Metadata Section */}
      {item.metadata && Object.keys(item.metadata).length > 0 ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('page.alerts.details.metadata')}</Typography>
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
          <Typography className={classes.sectionTitle}>{t('page.alerts.details.attack')}</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <Grid container spacing={1}>
              <Grid item xs={isLteSm ? 12 : 4}>
                <Typography variant="caption" style={{ marginRight: theme.spacing(1) }}>
                  <i>{t('page.alerts.details.attack_type')}</i>
                </Typography>
                <CustomChip label={item.attack.category} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={isLteSm ? 12 : 8}>
                <Typography variant="caption" style={{ marginRight: theme.spacing(1) }}>
                  <i>{t('page.alerts.details.attack_pattern')}</i>
                </Typography>
                <Box display="inline-block">
                  <ChipList items={item.attack.pattern.map(label => ({ label, variant: 'outlined' }))} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      ) : null}

      {/* Heuristics Section */}
      {item.heuristic && item.heuristic.name && item.heuristic.name.length > 0 ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('page.alerts.details.heuristic')}</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.heuristic.name.map(label => ({ label, variant: 'outlined' }))} />
          </Box>
        </Box>
      ) : null}

      {/* AL Behaviours Section */}
      {item.al.behavior ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('page.alerts.details.behaviours')}</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.al.behavior.map(label => ({ label, variant: 'outlined' }))} />
          </Box>
        </Box>
      ) : null}

      {/* AL Attributions Section */}
      {item.al.attrib ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('page.alerts.details.attributions')}</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.al.attrib.map(label => ({ label, variant: 'outlined' }))} />
          </Box>
        </Box>
      ) : null}

      {/* AL AV Hits */}
      {item.al.av ? (
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('page.alerts.details.avhits')}</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.al.av.map(label => ({ label, variant: 'outlined' }))} />
          </Box>
        </Box>
      ) : null}

      {/* IPs sections */}
      <Box className={classes.section}>
        <Typography className={classes.sectionTitle}>{t('page.alerts.details.ip')}</Typography>
        <Divider />
        <Box className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={isLteSm ? 12 : 6}>
              <Grid container spacing={1}>
                <Grid item xs={isLteSm ? 12 : 4}>
                  <Typography variant="caption">
                    <i>{t('page.alerts.details.ip_dynamic')}</i>
                  </Typography>
                </Grid>
                <Grid item xs={isLteSm ? 12 : 8}>
                  {item.al.ip_dynamic.map((ip, i) => (
                    <div key={`alert-ipdynamic-${i}`}>{ip}</div>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={isLteSm ? 12 : 6}>
              <Grid container spacing={0}>
                <Grid item xs={isLteSm ? 12 : 4}>
                  <Typography variant="caption">
                    <i>{t('page.alerts.details.ip_static')}</i>
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
        <Typography className={classes.sectionTitle}>{t('page.alerts.details.domain')}</Typography>
        <Divider />
        <Box className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={isLteSm ? 12 : 6}>
              <Grid container spacing={1}>
                <Grid item xs={isLteSm ? 12 : 4}>
                  <Typography variant="caption">
                    <i>{t('page.alerts.details.domain_dynamic')}</i>
                  </Typography>
                </Grid>
                <Grid item xs={isLteSm ? 12 : 8}>
                  {item.al.domain_dynamic.map((d, i) => (
                    <div key={`alert-domain-${i}`}>{d}</div>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={isLteSm ? 12 : 6}>
              <Grid container spacing={0}>
                <Grid item xs={isLteSm ? 12 : 4}>
                  <Typography variant="caption">
                    <i>{t('page.alerts.details.domain_static')}</i>
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
          <Typography className={classes.sectionTitle}>{t('page.alerts.details.yara_hits')}</Typography>
          <Divider />
          <Box className={classes.sectionContent}>
            <ChipList items={item.al.yara.map(label => ({ label, variant: 'outlined' }))} />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default AlertDetails;
