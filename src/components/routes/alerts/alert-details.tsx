/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Divider, Grid, makeStyles, Typography, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Alert from '@material-ui/lab/Alert';
import useClipboard from 'commons/components/hooks/useClipboard';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import { ChipList, ChipSkeleton, ChipSkeletonInline } from 'components/elements/mui/chips';
import useMyAPI from 'components/hooks/useMyAPI';
import { AlertItem } from 'components/routes/alerts/hooks/useAlerts';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import AlertPriority from './alert-priority';

const useStyles = makeStyles(theme => ({
  section: {
    marginBottom: theme.spacing(2),
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
  id?: string;
};

const SkeletonInline = () => {
  return <Skeleton style={{ display: 'inline-block', width: '10rem' }} />;
};

const AlertDetails: React.FC<AlertDetailsProps> = ({ id }) => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const classes = useStyles();
  const apiCall = useMyAPI();
  const { copy } = useClipboard();
  const [item, setItem] = useState<AlertItem>(null);
  const { id: paramId } = useParams<{ id: string }>();

  useEffect(() => {
    const alertId = id || paramId;
    if (item !== null) setItem(null);
    apiCall({
      url: `/api/v4/alert/${alertId}/`,
      onSuccess: api_data => {
        setItem(api_data.api_response);
      }
    });
  }, [id, paramId]);

  return (
    <PageCenter margin={!id ? 4 : 0} mr={0} ml={0} mb={0} mt={0} width="100%">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing(2) }}>
        <div style={{ flex: 1 }}>
          <Classification c12n={item ? item.classification : null} type="outlined" />
        </div>
      </div>
      <div style={{ textAlign: 'left' }}>
        {item && item.filtered && (
          <Box mb={2}>
            <Alert severity="warning">{t('data_filtered_msg')}</Alert>
          </Box>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {/* Labels Section */}
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>{t('label')}</Typography>
              <Divider />
              <div className={classes.sectionContent}>
                <ChipList items={item ? item.label.map(label => ({ label, variant: 'outlined' })) : null} />
              </div>
            </div>
          </Grid>
          <Grid item xs={12} md={3}>
            {/* Priority Section. */}
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>{t('priority')}</Typography>
              <Divider />
              <div className={classes.sectionContent}>
                <Box display="flex">
                  {item ? <AlertPriority name={item ? item.priority : null} withText withChip /> : <ChipSkeleton />}
                </Box>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} md={3}>
            {/* Status Section */}
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>{t('status')}</Typography>
              <Divider />
              <div className={classes.sectionContent}>
                {item ? (
                  <CustomChip type="round" variant="outlined" label={item.status} size="small" />
                ) : (
                  <ChipSkeleton />
                )}
              </div>
            </div>
          </Grid>
        </Grid>

        {/*  Reporting Date, Type and Owner */}
        <Grid container spacing={2}>
          {/* Reporting Type Section */}
          <Grid item xs={12} md={6}>
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>{t('dates')}</Typography>
              <Divider />
              <div className={classes.sectionContent}>
                <Grid container>
                  <Grid item xs={4}>
                    {t('received_date')}
                  </Grid>
                  <Grid item xs={8}>
                    {item ? `${item.ts.replace('T', ' ').replace('Z', '')} (UTC)` : <Skeleton />}
                  </Grid>
                  <Grid item xs={4}>
                    {t('alerted_date')}
                  </Grid>
                  <Grid item xs={8}>
                    {item ? `${item.reporting_ts.replace('T', ' ').replace('Z', '')} (UTC)` : <Skeleton />}
                  </Grid>
                </Grid>
              </div>
            </div>
          </Grid>
          {/* Type Section. */}
          <Grid item xs={12} md={3}>
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>{t('type')}</Typography>
              <Divider />
              <div className={classes.sectionContent}>{item ? item.type : <Skeleton />}</div>
            </div>
          </Grid>
          {/* Owner Section. */}
          <Grid item xs={12} md={3}>
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>{t('ownership')}</Typography>
              <Divider />
              <div className={classes.sectionContent}>
                {/* TODO: don't display user when none. */}
                {item ? item.owner ? item.owner : item.hint_owner ? 'assigned' : null : <Skeleton />}
              </div>
            </div>
          </Grid>
        </Grid>

        {/* File Info */}
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('file_info')}</Typography>
          <Divider />
          <div className={classes.sectionContent}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <span>{item ? item.file.name : <SkeletonInline />}</span>
                <span style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1), wordBreak: 'break-all' }}>
                  {item ? (
                    <CustomChip label={item.file.type} variant="outlined" size="small" />
                  ) : (
                    <ChipSkeletonInline />
                  )}
                </span>
                <Typography variant="caption">
                  {item ? `${item.file.size} (${(item.file.size / 1024).toFixed(2)} Kb)` : <SkeletonInline />}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <div style={{ wordBreak: 'break-all' }}>
                  <BsClipboard className={classes.clipboardIcon} onClick={item ? () => copy(item.file.md5) : null} />
                  &nbsp;
                  <Typography variant="caption">
                    MD5:&nbsp;&nbsp;&nbsp;&nbsp;
                    {item ? item.file.md5 : <SkeletonInline />}
                  </Typography>
                </div>
                <div style={{ wordBreak: 'break-all' }}>
                  <BsClipboard className={classes.clipboardIcon} onClick={item ? () => copy(item.file.sha1) : null} />
                  &nbsp;
                  <Typography variant="caption">
                    SHA1:&nbsp;&nbsp;&nbsp;
                    {item ? item.file.sha1 : <SkeletonInline />}
                  </Typography>
                </div>
                <div style={{ wordBreak: 'break-all' }}>
                  <BsClipboard className={classes.clipboardIcon} onClick={item ? () => copy(item.file.sha256) : null} />
                  &nbsp;
                  <Typography variant="caption">
                    SHA256:&nbsp;
                    {item ? item.file.sha256 : <SkeletonInline />}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>

        {/* Metadata Section */}
        {!item || (item.metadata && Object.keys(item.metadata).length > 0) ? (
          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('metadata')}</Typography>
            <Divider />
            <div className={classes.sectionContent}>
              <pre style={{ margin: 0 }}>
                {item ? (
                  Object.keys(item.metadata).map(k => (
                    <span key={`alert-metadata-${k}`}>
                      {k}: {item.metadata[k]}
                      <br />
                    </span>
                  ))
                ) : (
                  <>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                  </>
                )}
              </pre>
            </div>
          </div>
        ) : null}

        {/* Attack Section */}
        {!item || item.attack.category ? (
          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('attack')}</Typography>
            <Divider />
            <div className={classes.sectionContent}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" style={{ marginRight: theme.spacing(1) }}>
                    <i>{t('attack_type')}</i>
                  </Typography>
                  {item ? (
                    <CustomChip label={item ? item.attack.category : null} variant="outlined" size="small" />
                  ) : (
                    <ChipSkeleton />
                  )}
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="caption" style={{ marginRight: theme.spacing(1) }}>
                    <i>{t('attack_pattern')}</i>
                  </Typography>
                  <Box display="inline-block" style={{ verticalAlign: 'middle' }}>
                    <ChipList
                      items={item ? item.attack.pattern.map(label => ({ label, variant: 'outlined' })) : null}
                    />
                  </Box>
                </Grid>
              </Grid>
            </div>
          </div>
        ) : null}

        {/* Heuristics Section */}
        {!item || (item.heuristic && item.heuristic.name && item.heuristic.name.length > 0) ? (
          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('heuristic')}</Typography>
            <Divider />
            <div className={classes.sectionContent}>
              <ChipList items={item ? item.heuristic.name.map(label => ({ label, variant: 'outlined' })) : null} />
            </div>
          </div>
        ) : null}

        {/* AL Behaviours Section */}
        {!item || item.al.behavior ? (
          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('behaviors')}</Typography>
            <Divider />
            <div className={classes.sectionContent}>
              <ChipList items={item ? item.al.behavior.map(label => ({ label, variant: 'outlined' })) : null} />
            </div>
          </div>
        ) : null}

        {/* AL Attributions Section */}
        {!item || item.al.attrib ? (
          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('attributions')}</Typography>
            <Divider />
            <div className={classes.sectionContent}>
              <ChipList items={item ? item.al.attrib.map(label => ({ label, variant: 'outlined' })) : null} />
            </div>
          </div>
        ) : null}

        {/* AL AV Hits */}
        {!item || item.al.av ? (
          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('avhits')}</Typography>
            <Divider />
            <div className={classes.sectionContent}>
              <ChipList items={item ? item.al.av.map(label => ({ label, variant: 'outlined' })) : null} />
            </div>
          </div>
        ) : null}

        {/* IPs sections */}
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('ip')}</Typography>
          <Divider />
          <div className={classes.sectionContent}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption">
                      <i>{t('ip_dynamic')}</i>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    {item ? (
                      item.al.ip_dynamic.map((ip, i) => <div key={`alert-ipdynamic-${i}`}>{ip}</div>)
                    ) : (
                      <>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={0}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption">
                      <i>{t('ip_static')}</i>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    {item ? (
                      item.al.ip_static.map((ip, i) => <div key={`alert-ipdynamic-${i}`}>{ip}</div>)
                    ) : (
                      <>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </div>

        {/* Domains sections */}
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('domain')}</Typography>
          <Divider />
          <div className={classes.sectionContent}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption">
                      <i>{t('domain_dynamic')}</i>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    {item ? (
                      item.al.domain_dynamic.map((d, i) => <div key={`alert-domain-${i}`}>{d}</div>)
                    ) : (
                      <>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={0}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption">
                      <i>{t('domain_static')}</i>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    {item ? (
                      item.al.domain_static.map((d, i) => <div key={`alert-domain-${i}`}>{d}</div>)
                    ) : (
                      <>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </div>

        {/* YARA Hits */}
        {!item || item.al.yara ? (
          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>{t('yara')}</Typography>
            <Divider />
            <div className={classes.sectionContent}>
              <ChipList items={item ? item.al.yara.map(label => ({ label, variant: 'outlined' })) : null} />
            </div>
          </div>
        ) : null}
      </div>
    </PageCenter>
  );
};

export default AlertDetails;
