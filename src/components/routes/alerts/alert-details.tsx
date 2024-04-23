import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Alert from '@mui/material/Alert';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useAssistant from 'components/hooks/useAssistant';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import { AlertItem, DetailedItem, detailedItemCompare } from 'components/routes/alerts/hooks/useAlerts';
import { ActionableChipList } from 'components/visual/ActionableChipList';
import { ActionableCustomChipProps } from 'components/visual/ActionableCustomChip';
import ActionableText from 'components/visual/ActionableText';
import { ChipSkeleton, ChipSkeletonInline } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { ImageInline } from 'components/visual/image_inline';
import Verdict from 'components/visual/Verdict';
import VerdictBar from 'components/visual/VerdictBar';
import { verdictToColor } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';
import { Link, useParams } from 'react-router-dom';
import ForbiddenPage from '../403';
import AlertEventsTable from './alert-events';
import AlertExtendedScan from './alert-extended_scan';
import AlertPriority from './alert-priority';
import AlertStatus from './alert-status';

const TARGET_RESULT_COUNT = 10;

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
  inDrawer?: boolean;
};

type AutoHideChipListProps = {
  items: DetailedItem[];
  defaultClassification: string;
  type?: string;
};

const SkeletonInline = () => <Skeleton style={{ display: 'inline-block', width: '10rem' }} />;

type AutoHideChipListState = {
  showExtra: boolean;
  fullChipList: ActionableCustomChipProps[];
};

