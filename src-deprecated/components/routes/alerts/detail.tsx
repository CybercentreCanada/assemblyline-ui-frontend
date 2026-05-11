import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Grid,
  Skeleton,
  styled,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { Fetcher } from 'borealis-ui';
import ListCarousel from 'commons/addons/lists/carousel/ListCarousel';
import ListNavigator from 'commons/addons/lists/navigator/ListNavigator';
import { useAppUser } from 'commons/components/app/hooks';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useAssistant from 'components/hooks/useAssistant';
import useMyAPI from 'components/hooks/useMyAPI';
import type { AlertItem } from 'components/models/base/alert';
import type { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import { ALERT_DEFAULT_PARAMS, ALERT_SIMPLELIST_ID } from 'components/routes/alerts';
import AlertActions, {
  AlertBadlist,
  AlertGroup,
  AlertHistory,
  AlertOwnership,
  AlertSafelist,
  AlertSubmission,
  AlertWorkflow
} from 'components/routes/alerts/components/Actions';
import {
  AlertExtendedScan,
  AlertPriority,
  AlertStatus,
  AutoHideChipList,
  SkeletonInline
} from 'components/routes/alerts/components/Components';
import { SearchParamsProvider } from 'components/routes/alerts/contexts/SearchParamsContext';
import { ActionableChipList } from 'components/visual/ActionableChipList';
import ActionableText from 'components/visual/ActionableText';
import { ChipSkeleton, ChipSkeletonInline } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import Verdict from 'components/visual/Verdict';
import VerdictBar from 'components/visual/VerdictBar';
import { ImageInline } from 'components/visual/image_inline';
import { verdictToColor } from 'helpers/utils';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';
import { useParams } from 'react-router';

const Section = memo(
  styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& > hr': {
      marginBottom: theme.spacing(1)
    }
  }))
);

const SectionTitle = memo(
  styled(Typography)(() => ({
    fontWeight: 'bold'
  }))
);

const SectionContent = memo(
  styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    columnGap: theme.spacing(1)
  }))
);

const ClipboardIcon = memo(
  styled(BsClipboard)(() => ({
    '&:hover': {
      cursor: 'pointer',
      transform: 'scale(1.1)'
    }
  }))
);

type Params = {
  id?: string;
};

type Props = {
  id?: string;
  alert?: AlertItem;
  inDrawer?: boolean;
  defaults?: string;
  search?: string;
};

