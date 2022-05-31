/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Collapse,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import AmpStoriesOutlinedIcon from '@material-ui/icons/AmpStoriesOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';
import { Skeleton } from '@material-ui/lab';
import Alert from '@material-ui/lab/Alert';
import useClipboard from 'commons/components/hooks/useClipboard';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { AlertItem, DetailedItem } from 'components/routes/alerts/hooks/useAlerts';
import { ChipList, ChipSkeleton, ChipSkeletonInline } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import Verdict from 'components/visual/Verdict';
import VerdictBar from 'components/visual/VerdictBar';
import { verdictToColor } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';
import { Link, useParams } from 'react-router-dom';
import AlertExtendedScan from './alert-extended_scan';
import AlertPriority from './alert-priority';
import AlertStatus from './alert-status';

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
  alert?: AlertItem;
};

type AutoHideChipListProps = {
  items: DetailedItem[];
};

const SkeletonInline = () => <Skeleton style={{ display: 'inline-block', width: '10rem' }} />;

const WrappedAutoHideChipList: React.FC<AutoHideChipListProps> = ({ items }) => {
  const { t } = useTranslation('alerts');
  const [show, setShow] = useState<boolean>(
    !items.some(item => item.verdict === 'malicious' || item.verdict === 'suspicious')
  );
  return (
    <>
      <ChipList
        items={items
          .filter(item => item.verdict === 'malicious')
          .map(item => ({
            label: item.value,
            variant: 'outlined',
            color: verdictToColor(item.verdict)
          }))}
      />
      <ChipList
        items={items
          .filter(item => item.verdict === 'suspicious')
          .map(item => ({
            label: item.value,
            variant: 'outlined',
            color: verdictToColor(item.verdict)
          }))}
      />
      {show ? (
        <ChipList
          items={items
            .filter(item => item.verdict === 'info')
            .map(item => ({
              label: item.value,
              variant: 'outlined',
              color: verdictToColor(item.verdict)
            }))}
        />
      ) : (
        <Tooltip title={t('more')}>
          <IconButton size="small" onClick={() => setShow(true)} style={{ padding: 0 }}>
            <MoreHorizOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

const AutoHideChipList = React.memo(WrappedAutoHideChipList);

const WrappedAlertDetails: React.FC<AlertDetailsProps> = ({ id, alert }) => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { c12nDef } = useALContext();
  const { copy } = useClipboard();
  const [item, setItem] = useState<AlertItem>(null);
  const { id: paramId } = useParams<{ id: string }>();
  const { configuration } = useALContext();
  const [metaOpen, setMetaOpen] = React.useState(false);

  useEffect(() => {
    const alertId = id || paramId;
    if (alertId) {
      apiCall({
        url: `/api/v4/alert/${alertId}/`,
        onSuccess: api_data => {
          setItem(api_data.api_response);
        }
      });
    }
  }, [id, paramId]);

  useEffect(() => {
    if (alert) setItem(alert);
  }, [alert]);

  useEffect(() => {
    function handleAlertUpdate(event: CustomEvent) {
      const { detail } = event;
      if (detail.id === item.id) {
        setItem({ ...item, ...detail.changes });
      }
    }
    window.addEventListener('alertUpdate', handleAlertUpdate);
    return () => {
      window.removeEventListener('alertUpdate', handleAlertUpdate);
    };
  }, [item]);

  return (
    <PageFullWidth margin={!alert ? 4 : 1}>
      {c12nDef.enforce && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing(2) }}>
          <div style={{ flex: 1 }}>
            <Classification c12n={item ? item.classification : null} type="outlined" />
          </div>
        </div>
      )}
      {!alert && (
        <div style={{ paddingBottom: theme.spacing(3), textAlign: 'left' }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{t('detail.title')}</Typography>
            </Grid>
            <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
              {item ? (
                <Tooltip title={t('submission')}>
                  <IconButton
                    component={Link}
                    style={{ color: theme.palette.action.active }}
                    to={`/submission/${item.sid}`}
                  >
                    <AmpStoriesOutlinedIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Skeleton variant="circle" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
              )}
            </Grid>
          </Grid>
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        {item && item.filtered && (
          <div style={{ marginBottom: theme.spacing(3) }}>
            <Alert severity="warning">{t('data_filtered_msg')}</Alert>
          </div>
        )}
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            {/* Alert Information Section */}
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>{t('alert_info')}</Typography>
              <Divider />
              <div className={classes.sectionContent}>
                <Grid container alignItems="center">
                  {/* Alert ID */}
                  <Grid item xs={3} sm={2} md={4}>
                    {t('alert_id')}
                  </Grid>
                  <Grid item xs={9} sm={10} md={8}>
                    {item ? item.alert_id : <Skeleton />}
                  </Grid>
                  {/* Alert Type */}
                  <Grid item xs={3} sm={2} md={4}>
                    {t('type')}
                  </Grid>
                  <Grid item xs={9} sm={10} md={8}>
                    {item ? item.type : <Skeleton />}
                  </Grid>
                  {/* Submission received date */}
                  <Grid item xs={3} sm={2} md={4}>
                    {t('received_date')}
                  </Grid>
                  <Grid item xs={9} sm={10} md={8}>
                    {item ? `${item.ts.replace('T', ' ').replace('Z', '')} (UTC)` : <Skeleton />}
                  </Grid>
                  {/* Alerted date */}
                  <Grid item xs={3} sm={2} md={4}>
                    {t('alerted_date')}
                  </Grid>
                  <Grid item xs={9} sm={10} md={8}>
                    {item ? `${item.reporting_ts.replace('T', ' ').replace('Z', '')} (UTC)` : <Skeleton />}
                  </Grid>
                  {/* Alert owner */}
                  <Grid item xs={3} sm={2} md={4}>
                    {t('ownership')}
                  </Grid>
                  <Grid item xs={9} sm={10} md={8}>
                    {item ? (
                      item.owner ? (
                        item.owner
                      ) : (
                        <div style={{ color: theme.palette.text.disabled }}>
                          {item.hint_owner ? t('hint_owner_detail') : t('owned_none')}
                        </div>
                      )
                    ) : (
                      <Skeleton />
                    )}
                  </Grid>
                  {/* Alert Extended scan status */}
                  <Grid item xs={3} sm={2} md={4}>
                    {t('extended')}
                  </Grid>
                  <Grid item xs={9} sm={10} md={8} style={{ marginTop: theme.spacing(0.5) }}>
                    {item ? <AlertExtendedScan name={item.extended_scan} withChip /> : <Skeleton />}
                  </Grid>
                  {/* Alert Priority */}
                  <Grid item xs={3} sm={2} md={4}>
                    {t('priority')}
                  </Grid>
                  <Grid item xs={9} sm={10} md={8} style={{ marginTop: theme.spacing(0.5) }}>
                    {item ? <AlertPriority name={item ? item.priority : null} withChip /> : <ChipSkeleton />}
                  </Grid>
                  {/* Alert Status */}
                  <Grid item xs={3} sm={2} md={4}>
                    {t('status')}
                  </Grid>
                  <Grid item xs={9} sm={10} md={8} style={{ marginTop: theme.spacing(0.5) }}>
                    {item ? (
                      item.status ? (
                        <AlertStatus name={item.status} />
                      ) : (
                        <CustomChip size="small" variant="outlined" label={t(`status_unset`)} disabled />
                      )
                    ) : (
                      <ChipSkeleton />
                    )}
                  </Grid>
                </Grid>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <div>
              {/* Score Section. */}
              <div className={classes.section}>
                <Typography className={classes.sectionTitle}>{t('verdict')}</Typography>
                <Divider />
                <div className={classes.sectionContent}>
                  <Grid container>
                    <Grid item xs={3} sm={2} md={4}>
                      {t('score')}
                    </Grid>
                    <Grid item xs={9} sm={10} md={8}>
                      {item ? <Verdict size="tiny" score={item.al.score} fullWidth /> : <Skeleton />}
                    </Grid>
                    <Grid item xs={3} sm={2} md={4}>
                      <div style={{ marginTop: theme.spacing(0.5) }}>{t('user_verdict')}</div>
                    </Grid>
                    <Grid item xs={9} sm={10} md={8}>
                      {item ? (
                        <div style={{ marginTop: theme.spacing(0.5), marginBottom: theme.spacing(0.5) }}>
                          <VerdictBar verdicts={item.verdict} />
                        </div>
                      ) : (
                        <>
                          <Skeleton />
                          <Skeleton />
                        </>
                      )}
                    </Grid>
                  </Grid>
                </div>
              </div>
              {/* Labels Section */}
              <div className={classes.section}>
                <Typography className={classes.sectionTitle}>{t('label')}</Typography>
                <Divider />
                <div className={classes.sectionContent}>
                  <ChipList items={item ? item.label.map(label => ({ label, variant: 'outlined' })) : null} />
                </div>
              </div>
            </div>
          </Grid>
        </Grid>

        {/* File Info */}
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('file_info')}</Typography>
          <Divider />
          <div className={classes.sectionContent}>
            <Grid container>
              <Grid item xs={12} style={{ marginBottom: theme.spacing(1) }}>
                <span>{item ? item.file.name : <SkeletonInline />}</span>
                <span style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1), wordBreak: 'break-word' }}>
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
              <Grid item xs={3} sm={2}>
                <BsClipboard
                  className={classes.clipboardIcon}
                  onClick={item ? () => copy(item.file.md5, 'drawerTop') : null}
                />
                <Typography variant="caption" style={{ marginLeft: theme.spacing(0.5) }}>
                  MD5:
                </Typography>
              </Grid>
              <Grid item xs={9} sm={10} style={{ wordBreak: 'break-word' }}>
                {item ? item.file.md5 : <SkeletonInline />}
              </Grid>
              <Grid item xs={3} sm={2}>
                <BsClipboard
                  className={classes.clipboardIcon}
                  onClick={item ? () => copy(item.file.sha1, 'drawerTop') : null}
                />
                <Typography variant="caption" style={{ marginLeft: theme.spacing(0.5) }}>
                  SHA1:
                </Typography>
              </Grid>
              <Grid item xs={9} sm={10} style={{ wordBreak: 'break-word' }}>
                {item ? item.file.sha1 : <SkeletonInline />}
              </Grid>
              <Grid item xs={3} sm={2}>
                <BsClipboard
                  className={classes.clipboardIcon}
                  onClick={item ? () => copy(item.file.sha256, 'drawerTop') : null}
                />
                <Typography variant="caption" style={{ marginLeft: theme.spacing(0.5) }}>
                  SHA256:
                </Typography>
              </Grid>
              <Grid item xs={9} sm={10} style={{ wordBreak: 'break-word' }}>
                {item ? item.file.sha256 : <SkeletonInline />}
              </Grid>
            </Grid>
          </div>
        </div>

        {/* Metadata Section */}
        {!item || (item.metadata && Object.keys(item.metadata).length > 0) ? (
          <div className={classes.section}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between'
              }}
            >
              <Typography className={classes.sectionTitle}>{t('metadata')}</Typography>
              {item &&
                Object.keys(item.metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1)
                  .length !== 0 && (
                  <Button
                    size="small"
                    onClick={() => setMetaOpen(!metaOpen)}
                    style={{ color: theme.palette.text.secondary }}
                  >
                    {!metaOpen ? (
                      <>
                        {t('more')}
                        <KeyboardArrowDownIcon style={{ marginLeft: theme.spacing(1) }} />
                      </>
                    ) : (
                      <>
                        {t('less')}
                        <KeyboardArrowUpIcon style={{ marginLeft: theme.spacing(1) }} />
                      </>
                    )}
                  </Button>
                )}
            </div>
            <Divider />
            <div className={classes.sectionContent}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {item ? (
                  Object.keys(item.metadata)
                    .filter(k => configuration.ui.alerting_meta.important.indexOf(k) !== -1)
                    .map(k => (
                      <Grid container spacing={1} key={`alert-metadata-${k}`}>
                        <Grid
                          item
                          xs={3}
                          sm={2}
                          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {k}
                        </Grid>
                        <Grid item xs={9} sm={10}>
                          {item.metadata[k]}
                        </Grid>
                      </Grid>
                    ))
                ) : (
                  <>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                  </>
                )}
                {item &&
                  Object.keys(item.metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1)
                    .length !== 0 && (
                    <Collapse in={metaOpen} timeout="auto" style={{ marginTop: theme.spacing(0.5) }}>
                      {item ? (
                        Object.keys(item.metadata)
                          .filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1)
                          .map(k => (
                            <Grid container spacing={1} key={`alert-metadata-${k}`}>
                              <Grid
                                item
                                xs={3}
                                sm={2}
                                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                              >
                                {k}
                              </Grid>
                              <Grid item xs={9} sm={10}>
                                {item.metadata[k]}
                              </Grid>
                            </Grid>
                          ))
                      ) : (
                        <>
                          <Skeleton />
                          <Skeleton />
                          <Skeleton />
                        </>
                      )}
                    </Collapse>
                  )}
              </pre>
            </div>
          </div>
        ) : null}

        {!item ||
          ((item.al.attrib.length !== 0 ||
            item.al.av.length !== 0 ||
            item.al.ip.length !== 0 ||
            item.al.domain.length !== 0 ||
            item.attack.category.length !== 0 ||
            (item.heuristic && item.heuristic.name && item.heuristic.name.length !== 0) ||
            item.al.behavior.length !== 0 ||
            item.al.yara.length !== 0) && (
            <>
              <Typography className={classes.sectionTitle}>{t('al_results')}</Typography>
              <Divider />
              <Grid container spacing={1} style={{ marginTop: theme.spacing(1) }}>
                {/* AL Attributions Section */}
                {!item || item.al.attrib.length !== 0 ? (
                  <>
                    <Grid item xs={3} sm={2}>
                      {t('attributions')}
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <div className={classes.sectionContent}>
                        {item && item.al.detailed ? (
                          <AutoHideChipList items={item.al.detailed.attrib} />
                        ) : (
                          <ChipList
                            items={item ? item.al.attrib.map(label => ({ label, variant: 'outlined' })) : null}
                          />
                        )}
                      </div>
                    </Grid>
                  </>
                ) : null}

                {/* AL AV Hits */}
                {!item || item.al.av.length !== 0 ? (
                  <>
                    <Grid item xs={3} sm={2}>
                      {t('avhits')}
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <div className={classes.sectionContent}>
                        {item && item.al.detailed ? (
                          <AutoHideChipList items={item.al.detailed.av} />
                        ) : (
                          <ChipList items={item ? item.al.av.map(label => ({ label, variant: 'outlined' })) : null} />
                        )}
                      </div>
                    </Grid>
                  </>
                ) : null}

                {/* IPs sections */}
                {!item || item.al.ip.length !== 0 ? (
                  <>
                    <Grid item xs={3} sm={2}>
                      {t('ip')}
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <div className={classes.sectionContent}>
                        <Grid container spacing={1}>
                          {!item ||
                            (item.al.ip_dynamic.length !== 0 && (
                              <Grid item xs={12} md={!item || item.al.ip_static.length !== 0 ? 6 : 12}>
                                <Typography variant="caption" component={'div'}>
                                  <i>{t('ip_dynamic')}</i>
                                </Typography>
                                {item && item.al.detailed ? (
                                  <AutoHideChipList
                                    items={item.al.detailed.ip.filter(ip => ip.type === 'network.dynamic.ip')}
                                  />
                                ) : (
                                  <ChipList
                                    items={
                                      item
                                        ? item.al.ip_dynamic.map(label => ({
                                            label,
                                            variant: 'outlined'
                                          }))
                                        : null
                                    }
                                  />
                                )}
                              </Grid>
                            ))}
                          {!item ||
                            (item.al.ip_static.length !== 0 && (
                              <Grid item xs={12} md={!item || item.al.ip_dynamic.length !== 0 ? 6 : 12}>
                                <Typography variant="caption" component={'div'}>
                                  <i>{t('ip_static')}</i>
                                </Typography>
                                {item && item.al.detailed ? (
                                  <AutoHideChipList
                                    items={item.al.detailed.ip.filter(ip => ip.type === 'network.static.ip')}
                                  />
                                ) : (
                                  <ChipList
                                    items={
                                      item
                                        ? item.al.ip_static.map(label => ({
                                            label,
                                            variant: 'outlined'
                                          }))
                                        : null
                                    }
                                  />
                                )}
                              </Grid>
                            ))}
                        </Grid>
                      </div>
                    </Grid>
                  </>
                ) : null}

                {/* Domains sections */}
                {!item || item.al.domain.length !== 0 ? (
                  <>
                    <Grid item xs={3} sm={2}>
                      {t('domain')}
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <div className={classes.sectionContent}>
                        <Grid container spacing={1}>
                          {!item ||
                            (item.al.domain_dynamic.length !== 0 && (
                              <Grid item xs={12} md={!item || item.al.domain_static.length !== 0 ? 6 : 12}>
                                <Typography variant="caption" component={'div'}>
                                  <i>{t('domain_dynamic')}</i>
                                </Typography>
                                {item && item.al.detailed ? (
                                  <AutoHideChipList
                                    items={item.al.detailed.domain.filter(
                                      domain => domain.type === 'network.dynamic.domain'
                                    )}
                                  />
                                ) : (
                                  <ChipList
                                    items={
                                      item
                                        ? item.al.domain_dynamic.map(label => ({
                                            label,
                                            variant: 'outlined'
                                          }))
                                        : null
                                    }
                                  />
                                )}
                              </Grid>
                            ))}
                          {!item ||
                            (item.al.domain_static.length !== 0 && (
                              <Grid item xs={12} md={!item || item.al.domain_dynamic.length !== 0 ? 6 : 12}>
                                <Typography variant="caption" component={'div'}>
                                  <i>{t('domain_static')}</i>
                                </Typography>
                                {item && item.al.detailed ? (
                                  <AutoHideChipList
                                    items={item.al.detailed.domain.filter(
                                      domain => domain.type === 'network.static.domain'
                                    )}
                                  />
                                ) : (
                                  <ChipList
                                    items={
                                      item
                                        ? item.al.domain_static.map(label => ({
                                            label,
                                            variant: 'outlined'
                                          }))
                                        : null
                                    }
                                  />
                                )}
                              </Grid>
                            ))}
                        </Grid>
                      </div>
                    </Grid>
                  </>
                ) : null}

                {/* url sections */}
                {!item || item.al.url.length !== 0 ? (
                  <>
                    <Grid item xs={3} sm={2}>
                      {t('url')}
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <div className={classes.sectionContent}>
                        <Grid container spacing={1}>
                          {!item ||
                            (item.al.url_dynamic.length !== 0 && (
                              <Grid item xs={12} md={!item || item.al.url_static.length !== 0 ? 6 : 12}>
                                <Typography variant="caption" component={'div'}>
                                  <i>{t('url_dynamic')}</i>
                                </Typography>
                                {item && item.al.detailed ? (
                                  <AutoHideChipList
                                    items={item.al.detailed.url.filter(url => url.type === 'network.dynamic.url')}
                                  />
                                ) : (
                                  <ChipList
                                    items={
                                      item
                                        ? item.al.url_dynamic.map(label => ({
                                            label,
                                            variant: 'outlined'
                                          }))
                                        : null
                                    }
                                  />
                                )}
                              </Grid>
                            ))}
                          {!item ||
                            (item.al.url_static.length !== 0 && (
                              <Grid item xs={12} md={!item || item.al.url_dynamic.length !== 0 ? 6 : 12}>
                                <Typography variant="caption" component={'div'}>
                                  <i>{t('url_static')}</i>
                                </Typography>
                                {item && item.al.detailed ? (
                                  <AutoHideChipList
                                    items={item.al.detailed.url.filter(url => url.type === 'network.static.url')}
                                  />
                                ) : (
                                  <ChipList
                                    items={
                                      item
                                        ? item.al.url_static.map(label => ({
                                            label,
                                            variant: 'outlined'
                                          }))
                                        : null
                                    }
                                  />
                                )}
                              </Grid>
                            ))}
                        </Grid>
                      </div>
                    </Grid>
                  </>
                ) : null}

                {/* Heuristics Section */}
                {!item || (item.heuristic && item.heuristic.name && item.heuristic.name.length !== 0) ? (
                  <>
                    <Grid item xs={3} sm={2}>
                      {t('heuristic')}
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <div className={classes.sectionContent}>
                        {item && item.al.detailed ? (
                          <AutoHideChipList items={item.al.detailed.heuristic} />
                        ) : (
                          <ChipList
                            items={item ? item.heuristic.name.map(label => ({ label, variant: 'outlined' })) : null}
                          />
                        )}
                      </div>
                    </Grid>
                  </>
                ) : null}

                {/* AL Behaviours Section */}
                {!item || item.al.behavior.length !== 0 ? (
                  <>
                    <Grid item xs={3} sm={2}>
                      {t('behaviors')}
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <div className={classes.sectionContent}>
                        {item && item.al.detailed ? (
                          <AutoHideChipList items={item.al.detailed.behavior} />
                        ) : (
                          <ChipList
                            items={item ? item.al.behavior.map(label => ({ label, variant: 'outlined' })) : null}
                          />
                        )}
                      </div>
                    </Grid>
                  </>
                ) : null}

                {/* YARA Hits */}
                {!item || item.al.yara.length !== 0 ? (
                  <>
                    <Grid item xs={3} sm={2}>
                      {t('yara')}
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <div className={classes.sectionContent}>
                        {item && item.al.detailed ? (
                          <AutoHideChipList items={item.al.detailed.yara} />
                        ) : (
                          <ChipList items={item ? item.al.yara.map(label => ({ label, variant: 'outlined' })) : null} />
                        )}
                      </div>
                    </Grid>
                  </>
                ) : null}

                {/* Attack Section */}
                {!item || item.attack.category.length !== 0 ? (
                  <>
                    <Grid item xs={3} sm={2}>
                      {t('attack')}
                    </Grid>
                    <Grid item xs={9} sm={10}>
                      <div className={classes.sectionContent}>
                        <Grid container spacing={1}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="caption" style={{ marginRight: theme.spacing(1) }} component={'div'}>
                              <i>{t('attack_category')}</i>
                            </Typography>
                            {item && item.al.detailed ? (
                              <AutoHideChipList items={item.al.detailed.attack_category} />
                            ) : (
                              <ChipList
                                items={
                                  item ? item.attack.category.map(label => ({ label, variant: 'outlined' })) : null
                                }
                              />
                            )}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="caption" style={{ marginRight: theme.spacing(1) }} component={'div'}>
                              <i>{t('attack_pattern')}</i>
                            </Typography>
                            {item && item.al.detailed ? (
                              <AutoHideChipList items={item.al.detailed.attack_pattern} />
                            ) : (
                              <ChipList
                                items={item ? item.attack.pattern.map(label => ({ label, variant: 'outlined' })) : null}
                              />
                            )}
                          </Grid>
                        </Grid>
                      </div>
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </>
          ))}
      </div>
    </PageFullWidth>
  );
};

const AlertDetails = React.memo(WrappedAlertDetails);
export default AlertDetails;