const WrappedAutoHideChipList: React.FC<AutoHideChipListProps> = ({ items, defaultClassification, type = null }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<AutoHideChipListState | null>(null);
  const [shownChips, setShownChips] = useState<ActionableCustomChipProps[]>([]);

  useEffect(() => {
    const fullChipList = items.sort(detailedItemCompare).map(
      item =>
        ({
          category: 'tag',
          data_type: type,
          label: item.subtype ? `${item.value} - ${item.subtype}` : item.value,
          variant: 'outlined',
          color: verdictToColor(item.verdict),
          classification: defaultClassification
        } as ActionableCustomChipProps)
    );
    const showExtra = items.length <= TARGET_RESULT_COUNT;

    setState({ showExtra, fullChipList });
  }, [defaultClassification, items, type]);

  useEffect(() => {
    if (state !== null) {
      if (state.showExtra) {
        setShownChips(state.fullChipList);
      } else {
        setShownChips(state.fullChipList.slice(0, TARGET_RESULT_COUNT));
      }
    }
  }, [state]);

  return (
    <>
      <ActionableChipList items={shownChips} />
      {state && !state.showExtra && (
        <Tooltip title={t('more')}>
          <IconButton size="small" onClick={() => setState({ ...state, showExtra: true })} style={{ padding: 0 }}>
            <MoreHorizOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

const AutoHideChipList = React.memo(WrappedAutoHideChipList);

const WrappedAlertDetails: React.FC<AlertDetailsProps> = ({ id, alert, inDrawer = false }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { c12nDef } = useALContext();
  const { copy } = useClipboard();
  const [item, setItem] = useState<AlertItem>(null);
  const { id: paramId } = useParams<{ id: string }>();
  const { configuration } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const [metaOpen, setMetaOpen] = React.useState(false);
  const [viewHistory, setViewHistory] = React.useState(false);
  const [hasEvents, setHasEvents] = React.useState(false);
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));
  const { t } = useTranslation(['alerts']);
  const { addInsight, removeInsight } = useAssistant();

  useEffect(() => {
    if (alert) {
      setItem(alert);
      setHasEvents(alert.events && alert.events.length > 0 ? true : false);
    } else {
      const alertId = id || paramId;
      if (alertId && currentUser.roles.includes('alert_view')) {
        apiCall({
          url: `/api/v4/alert/${alertId}/`,
          onSuccess: api_data => {
            let alertItem = api_data.api_response;
            setItem(alertItem);
            setHasEvents(alertItem && alertItem.events && alertItem.events.length > 0 ? true : false);
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, paramId, alert]);

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

  useEffect(() => {
    if (item) {
      addInsight({ type: 'submission', value: item.sid });
      addInsight({ type: 'report', value: item.sid });
      addInsight({ type: 'file', value: item.file.sha256 });
      if (item.file.type.indexOf('code/') === 0) {
        addInsight({ type: 'code', value: item.file.sha256 });
      }
    }

    return () => {
      if (item) {
        removeInsight({ type: 'submission', value: item.sid });
        removeInsight({ type: 'report', value: item.sid });
        removeInsight({ type: 'file', value: item.file.sha256 });
        removeInsight({ type: 'code', value: item.file.sha256 });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  return currentUser.roles.includes('alert_view') ? (
    <PageFullWidth margin={inDrawer ? 1 : 4}>
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
            {!id && (
              <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
                {item ? (
                  <>
                    <Tooltip title={t(hasEvents ? 'history' : 'history.none')}>
                      <IconButton
                        disableRipple={!hasEvents}
                        style={{
                          color: hasEvents ? theme.palette.action.active : theme.palette.action.disabled
                        }}
                        size="large"
                        onClick={() => {
                          if (hasEvents) {
                            setViewHistory(true);
                          }
                        }}
                      >
                        <WorkHistoryOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <AlertEventsTable alert={item} viewHistory={viewHistory} setViewHistory={setViewHistory} />
                  </>
                ) : (
                  <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                )}
              </Grid>
            )}
            {!id && currentUser.roles.includes('submission_view') && (
              <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
                {item ? (
                  <Tooltip title={t('submission')}>
                    <IconButton
                      component={Link}
                      style={{ color: theme.palette.action.active }}
                      to={`/submission/${item.sid}`}
                      size="large"
                    >
                      <ViewCarouselOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                )}
              </Grid>
            )}
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
                    <span style={{ wordBreak: 'break-word' }}>{item ? item.alert_id : <Skeleton />}</span>
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
                  <ActionableChipList
                    items={
                      item
                        ? item.label.map(label => ({ label, variant: 'outlined', classification: item.classification }))
                        : null
                    }
                  />
                </div>
              </div>
            </div>
          </Grid>
        </Grid>

        {/* File Info */}
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>{t('file_info')}</Typography>
          <Divider />
          <div
            className={classes.sectionContent}
            style={{
              display: 'flex',
              alignItems: upSM ? 'start' : 'center',
              flexDirection: upSM ? 'row' : 'column',
              rowGap: theme.spacing(2)
            }}
          >
            <Grid container>
              <Grid
                item
                xs={12}
                style={{ marginBottom: theme.spacing(1), display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}
              >
                <div style={{ marginRight: theme.spacing(1), wordBreak: 'break-word' }}>
                  {item ? item.file.name : <SkeletonInline />}
                </div>
                <div style={{ marginRight: theme.spacing(1), wordBreak: 'break-word' }}>
                  {item ? (
                    <CustomChip label={item.file.type} variant="outlined" size="small" />
                  ) : (
                    <ChipSkeletonInline />
                  )}
                </div>
                <Typography variant="caption" component={Box}>
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
                {item ? (
                  <ActionableText
                    category="hash"
                    type="md5"
                    value={item.file.md5}
                    classification={item.classification}
                  />
                ) : (
                  <SkeletonInline />
                )}
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
                {item ? (
                  <ActionableText
                    category="hash"
                    type="sha1"
                    value={item.file.sha1}
                    classification={item.classification}
                  />
                ) : (
                  <SkeletonInline />
                )}
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
                {item ? (
                  <ActionableText
                    category="hash"
                    type="sha256"
                    value={item.file.sha256}
                    classification={item.classification}
                  />
                ) : (
                  <SkeletonInline />
                )}
              </Grid>
            </Grid>
            {item && item.file.screenshots && <ImageInline data={item.file.screenshots} size="small" />}
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
                          <ActionableText
                            category="metadata"
                            type={k}
                            value={item.metadata[k]}
                            classification={item.classification}
                          />
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
                                <ActionableText
                                  category="metadata"
                                  type={k}
                                  value={item.metadata[k]}
                                  classification={item.classification}
                                />
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

        {(!item ||
          item.al.attrib.length !== 0 ||
          item.al.av.length !== 0 ||
          item.al.ip.length !== 0 ||
          item.al.domain.length !== 0 ||
          (item.al.uri && item.al.uri.length !== 0) ||
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
                        <AutoHideChipList items={item.al.detailed.attrib} defaultClassification={item.classification} />
                      ) : (
                        <ActionableChipList
                          items={
                            item
                              ? item.al.attrib.map(label => ({
                                  label,
                                  variant: 'outlined',
                                  classification: item.classification
                                }))
                              : null
                          }
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
                        <AutoHideChipList
                          items={item.al.detailed.av}
                          type="av.virus_name"
                          defaultClassification={item.classification}
                        />
                      ) : (
                        <ActionableChipList
                          items={
                            item
                              ? item.al.av.map(label => ({
                                  label,
                                  variant: 'outlined',
                                  classification: item.classification
                                }))
                              : null
                          }
                        />
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
                        {(!item || item.al.ip_dynamic.length !== 0) && (
                          <Grid item xs={12} md={!item || item.al.ip_static.length !== 0 ? 6 : 12}>
                            <Typography variant="caption" component={'div'}>
                              <i>{t('ip_dynamic')}</i>
                            </Typography>
                            {item && item.al.detailed ? (
                              <AutoHideChipList
                                items={item.al.detailed.ip.filter(ip => ip.type === 'network.dynamic.ip')}
                                type="network.dynamic.ip"
                                defaultClassification={item.classification}
                              />
                            ) : (
                              <ActionableChipList
                                items={
                                  item
                                    ? item.al.ip_dynamic.map(label => ({
                                        label,
                                        variant: 'outlined',
                                        classification: item.classification
                                      }))
                                    : null
                                }
                              />
                            )}
                          </Grid>
                        )}
                        {(!item || item.al.ip_static.length !== 0) && (
                          <Grid item xs={12} md={!item || item.al.ip_dynamic.length !== 0 ? 6 : 12}>
                            <Typography variant="caption" component={'div'}>
                              <i>{t('ip_static')}</i>
                            </Typography>
                            {item && item.al.detailed ? (
                              <AutoHideChipList
                                items={item.al.detailed.ip.filter(ip => ip.type === 'network.static.ip')}
                                type="network.static.ip"
                                defaultClassification={item.classification}
                              />
                            ) : (
                              <ActionableChipList
                                items={
                                  item
                                    ? item.al.ip_static.map(label => ({
                                        label,
                                        variant: 'outlined',
                                        classification: item.classification
                                      }))
                                    : null
                                }
                              />
                            )}
                          </Grid>
                        )}
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
                        {(!item || item.al.domain_dynamic.length !== 0) && (
                          <Grid item xs={12} md={!item || item.al.domain_static.length !== 0 ? 6 : 12}>
                            <Typography variant="caption" component={'div'}>
                              <i>{t('domain_dynamic')}</i>
                            </Typography>
                            {item && item.al.detailed ? (
                              <AutoHideChipList
                                items={item.al.detailed.domain.filter(
                                  domain => domain.type === 'network.dynamic.domain'
                                )}
                                type="network.dynamic.domain"
                                defaultClassification={item.classification}
                              />
                            ) : (
                              <ActionableChipList
                                items={
                                  item
                                    ? item.al.domain_dynamic.map(label => ({
                                        label,
                                        variant: 'outlined',
                                        classification: item.classification
                                      }))
                                    : null
                                }
                              />
                            )}
                          </Grid>
                        )}
                        {(!item || item.al.domain_static.length !== 0) && (
                          <Grid item xs={12} md={!item || item.al.domain_dynamic.length !== 0 ? 6 : 12}>
                            <Typography variant="caption" component={'div'}>
                              <i>{t('domain_static')}</i>
                            </Typography>
                            {item && item.al.detailed ? (
                              <AutoHideChipList
                                items={item.al.detailed.domain.filter(
                                  domain => domain.type === 'network.static.domain'
                                )}
                                type="network.static.domain"
                                defaultClassification={item.classification}
                              />
                            ) : (
                              <ActionableChipList
                                items={
                                  item
                                    ? item.al.domain_static.map(label => ({
                                        label,
                                        variant: 'outlined',
                                        classification: item.classification
                                      }))
                                    : null
                                }
                              />
                            )}
                          </Grid>
                        )}
                      </Grid>
                    </div>
                  </Grid>
                </>
              ) : null}

              {/* uri sections */}
              {!item || (item.al.uri && item.al.uri.length !== 0) ? (
                <>
                  <Grid item xs={3} sm={2}>
                    {t('uri')}
                  </Grid>
                  <Grid item xs={9} sm={10}>
                    <div className={classes.sectionContent}>
                      <Grid container spacing={1}>
                        {(!item || item.al.uri_dynamic.length !== 0) && (
                          <Grid item xs={12} md={!item || item.al.uri_static.length !== 0 ? 6 : 12}>
                            <Typography variant="caption" component={'div'}>
                              <i>{t('uri_dynamic')}</i>
                            </Typography>
                            {item && item.al.detailed ? (
                              <AutoHideChipList
                                items={item.al.detailed.uri.filter(uri => uri.type === 'network.dynamic.uri')}
                                type="network.dynamic.uri"
                                defaultClassification={item.classification}
                              />
                            ) : (
                              <ActionableChipList
                                items={
                                  item
                                    ? item.al.uri_dynamic.map(label => ({
                                        label,
                                        variant: 'outlined',
                                        classification: item.classification
                                      }))
                                    : null
                                }
                              />
                            )}
                          </Grid>
                        )}
                        {(!item || item.al.uri_static.length !== 0) && (
                          <Grid item xs={12} md={!item || item.al.uri_dynamic.length !== 0 ? 6 : 12}>
                            <Typography variant="caption" component={'div'}>
                              <i>{t('uri_static')}</i>
                            </Typography>
                            {item && item.al.detailed ? (
                              <AutoHideChipList
                                items={item.al.detailed.uri.filter(uri => uri.type === 'network.static.uri')}
                                type="network.static.uri"
                                defaultClassification={item.classification}
                              />
                            ) : (
                              <ActionableChipList
                                items={
                                  item
                                    ? item.al.uri_static.map(label => ({
                                        label,
                                        variant: 'outlined',
                                        classification: item.classification
                                      }))
                                    : null
                                }
                              />
                            )}
                          </Grid>
                        )}
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
                        <AutoHideChipList
                          items={item.al.detailed.heuristic}
                          defaultClassification={item.classification}
                        />
                      ) : (
                        <ActionableChipList
                          items={
                            item
                              ? item.heuristic.name.map(label => ({
                                  label,
                                  variant: 'outlined',
                                  classification: item.classification
                                }))
                              : null
                          }
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
                        <AutoHideChipList
                          items={item.al.detailed.behavior}
                          type="file.behavior"
                          defaultClassification={item.classification}
                        />
                      ) : (
                        <ActionableChipList
                          items={
                            item
                              ? item.al.behavior.map(label => ({
                                  label,
                                  variant: 'outlined',
                                  classification: item.classification
                                }))
                              : null
                          }
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
                        <AutoHideChipList
                          items={item.al.detailed.yara}
                          type="file.rule.yara"
                          defaultClassification={item.classification}
                        />
                      ) : (
                        <ActionableChipList
                          items={
                            item
                              ? item.al.yara.map(label => ({
                                  label,
                                  variant: 'outlined',
                                  classification: item.classification
                                }))
                              : null
                          }
                        />
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
                            <AutoHideChipList
                              items={item.al.detailed.attack_category}
                              defaultClassification={item.classification}
                            />
                          ) : (
                            <ActionableChipList
                              items={
                                item
                                  ? item.attack.category.map(label => ({
                                      label,
                                      variant: 'outlined',
                                      classification: item.classification
                                    }))
                                  : null
                              }
                            />
                          )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" style={{ marginRight: theme.spacing(1) }} component={'div'}>
                            <i>{t('attack_pattern')}</i>
                          </Typography>
                          {item && item.al.detailed ? (
                            <AutoHideChipList
                              items={item.al.detailed.attack_pattern}
                              defaultClassification={item.classification}
                            />
                          ) : (
                            <ActionableChipList
                              items={
                                item
                                  ? item.attack.pattern.map(label => ({
                                      label,
                                      variant: 'outlined',
                                      classification: item.classification
                                    }))
                                  : null
                              }
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
        )}
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

const AlertDetails = React.memo(WrappedAlertDetails);
export default AlertDetails;