const WrappedAlertDetailContent = ({ id: propId = null, alert: propAlert = null, inDrawer = false }: Props) => {
  const { t } = useTranslation(['alerts']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { copy } = useClipboard();
  const { addInsight, removeInsight } = useAssistant();
  const { c12nDef, configuration } = useALContext();
  const { id: paramId } = useParams<Params>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [alert, setAlert] = useState<AlertItem>(null);
  const [metaOpen, setMetaOpen] = useState<boolean>(false);

  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  useEffect(() => {
    if (!currentUser.roles.includes('alert_view')) {
      return;
    } else if (propAlert) {
      setAlert(propAlert);
    } else {
      apiCall({
        url: `/api/v4/alert/${inDrawer ? propId.split('?')[0] : paramId}/`,
        onSuccess: ({ api_response }) => setAlert(api_response)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, inDrawer, paramId, propAlert, propId]);

  useEffect(() => {
    if (alert) {
      addInsight({ type: 'submission', value: alert.sid });
      addInsight({ type: 'report', value: alert.sid });
      addInsight({ type: 'file', value: alert.file.sha256 });
      if (alert.file.type.indexOf('code/') === 0) {
        addInsight({ type: 'code', value: alert.file.sha256 });
      }
    }

    return () => {
      if (alert) {
        removeInsight({ type: 'submission', value: alert.sid });
        removeInsight({ type: 'report', value: alert.sid });
        removeInsight({ type: 'file', value: alert.file.sha256 });
        removeInsight({ type: 'code', value: alert.file.sha256 });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert]);

  useEffect(() => {
    const update = ({ detail }: CustomEvent<Partial<AlertItem>[]>) => {
      setAlert(a => {
        const item = detail.find(i => a.alert_id === i.alert_id);
        return item ? { ...a, ...item } : a;
      });
    };

    window.addEventListener('alertUpdate', update);
    return () => {
      window.removeEventListener('alertUpdate', update);
    };
  }, []);

  const Wrapper = useCallback<React.FC<{ children: React.ReactNode; alert: AlertItem; drawer: boolean }>>(
    ({ children, alert: alertProp, drawer }) =>
      !drawer ? (
        <>{children}</>
      ) : (
        <div>
          <div
            style={{
              alignItems: 'start',
              display: 'flex',
              float: 'right',
              height: theme.spacing(8),
              marginTop: theme.spacing(-8),
              marginRight: theme.spacing(-1),
              position: 'sticky',
              top: theme.spacing(1),
              zIndex: 10
            }}
          >
            <AlertActions alert={alertProp} inDrawer={drawer} />
            <ListNavigator id={ALERT_SIMPLELIST_ID} />
          </div>
          <ListCarousel id={ALERT_SIMPLELIST_ID} disableArrowUp disableArrowDown enableSwipe>
            <>{children}</>
          </ListCarousel>
        </div>
      ),
    [theme]
  );

  return currentUser.roles.includes('alert_view') ? (
    <Wrapper alert={alert} drawer={inDrawer}>
      <PageFullWidth margin={inDrawer ? 1 : 4}>
        {c12nDef.enforce && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing(2) }}>
            <div style={{ flex: 1 }}>
              <Classification c12n={alert ? alert.classification : null} type="outlined" />
            </div>
          </div>
        )}
        {!inDrawer && (
          <div style={{ paddingBottom: theme.spacing(3), textAlign: 'left' }}>
            <Grid container alignItems="center">
              <Grid flexGrow={1}>
                <Typography variant="h4">{t('detail.title')}</Typography>
              </Grid>

              <Grid style={{ display: 'flex', flexDirection: 'row', textAlign: 'right', flexGrow: 0 }}>
                <AlertHistory alert={alert} />
                <AlertGroup alert={alert} />
                <AlertOwnership alert={alert} />
                <AlertSubmission alert={alert} />
                <AlertWorkflow alert={alert} />
                <AlertSafelist alert={alert} />
                <AlertBadlist alert={alert} />
              </Grid>
            </Grid>
          </div>
        )}
        <div style={{ textAlign: 'left' }}>
          {alert && alert.filtered && (
            <div style={{ marginBottom: theme.spacing(3) }}>
              <Alert severity="warning">{t('data_filtered_msg')}</Alert>
            </div>
          )}
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
              {/* Alert Information Section */}
              <Section>
                <SectionTitle>{t('alert_info')}</SectionTitle>
                <Divider />
                <SectionContent>
                  <Grid container alignItems="center">
                    {/* Alert ID */}
                    <Grid size={{ xs: 3, sm: 2, md: 4 }}>{t('alert_id')}</Grid>
                    <Grid size={{ xs: 9, sm: 10, md: 8 }}>
                      <span style={{ wordBreak: 'break-word' }}>{alert ? alert.alert_id : <Skeleton />}</span>
                    </Grid>
                    {/* Alert Type */}
                    <Grid size={{ xs: 3, sm: 2, md: 4 }}>{t('type')}</Grid>
                    <Grid size={{ xs: 9, sm: 10, md: 8 }}>{alert ? alert.type : <Skeleton />}</Grid>
                    {/* Submission received date */}
                    <Grid size={{ xs: 3, sm: 2, md: 4 }}>{t('received_date')}</Grid>
                    <Grid size={{ xs: 9, sm: 10, md: 8 }}>
                      {alert ? `${alert.ts.replace('T', ' ').replace('Z', '')} (UTC)` : <Skeleton />}
                    </Grid>
                    {/* Alerted date */}
                    <Grid size={{ xs: 3, sm: 2, md: 4 }}>{t('alerted_date')}</Grid>
                    <Grid size={{ xs: 9, sm: 10, md: 8 }}>
                      {alert ? `${alert.reporting_ts.replace('T', ' ').replace('Z', '')} (UTC)` : <Skeleton />}
                    </Grid>
                    {/* Alert owner */}
                    <Grid size={{ xs: 3, sm: 2, md: 4 }}>{t('ownership')}</Grid>
                    <Grid size={{ xs: 9, sm: 10, md: 8 }}>
                      {alert ? (
                        alert.owner ? (
                          alert.owner
                        ) : (
                          <div style={{ color: theme.palette.text.disabled }}>
                            {alert.hint_owner ? t('hint_owner_detail') : t('owned_none')}
                          </div>
                        )
                      ) : (
                        <Skeleton />
                      )}
                    </Grid>
                    {/* Alert Extended scan status */}
                    <Grid size={{ xs: 3, sm: 2, md: 4 }}>{t('extended')}</Grid>
                    <Grid size={{ xs: 9, sm: 10, md: 8 }} style={{ marginTop: theme.spacing(0.5) }}>
                      {alert ? <AlertExtendedScan name={alert.extended_scan} withChip /> : <Skeleton />}
                    </Grid>
                    {/* Alert Priority */}
                    <Grid size={{ xs: 3, sm: 2, md: 4 }}>{t('priority')}</Grid>
                    <Grid size={{ xs: 9, sm: 10, md: 8 }} style={{ marginTop: theme.spacing(0.5) }}>
                      {alert ? <AlertPriority name={alert ? alert.priority : null} withChip /> : <ChipSkeleton />}
                    </Grid>
                    {/* Alert Status */}
                    <Grid size={{ xs: 3, sm: 2, md: 4 }}>{t('status')}</Grid>
                    <Grid size={{ xs: 9, sm: 10, md: 8 }} style={{ marginTop: theme.spacing(0.5) }}>
                      {alert ? (
                        alert.status ? (
                          <AlertStatus name={alert.status} />
                        ) : (
                          <CustomChip size="small" variant="outlined" label={t(`status_unset`)} disabled />
                        )
                      ) : (
                        <ChipSkeleton />
                      )}
                    </Grid>
                  </Grid>
                </SectionContent>
              </Section>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <div>
                {/* Score Section. */}
                <Section>
                  <SectionTitle>{t('verdict')}</SectionTitle>
                  <Divider />
                  <SectionContent>
                    <Grid container size="grow">
                      <Grid size={{ xs: 3, sm: 2, md: 4 }}>{t('score')}</Grid>
                      <Grid size={{ xs: 9, sm: 10, md: 8 }}>
                        {alert ? <Verdict size="tiny" score={alert.al.score} fullWidth /> : <Skeleton />}
                      </Grid>
                      <Grid size={{ xs: 3, sm: 2, md: 4 }}>
                        <div style={{ marginTop: theme.spacing(0.5) }}>{t('user_verdict')}</div>
                      </Grid>
                      <Grid size={{ xs: 9, sm: 10, md: 8 }}>
                        {alert ? (
                          <div style={{ marginTop: theme.spacing(0.5), marginBottom: theme.spacing(0.5) }}>
                            <VerdictBar verdicts={alert.verdict} />
                          </div>
                        ) : (
                          <>
                            <Skeleton />
                            <Skeleton />
                          </>
                        )}
                      </Grid>
                    </Grid>
                  </SectionContent>
                </Section>
                {/* Labels Section */}
                <Section>
                  <SectionTitle>{t('label')}</SectionTitle>
                  <Divider />
                  <SectionContent>
                    <ActionableChipList
                      items={
                        alert
                          ? alert.label.map(label => ({
                              label,
                              variant: 'outlined',
                              classification: alert.classification
                            }))
                          : null
                      }
                    />
                  </SectionContent>
                </Section>
              </div>
            </Grid>
          </Grid>

          {/* File Info */}
          <Section>
            <SectionTitle>{t('file_info')}</SectionTitle>
            <Divider />
            <SectionContent
              style={{
                display: 'flex',
                alignItems: upSM ? 'start' : 'center',
                flexDirection: upSM ? 'row' : 'column',
                rowGap: theme.spacing(2)
              }}
            >
              <Grid container size="grow">
                <Grid
                  size={{ xs: 12 }}
                  style={{ marginBottom: theme.spacing(1), display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}
                >
                  <div style={{ marginRight: theme.spacing(1), wordBreak: 'break-word' }}>
                    {alert ? alert.file.name : <SkeletonInline />}
                  </div>
                  <div style={{ marginRight: theme.spacing(1), wordBreak: 'break-word' }}>
                    {alert ? (
                      <CustomChip label={alert.file.type} variant="outlined" size="small" />
                    ) : (
                      <ChipSkeletonInline />
                    )}
                  </div>
                  <Typography variant="caption" component={Box}>
                    {alert ? `${alert.file.size} (${(alert.file.size / 1024).toFixed(2)} Kb)` : <SkeletonInline />}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3, sm: 2 }}>
                  <ClipboardIcon onClick={alert ? () => copy(alert.file.md5) : null} />
                  <Typography variant="caption" style={{ marginLeft: theme.spacing(0.5) }}>
                    MD5:
                  </Typography>
                </Grid>
                <Grid size={{ xs: 9, sm: 10 }} style={{ wordBreak: 'break-word' }}>
                  {alert ? (
                    <ActionableText
                      category="hash"
                      type="md5"
                      value={alert.file.md5}
                      classification={alert.classification}
                    />
                  ) : (
                    <SkeletonInline />
                  )}
                </Grid>
                <Grid size={{ xs: 3, sm: 2 }}>
                  <ClipboardIcon onClick={alert ? () => copy(alert.file.sha1) : null} />
                  <Typography variant="caption" style={{ marginLeft: theme.spacing(0.5) }}>
                    SHA1:
                  </Typography>
                </Grid>
                <Grid size={{ xs: 9, sm: 10 }} style={{ wordBreak: 'break-word' }}>
                  {alert ? (
                    <ActionableText
                      category="hash"
                      type="sha1"
                      value={alert.file.sha1}
                      classification={alert.classification}
                    />
                  ) : (
                    <SkeletonInline />
                  )}
                </Grid>
                <Grid size={{ xs: 3, sm: 2 }}>
                  <ClipboardIcon onClick={alert ? () => copy(alert.file.sha256) : null} />
                  <Typography variant="caption" style={{ marginLeft: theme.spacing(0.5) }}>
                    SHA256:
                  </Typography>
                </Grid>
                <Grid size={{ xs: 9, sm: 10 }} style={{ wordBreak: 'break-word' }}>
                  {alert ? (
                    <ActionableText
                      category="hash"
                      type="sha256"
                      value={alert.file.sha256}
                      classification={alert.classification}
                    />
                  ) : (
                    <SkeletonInline />
                  )}
                </Grid>
              </Grid>
              {alert && alert.file.screenshots && <ImageInline data={alert.file.screenshots} size="small" />}
            </SectionContent>
          </Section>

          {/* Metadata Section */}
          {!alert || (alert.metadata && Object.keys(alert.metadata).length > 0) ? (
            <Section>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between'
                }}
              >
                <SectionTitle>{t('metadata')}</SectionTitle>
                {alert &&
                  Object.keys(alert.metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1)
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
              <SectionContent>
                <div style={{ flex: 1 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {alert ? (
                      Object.keys(alert.metadata)
                        .filter(k => configuration.ui.alerting_meta.important.indexOf(k) !== -1)
                        .map(k => (
                          <Grid container spacing={1} key={`alert-metadata-${k}`}>
                            <Grid
                              size={{ xs: 3, sm: 2 }}
                              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {k}
                            </Grid>
                            <Grid size={{ xs: 9, sm: 10 }}>
                              <ActionableText
                                category="metadata"
                                type={k}
                                value={alert.metadata[k]}
                                classification={alert.classification}
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
                    {alert &&
                      Object.keys(alert.metadata).filter(
                        k => configuration.ui.alerting_meta.important.indexOf(k) === -1
                      ).length !== 0 && (
                        <Collapse in={metaOpen} timeout="auto" style={{ marginTop: theme.spacing(0.5) }}>
                          {alert ? (
                            Object.keys(alert.metadata)
                              .filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1)
                              .map(k => (
                                <Grid container spacing={1} key={`alert-metadata-${k}`}>
                                  <Grid
                                    size={{ xs: 3, sm: 2 }}
                                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                  >
                                    {k}
                                  </Grid>
                                  <Grid size={{ xs: 9, sm: 10 }}>
                                    <ActionableText
                                      category="metadata"
                                      type={k}
                                      value={alert.metadata[k]}
                                      classification={alert.classification}
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
                {alert?.metadata?.eml_path && (
                  <div>
                    <Fetcher
                      fetcherId="email-preview.preview"
                      type="email_id"
                      value={alert?.metadata?.eml_path}
                      classification={currentUser.classification}
                      slotProps={{
                        skeleton: { sx: { maxWidth: '128px', minWidth: '128px', maxHeight: '156px' } },
                        paper: { style: { maxWidth: '144px', minWidth: '144px', maxHeight: '172px' } },
                        image: {
                          style: {
                            width: '128px',
                            maxHeight: '128px',
                            imageRendering: 'pixelated',
                            objectFit: 'contain'
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </SectionContent>
            </Section>
          ) : null}

          {(!alert ||
            alert.al.attrib.length !== 0 ||
            alert.al.av.length !== 0 ||
            alert.al.ip.length !== 0 ||
            alert.al.domain.length !== 0 ||
            (alert.al.uri && alert.al.uri.length !== 0) ||
            alert.attack.category.length !== 0 ||
            (alert.heuristic && alert.heuristic.name && alert.heuristic.name.length !== 0) ||
            alert.al.behavior.length !== 0 ||
            alert.al.yara.length !== 0) && (
            <>
              <SectionTitle>{t('al_results')}</SectionTitle>
              <Divider />
              <Grid container spacing={1} style={{ marginTop: theme.spacing(1) }}>
                {/* AL Attributions Section */}
                {!alert || alert.al.attrib.length !== 0 ? (
                  <>
                    <Grid size={{ xs: 3, sm: 2 }}>{t('attributions')}</Grid>
                    <Grid size={{ xs: 9, sm: 10 }}>
                      <SectionContent>
                        {alert && alert.al.detailed ? (
                          <ActionableChipList
                            items={alert.al.detailed.attrib.map(item => {
                              const dataTypes = {
                                CFG: 'result.sections.tags.technique.config',
                                EXP: 'result.sections.tags.attribution.exploit',
                                IMP: 'result.sections.tags.attribution.implant',
                                OB: 'result.sections.tags.technique.obfuscation',
                                TA: 'result.sections.tags.attribution.actor'
                              };

                              return {
                                category: null,
                                classification: alert.classification,
                                color: verdictToColor(item.verdict),
                                data_type: item.subtype in dataTypes ? dataTypes[item.subtype] : null,
                                index: '/result',
                                label: item.subtype ? `${item.value} - ${item.subtype}` : item.value,
                                value: item.value,
                                variant: 'outlined'
                              };
                            })}
                          />
                        ) : (
                          <ActionableChipList
                            items={
                              alert
                                ? alert.al.attrib.map(label => ({
                                    label,
                                    variant: 'outlined',
                                    classification: alert.classification
                                  }))
                                : null
                            }
                          />
                        )}
                      </SectionContent>
                    </Grid>
                  </>
                ) : null}

                {/* AL AV Hits */}
                {!alert || alert.al.av.length !== 0 ? (
                  <>
                    <Grid size={{ xs: 3, sm: 2 }}>{t('avhits')}</Grid>
                    <Grid size={{ xs: 9, sm: 10 }}>
                      <SectionContent>
                        {alert && alert.al.detailed ? (
                          <AutoHideChipList
                            items={alert.al.detailed.av}
                            type="av.virus_name"
                            defaultClassification={alert.classification}
                          />
                        ) : (
                          <ActionableChipList
                            items={
                              alert
                                ? alert.al.av.map(label => ({
                                    label,
                                    variant: 'outlined',
                                    classification: alert.classification
                                  }))
                                : null
                            }
                          />
                        )}
                      </SectionContent>
                    </Grid>
                  </>
                ) : null}

                {/* IPs sections */}
                {!alert || alert.al.ip.length !== 0 ? (
                  <>
                    <Grid size={{ xs: 3, sm: 2 }}>{t('ip')}</Grid>
                    <Grid size={{ xs: 9, sm: 10 }}>
                      <SectionContent>
                        <Grid container spacing={1}>
                          {(!alert || alert.al.ip_dynamic.length !== 0) && (
                            <Grid size={{ xs: 12, md: !alert || alert.al.ip_static.length !== 0 ? 6 : 12 }}>
                              <Typography variant="caption" component="div">
                                <i>{t('ip_dynamic')}</i>
                              </Typography>
                              {alert && alert.al.detailed ? (
                                <AutoHideChipList
                                  items={alert.al.detailed.ip.filter(ip => ip.type === 'network.dynamic.ip')}
                                  type="network.dynamic.ip"
                                  defaultClassification={alert.classification}
                                />
                              ) : (
                                <ActionableChipList
                                  items={
                                    alert
                                      ? alert.al.ip_dynamic.map(label => ({
                                          label,
                                          variant: 'outlined',
                                          classification: alert.classification
                                        }))
                                      : null
                                  }
                                />
                              )}
                            </Grid>
                          )}
                          {(!alert || alert.al.ip_static.length !== 0) && (
                            <Grid size={{ xs: 12, md: !alert || alert.al.ip_dynamic.length !== 0 ? 6 : 12 }}>
                              <Typography variant="caption" component="div">
                                <i>{t('ip_static')}</i>
                              </Typography>
                              {alert && alert.al.detailed ? (
                                <AutoHideChipList
                                  items={alert.al.detailed.ip.filter(ip => ip.type === 'network.static.ip')}
                                  type="network.static.ip"
                                  defaultClassification={alert.classification}
                                />
                              ) : (
                                <ActionableChipList
                                  items={
                                    alert
                                      ? alert.al.ip_static.map(label => ({
                                          label,
                                          variant: 'outlined',
                                          classification: alert.classification
                                        }))
                                      : null
                                  }
                                />
                              )}
                            </Grid>
                          )}
                        </Grid>
                      </SectionContent>
                    </Grid>
                  </>
                ) : null}

                {/* Domains sections */}
                {!alert || alert.al.domain.length !== 0 ? (
                  <>
                    <Grid size={{ xs: 3, sm: 2 }}>{t('domain')}</Grid>
                    <Grid size={{ xs: 9, sm: 10 }}>
                      <SectionContent>
                        <Grid container spacing={1}>
                          {(!alert || alert.al.domain_dynamic.length !== 0) && (
                            <Grid size={{ xs: 12, md: !alert || alert.al.domain_static.length !== 0 ? 6 : 12 }}>
                              <Typography variant="caption" component="div">
                                <i>{t('domain_dynamic')}</i>
                              </Typography>
                              {alert && alert.al.detailed ? (
                                <AutoHideChipList
                                  items={alert.al.detailed.domain.filter(
                                    domain => domain.type === 'network.dynamic.domain'
                                  )}
                                  type="network.dynamic.domain"
                                  defaultClassification={alert.classification}
                                />
                              ) : (
                                <ActionableChipList
                                  items={
                                    alert
                                      ? alert.al.domain_dynamic.map(label => ({
                                          label,
                                          variant: 'outlined',
                                          classification: alert.classification
                                        }))
                                      : null
                                  }
                                />
                              )}
                            </Grid>
                          )}
                          {(!alert || alert.al.domain_static.length !== 0) && (
                            <Grid size={{ xs: 12, md: !alert || alert.al.domain_dynamic.length !== 0 ? 6 : 12 }}>
                              <Typography variant="caption" component="div">
                                <i>{t('domain_static')}</i>
                              </Typography>
                              {alert && alert.al.detailed ? (
                                <AutoHideChipList
                                  items={alert.al.detailed.domain.filter(
                                    domain => domain.type === 'network.static.domain'
                                  )}
                                  type="network.static.domain"
                                  defaultClassification={alert.classification}
                                />
                              ) : (
                                <ActionableChipList
                                  items={
                                    alert
                                      ? alert.al.domain_static.map(label => ({
                                          label,
                                          variant: 'outlined',
                                          classification: alert.classification
                                        }))
                                      : null
                                  }
                                />
                              )}
                            </Grid>
                          )}
                        </Grid>
                      </SectionContent>
                    </Grid>
                  </>
                ) : null}

                {/* uri sections */}
                {!alert || (alert.al.uri && alert.al.uri.length !== 0) ? (
                  <>
                    <Grid size={{ xs: 3, sm: 2 }}>{t('uri')}</Grid>
                    <Grid size={{ xs: 9, sm: 10 }}>
                      <SectionContent>
                        <Grid container spacing={1}>
                          {(!alert || alert.al.uri_dynamic.length !== 0) && (
                            <Grid size={{ xs: 12, md: !alert || alert.al.uri_static.length !== 0 ? 6 : 12 }}>
                              <Typography variant="caption" component="div">
                                <i>{t('uri_dynamic')}</i>
                              </Typography>
                              {alert && alert.al.detailed ? (
                                <AutoHideChipList
                                  items={alert.al.detailed.uri.filter(uri => uri.type === 'network.dynamic.uri')}
                                  type="network.dynamic.uri"
                                  defaultClassification={alert.classification}
                                />
                              ) : (
                                <ActionableChipList
                                  items={
                                    alert
                                      ? alert.al.uri_dynamic.map(label => ({
                                          label,
                                          variant: 'outlined',
                                          classification: alert.classification
                                        }))
                                      : null
                                  }
                                />
                              )}
                            </Grid>
                          )}
                          {(!alert || alert.al.uri_static.length !== 0) && (
                            <Grid size={{ xs: 12, md: !alert || alert.al.uri_dynamic.length !== 0 ? 6 : 12 }}>
                              <Typography variant="caption" component="div">
                                <i>{t('uri_static')}</i>
                              </Typography>
                              {alert && alert.al.detailed ? (
                                <AutoHideChipList
                                  items={alert.al.detailed.uri.filter(uri => uri.type === 'network.static.uri')}
                                  type="network.static.uri"
                                  defaultClassification={alert.classification}
                                />
                              ) : (
                                <ActionableChipList
                                  items={
                                    alert
                                      ? alert.al.uri_static.map(label => ({
                                          label,
                                          variant: 'outlined',
                                          classification: alert.classification
                                        }))
                                      : null
                                  }
                                />
                              )}
                            </Grid>
                          )}
                        </Grid>
                      </SectionContent>
                    </Grid>
                  </>
                ) : null}

                {/* Heuristics Section */}
                {!alert || (alert.heuristic && alert.heuristic.name && alert.heuristic.name.length !== 0) ? (
                  <>
                    <Grid size={{ xs: 3, sm: 2 }}>{t('heuristic')}</Grid>
                    <Grid size={{ xs: 9, sm: 10 }}>
                      <SectionContent>
                        {alert && alert.al.detailed ? (
                          <AutoHideChipList
                            category={null}
                            defaultClassification={alert.classification}
                            index="/result"
                            items={alert.al.detailed.heuristic}
                            type="result.sections.heuristic.name"
                          />
                        ) : (
                          <ActionableChipList
                            items={
                              alert
                                ? alert.heuristic.name.map(label => ({
                                    label,
                                    variant: 'outlined',
                                    classification: alert.classification
                                  }))
                                : null
                            }
                          />
                        )}
                      </SectionContent>
                    </Grid>
                  </>
                ) : null}

                {/* AL Behaviours Section */}
                {!alert || alert.al.behavior.length !== 0 ? (
                  <>
                    <Grid size={{ xs: 3, sm: 2 }}>{t('behaviors')}</Grid>
                    <Grid size={{ xs: 9, sm: 10 }}>
                      <SectionContent>
                        {alert && alert.al.detailed ? (
                          <AutoHideChipList
                            items={alert.al.detailed.behavior}
                            type="file.behavior"
                            defaultClassification={alert.classification}
                          />
                        ) : (
                          <ActionableChipList
                            items={
                              alert
                                ? alert.al.behavior.map(label => ({
                                    label,
                                    variant: 'outlined',
                                    classification: alert.classification
                                  }))
                                : null
                            }
                          />
                        )}
                      </SectionContent>
                    </Grid>
                  </>
                ) : null}

                {/* YARA Hits */}
                {!alert || alert.al.yara.length !== 0 ? (
                  <>
                    <Grid size={{ xs: 3, sm: 2 }}>{t('yara')}</Grid>
                    <Grid size={{ xs: 9, sm: 10 }}>
                      <SectionContent>
                        {alert && alert.al.detailed ? (
                          <AutoHideChipList
                            items={alert.al.detailed.yara}
                            type="file.rule.yara"
                            defaultClassification={alert.classification}
                          />
                        ) : (
                          <ActionableChipList
                            items={
                              alert
                                ? alert.al.yara.map(label => ({
                                    label,
                                    variant: 'outlined',
                                    classification: alert.classification
                                  }))
                                : null
                            }
                          />
                        )}
                      </SectionContent>
                    </Grid>
                  </>
                ) : null}

                {/* Attack Section */}
                {!alert || alert.attack.category.length !== 0 ? (
                  <>
                    <Grid size={{ xs: 3, sm: 2 }}>{t('attack')}</Grid>
                    <Grid size={{ xs: 9, sm: 10 }}>
                      <SectionContent>
                        <Grid container spacing={1}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" style={{ marginRight: theme.spacing(1) }} component="div">
                              <i>{t('attack_category')}</i>
                            </Typography>
                            {alert && alert.al.detailed ? (
                              <AutoHideChipList
                                category={null}
                                defaultClassification={alert.classification}
                                index="/result"
                                items={alert.al.detailed.attack_category}
                                type="result.sections.heuristic.attack.categories"
                              />
                            ) : (
                              <ActionableChipList
                                items={
                                  alert
                                    ? alert.attack.category.map(label => ({
                                        label,
                                        variant: 'outlined',
                                        classification: alert.classification
                                      }))
                                    : null
                                }
                              />
                            )}
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" style={{ marginRight: theme.spacing(1) }} component="div">
                              <i>{t('attack_pattern')}</i>
                            </Typography>
                            {alert && alert.al.detailed ? (
                              <AutoHideChipList
                                category={null}
                                defaultClassification={alert.classification}
                                index="/result"
                                items={alert.al.detailed.attack_pattern}
                                type="result.sections.heuristic.attack.pattern"
                              />
                            ) : (
                              <ActionableChipList
                                items={
                                  alert
                                    ? alert.attack.pattern.map(label => ({
                                        label,
                                        variant: 'outlined',
                                        classification: alert.classification
                                      }))
                                    : null
                                }
                              />
                            )}
                          </Grid>
                        </Grid>
                      </SectionContent>
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </>
          )}
        </div>
      </PageFullWidth>
    </Wrapper>
  ) : (
    <ForbiddenPage />
  );
};

const AlertDetailContent = React.memo(WrappedAlertDetailContent);

const WrappedAlertDetail = (props: Props) => (
  <SearchParamsProvider
    defaultValue={ALERT_DEFAULT_PARAMS}
    hidden={['rows', 'offset', 'tc_start', 'track_total_hits']}
    enforced={['rows']}
  >
    <AlertDetailContent {...props} />
  </SearchParamsProvider>
);

export const AlertDetail = React.memo(WrappedAlertDetail);
export default AlertDetail;
