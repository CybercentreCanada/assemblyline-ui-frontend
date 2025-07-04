import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import type { CardProps, SwitchProps, TooltipProps } from '@mui/material';
import { Card, Grid, Skeleton, styled, Switch, Tooltip, Typography, useTheme } from '@mui/material';
import { useAppUser } from 'commons/components/app/hooks';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { AlerterMessage } from 'components/models/messages/alerter_heartbeat';
import type { ArchiveMessage } from 'components/models/messages/archive_heartbeat';
import type { DispatcherMessage } from 'components/models/messages/dispatcher_heartbeat';
import type { ElasticMessage } from 'components/models/messages/elastic_heartbeat';
import type { ExpiryMessage } from 'components/models/messages/expiry_heartbeat';
import type { IngestMessage } from 'components/models/messages/ingest_heartbeat';
import type { RetrohuntMessage } from 'components/models/messages/retrohunt_heartbeat';
import type { ScalerMessage } from 'components/models/messages/scaler_heartbeat';
import type { ScalerStatusMessage } from 'components/models/messages/scaler_status_heartbeat';
import type { ServiceMessage } from 'components/models/messages/service_heartbeat';
import type { CustomUser } from 'components/models/ui/user';
import ArcGauge from 'components/visual/ArcGauge';
import type { CustomChipProps } from 'components/visual/CustomChip';
import CustomChip from 'components/visual/CustomChip';
import { bytesToSize, humanSeconds, sumValues } from 'helpers/utils';
import type { AnyActionArg, CSSProperties, ReactNode } from 'react';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';

const NAMESPACE = '/status';

type StyledCardProps = CardProps & {
  disabled?: boolean;
  error?: boolean;
};

const CoreCard = styled(Card, {
  shouldForwardProp: prop => prop !== 'error' && prop !== 'disabled'
})<StyledCardProps>(({ theme, disabled = false, error = false }) => ({
  flexGrow: 1,
  padding: theme.spacing(1),
  minHeight: '120px',
  '&:hover': {
    boxShadow: theme.shadows[6]
  },

  ...(disabled
    ? {
        color: theme.palette.text.disabled,
        backgroundColor: theme.palette.mode === 'dark' ? '#63636317' : '#EAEAEA',
        border: `solid 1px ${theme.palette.divider}`
      }
    : error
      ? {
          backgroundColor: theme.palette.mode === 'dark' ? '#ff000017' : '#FFE4E4',
          border: `solid 1px ${theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark}`
        }
      : {
          border: `solid 1px ${theme.palette.divider}`
        })
}));

const TitleBox = styled('div')(() => ({
  fontWeight: 500,
  fontSize: '120%'
}));

const ErrorIcon = styled('div')(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
  float: 'right'
}));

type MetricCounterProps = {
  init: boolean;
  margin?: CSSProperties['margin'];
  title: CustomChipProps['label'];
  tooltip: TooltipProps['title'];
  value: string | number | ReactNode;
};

const WrappedMetricCounter = ({ value, title, tooltip, init = false, margin = '8px' }: MetricCounterProps) => {
  const theme = useTheme();

  return !init ? (
    <Skeleton
      variant="rectangular"
      height="1.5rem"
      width="2rem"
      style={{ borderRadius: '4px', marginRight: margin, display: 'inline-block', verticalAlign: 'middle' }}
    />
  ) : (
    <Tooltip title={tooltip}>
      <span
        style={{
          display: 'inline-block',
          marginRight: theme.spacing(1)
        }}
      >
        <CustomChip size="tiny" type="rounded" mono label={title} />
        {value}
      </span>
    </Tooltip>
  );
};
const MetricCounter = React.memo(WrappedMetricCounter);

type IngestCardProps = {
  ingester: IngestMessage['msg'];
  status: boolean;
  handleStatusChange: SwitchProps['onChange'];
};

const WrappedIngestCard = ({ ingester, status, handleStatusChange }: IngestCardProps) => {
  const { t } = useTranslation(['dashboard']);
  const theme = useTheme();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const [error, setError] = useState<string>(null);

  const busyness = useMemo<number>(
    () => (ingester.metrics.cpu_seconds * ingester.metrics.cpu_seconds_count) / ingester.instances / 60,
    [ingester.instances, ingester.metrics.cpu_seconds, ingester.metrics.cpu_seconds_count]
  );

  useEffect(() => {
    if (ingester.processing_chance.critical !== 1) {
      setError(t('ingest.error.chance.critical'));
    } else if (ingester.processing_chance.high !== 1) {
      setError(t('ingest.error.chance.high'));
    } else if (ingester.processing_chance.medium !== 1) {
      setError(t('ingest.error.chance.medium'));
    } else if (ingester.processing_chance.low !== 1) {
      setError(t('ingest.error.chance.low'));
    } else if (ingester.metrics.bytes_completed === 0 && ingester.metrics.bytes_ingested !== 0) {
      setError(t('ingest.error.bytes'));
    } else if (ingester.ingest > 100000) {
      setError(t('ingest.error.queue'));
    } else if ((timer !== null && ingester.initialized) || (timer === null && !ingester.initialized)) {
      if (error !== null) setError(null);
      if (timer !== null) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setError(t('timeout'));
        }, 10000)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingester]);

  return (
    <CoreCard disabled={!status} error={!!error || !!ingester.error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {status && (error || ingester.error) && (
            <Tooltip title={error || ingester.error}>
              <ErrorIcon>
                <ErrorOutlineOutlinedIcon />
              </ErrorIcon>
            </Tooltip>
          )}
          <TitleBox>
            {`${t('ingester')} :: x${ingester.instances}`}
            {status !== null && (
              <Tooltip title={t(`ingest.status.${status}`)}>
                <div style={{ marginLeft: '8px', display: 'inline' }}>
                  <Switch
                    checked={status}
                    disabled={!currentUser.is_admin}
                    checkedIcon={<PlayCircleOutlineIcon fontSize="small" />}
                    icon={<PauseCircleOutlineIcon fontSize="small" />}
                    onChange={handleStatusChange}
                  />
                </div>
              </Tooltip>
            )}
          </TitleBox>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <div>
            <label>{t('ingest')}</label>
          </div>
          <div>
            <MetricCounter
              init={ingester.initialized}
              value={ingester.queues.ingest}
              title="Q"
              tooltip={t('ingest.queue')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <div>
            <label>{t('queued')}</label>
          </div>
          <div>
            <MetricCounter
              init={ingester.initialized}
              value={
                ingester.processing_chance.critical === 1
                  ? ingester.queues.critical
                  : `${ingester.queues.critical} (${Math.round(ingester.processing_chance.critical * 100)}%)`
              }
              title="C"
              tooltip={t('ingest.critical')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={
                ingester.processing_chance.high === 1
                  ? ingester.queues.high
                  : `${ingester.queues.high} (${Math.round(ingester.processing_chance.high * 100)}%)`
              }
              title="H"
              tooltip={t('ingest.high')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={
                ingester.processing_chance.medium === 1
                  ? ingester.queues.medium
                  : `${ingester.queues.medium} (${Math.round(ingester.processing_chance.medium * 100)}%)`
              }
              title="M"
              tooltip={t('ingest.medium')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={
                ingester.processing_chance.low === 1
                  ? ingester.queues.low
                  : `${ingester.queues.low} (${Math.round(ingester.processing_chance.low * 100)}%)`
              }
              title="L"
              tooltip={t('ingest.low')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <div>
            <label>{t('processing')}</label>
          </div>
          <div>
            <MetricCounter
              init={ingester.initialized}
              value={ingester.processing.inflight}
              title="I"
              tooltip={t('processing.inflight')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={ingester.queues.complete}
              title="C"
              tooltip={t('processing.complete')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={`${Number(busyness * 100).toFixed(2)} %`}
              title="B"
              tooltip={t('throughput.busy')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <div>
            <label>{t('caching')}</label>
          </div>
          <div>
            <MetricCounter
              init={ingester.initialized}
              value={ingester.metrics.cache_hit}
              title="H"
              tooltip={t('caching.hits')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={ingester.metrics.cache_miss}
              title="M"
              tooltip={t('caching.miss')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <div>
            <label>{t('throughput')}</label>
          </div>
          <div>
            <MetricCounter
              init={ingester.initialized}
              value={ingester.metrics.files_completed}
              title="F"
              tooltip={t('throughput.files_completed')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={ingester.metrics.submissions_completed}
              title="C"
              tooltip={t('throughput.submissions_completed')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={ingester.metrics.whitelisted}
              title="W"
              tooltip={t('throughput.whitelisted')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={ingester.metrics.skipped}
              title="S"
              tooltip={t('throughput.skipped')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={ingester.metrics.duplicates}
              title="D"
              tooltip={t('throughput.duplicates')}
            />
            <MetricCounter
              init={ingester.initialized}
              value={ingester.metrics.error}
              title="E"
              tooltip={t('throughput.error')}
              margin="16px"
            />
            <Tooltip title={t('throughput.bytes')}>
              <span style={{ display: 'inline-block' }}>
                <SpeedOutlinedIcon
                  sx={{
                    marginRight: '4px',
                    verticalAlign: 'middle',
                    height: '20px',
                    color: theme.palette.action.active
                  }}
                />
                {ingester.initialized ? (
                  `${Number(
                    ((1.0 * ingester.metrics.bytes_completed) / ((1024 * 1024 * 60) / 8)).toFixed(2)
                  )} / ${Number(((1.0 * ingester.metrics.bytes_ingested) / ((1024 * 1024 * 60) / 8)).toFixed(2))} Mbps`
                ) : (
                  <Skeleton height="1.5rem" width="3rem" style={{ display: 'inline-block' }} />
                )}
              </span>
            </Tooltip>
          </div>
        </Grid>
      </Grid>
    </CoreCard>
  );
};

type DispatcherCardProps = {
  dispatcher: DispatcherMessage['msg'];
  status: boolean;
  up: string[];
  down: string[];
  handleStatusChange: SwitchProps['onChange'];
};

const WrappedDispatcherCard = ({ dispatcher, up, down, status, handleStatusChange }: DispatcherCardProps) => {
  const { t } = useTranslation(['dashboard']);
  const theme = useTheme();

  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const [error, setError] = useState<string>(null);

  const busyness = (dispatcher.metrics.cpu_seconds * dispatcher.metrics.cpu_seconds_count) / dispatcher.instances / 60;
  const startQueue = dispatcher.queues.start.reduce((x, y) => x + y, 0);
  const resultQueue = dispatcher.queues.result.reduce((x, y) => x + y, 0);
  const commandQueue = dispatcher.queues.command.reduce((x, y) => x + y, 0);
  const { user: currentUser } = useAppUser<CustomUser>();

  useEffect(() => {
    if (dispatcher.initialized && dispatcher.queues.ingest >= dispatcher.inflight.max / 10) {
      setError(t('dispatcher.error.queue.ingest'));
    } else if (dispatcher.initialized && dispatcher.metrics.save_queue >= dispatcher.inflight.max / 10) {
      setError(t('dispatcher.error.queue.save'));
    } else if (dispatcher.initialized && dispatcher.metrics.error_queue >= dispatcher.inflight.max / 10) {
      setError(t('dispatcher.error.queue.error'));
    } else if (dispatcher.initialized && startQueue >= dispatcher.inflight.max / 10) {
      setError(t('dispatcher.error.queue.start'));
    } else if (dispatcher.initialized && resultQueue >= dispatcher.inflight.max / 10) {
      setError(t('dispatcher.error.queue.result'));
    } else if (dispatcher.initialized && commandQueue >= dispatcher.inflight.max / 10) {
      setError(t('dispatcher.error.queue.command'));
    } else if (dispatcher.inflight.outstanding / dispatcher.inflight.max > 0.9) {
      setError(t('dispatcher.error.inflight'));
    } else if ((timer !== null && dispatcher.initialized) || (timer === null && !dispatcher.initialized)) {
      if (error !== null) setError(null);
      if (timer !== null) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setError(t('timeout'));
        }, 10000)
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatcher]);

  return (
    <CoreCard disabled={!status} error={!!error || !!dispatcher.error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {status && (error || dispatcher.error) && (
            <Tooltip title={error || dispatcher.error}>
              <ErrorIcon>
                <ErrorOutlineOutlinedIcon />
              </ErrorIcon>
            </Tooltip>
          )}
          <TitleBox>
            {`${t('dispatcher')} :: x${dispatcher.instances}`}
            {status !== null && (
              <Tooltip title={t(`dispatcher.status.${status}`)}>
                <div style={{ marginLeft: '8px', display: 'inline' }}>
                  <Switch
                    checked={status}
                    disabled={!currentUser.is_admin}
                    checkedIcon={<PlayCircleOutlineIcon fontSize="small" />}
                    icon={<PauseCircleOutlineIcon fontSize="small" />}
                    onChange={handleStatusChange}
                  />
                </div>
              </Tooltip>
            )}
          </TitleBox>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <div>
            <label>{t('services')}</label>
          </div>
          {dispatcher.initialized ? (
            <div>
              {up.length === 0 && down.length === 0 && (
                <span style={{ color: theme.palette.text.secondary }}>{t('no_services')}</span>
              )}
              {up.length !== 0 && <span>{up.sort().join(' | ')}</span>}
              {up.length !== 0 && down.length !== 0 && <span> :: </span>}
              {down.length !== 0 && <span>{down.sort().join(' | ')}</span>}
            </div>
          ) : (
            <div>
              <Skeleton />
            </div>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
          <div>
            <label>{t('submissions')}</label>
          </div>
          <div>
            <MetricCounter
              init={dispatcher.initialized}
              value={
                <span>
                  {dispatcher.inflight.outstanding} / {dispatcher.inflight.max}
                </span>
              }
              title="O"
              tooltip={t('submissions.outstanding')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <div>
            <label>{t('queued')}</label>
          </div>
          <div>
            <MetricCounter
              init={dispatcher.initialized}
              value={dispatcher.queues.ingest}
              title="W"
              tooltip={t('queues.wait')}
            />
            {dispatcher.queues.start.length > 0 && (
              <MetricCounter
                init={dispatcher.initialized}
                value={startQueue}
                title="P"
                tooltip={t('queues.processing')}
              />
            )}
            {dispatcher.queues.result.length > 0 && (
              <MetricCounter
                init={dispatcher.initialized}
                value={resultQueue}
                title="R"
                tooltip={t('queues.svc_result')}
              />
            )}
            <MetricCounter
              init={dispatcher.initialized}
              value={dispatcher.metrics.save_queue}
              title="S"
              tooltip={t('queues.save')}
            />
            <MetricCounter
              init={dispatcher.initialized}
              value={dispatcher.metrics.error_queue}
              title="E"
              tooltip={t('queues.error_saving')}
            />
            {dispatcher.queues.command.length > 0 && (
              <MetricCounter
                init={dispatcher.initialized}
                value={commandQueue}
                title="C"
                tooltip={t('queues.command')}
              />
            )}
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
          <div>
            <label>{t('busyness')}</label>
          </div>
          <div>
            <MetricCounter
              init={dispatcher.initialized}
              value={`${Number(busyness * 100).toFixed(2)} %`}
              title="B"
              tooltip={t('throughput.busy')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <div>
            <label>{t('throughput')}</label>
          </div>
          <div>
            <MetricCounter
              init={dispatcher.initialized}
              value={dispatcher.metrics.files_completed}
              title="F"
              tooltip={t('throughput.files_completed')}
            />
            <MetricCounter
              init={dispatcher.initialized}
              value={dispatcher.metrics.submissions_completed}
              title="S"
              tooltip={t('throughput.submissions_completed')}
            />
          </div>
        </Grid>
      </Grid>
    </CoreCard>
  );
};

type ArchiveCardProps = {
  archive: ArchiveMessage['msg'];
};

const WrappedArchiveCard = ({ archive }: ArchiveCardProps) => {
  const { t } = useTranslation(['dashboard']);

  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const [error, setError] = useState<string>(null);

  useEffect(() => {
    if (archive.initialized && archive.metrics.exception > 0) {
      setError(t('archive.error.exception'));
    } else if (archive.initialized && archive.metrics.invalid > 0) {
      setError(t('archive.error.invalid'));
    } else if (archive.initialized && archive.metrics.not_found > 0) {
      setError(t('archive.error.not_found'));
    } else if ((timer !== null && archive.initialized) || (timer === null && !archive.initialized)) {
      if (error !== null) setError(null);
      if (timer !== null) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setError(t('timeout'));
        }, 10000)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archive]);

  return (
    <CoreCard error={!!error || !!archive.error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {(error || archive.error) && (
            <Tooltip title={error || archive.error}>
              <ErrorIcon>
                <ErrorOutlineOutlinedIcon />
              </ErrorIcon>
            </Tooltip>
          )}
          <TitleBox>{`${t('archiver')} :: x${archive.instances}`}</TitleBox>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <div>
            <label>{t('queued')}</label>
          </div>
          <div>
            <MetricCounter init={archive.initialized} value={archive.queued} title="Q" tooltip={t('archive.queue')} />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <div>
            <label>{t('throughput')}</label>
          </div>
          <div>
            <MetricCounter
              init={archive.initialized}
              value={archive.metrics.submission}
              title="S"
              tooltip={t('archived.submission')}
            />
            <MetricCounter
              init={archive.initialized}
              value={archive.metrics.file}
              title="F"
              tooltip={t('archived.file')}
            />
            <MetricCounter
              init={archive.initialized}
              value={archive.metrics.result}
              title="R"
              tooltip={t('archived.result')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <div>
            <label>{t('archived.error')}</label>
          </div>
          <div>
            <MetricCounter
              init={archive.initialized}
              value={archive.metrics.exception}
              title="E"
              tooltip={t('archived.exception')}
            />
            <MetricCounter
              init={archive.initialized}
              value={archive.metrics.invalid}
              title="I"
              tooltip={t('archived.invalid')}
            />
            <MetricCounter
              init={archive.initialized}
              value={archive.metrics.not_found}
              title="N"
              tooltip={t('archived.not_found')}
            />
          </div>
        </Grid>
      </Grid>
    </CoreCard>
  );
};

type ExpiryCardProps = {
  expiry: ExpiryMessage['msg'];
};

const WrappedExpiryCard = ({ expiry }: ExpiryCardProps) => {
  const { t } = useTranslation(['dashboard']);
  const { configuration } = useALContext();

  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const [error, setError] = useState<string>(null);

  useEffect(() => {
    if (expiry.initialized && sumValues(expiry.queues) > 0 && sumValues(expiry.metrics) === 0) {
      setError(t('expiry.error.not_expiring'));
    } else if ((timer !== null && expiry.initialized) || (timer === null && !expiry.initialized)) {
      if (error !== null) setError(null);
      if (timer !== null) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setError(t('timeout'));
        }, 10000)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiry]);

  return (
    <CoreCard error={!!error || !!expiry.error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {(error || expiry.error) && (
            <Tooltip title={error || expiry.error}>
              <ErrorIcon>
                <ErrorOutlineOutlinedIcon />
              </ErrorIcon>
            </Tooltip>
          )}
          <TitleBox>{`${t('expiry')} :: x${expiry.instances}`}</TitleBox>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <div>
            <label>{t('queued')}</label>
          </div>
          <div>
            <MetricCounter
              init={expiry.initialized}
              value={expiry.queues.alert}
              title="A"
              tooltip={t('queues.alert')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.queues.error}
              title="E"
              tooltip={t('queues.error')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.queues.cached_file + expiry.queues.file + expiry.queues.filescore}
              title="F"
              tooltip={t('queues.file')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.queues.result + expiry.queues.emptyresult}
              title="R"
              tooltip={t('queues.result')}
            />
            {configuration?.retrohunt?.enabled && (
              <MetricCounter
                init={expiry.initialized}
                value={expiry.queues.retrohunt_hit}
                title="R"
                tooltip={t('queues.retrohunt_hit')}
              />
            )}

            <MetricCounter
              init={expiry.initialized}
              value={expiry.queues.submission + expiry.queues.submission_summary + expiry.queues.submission_tree}
              title="S"
              tooltip={t('queues.submission')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.queues.badlist}
              title="B"
              tooltip={t('queues.badlist')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.queues.safelist}
              title="S"
              tooltip={t('queues.safelist')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <div>
            <label>{t('throughput')}</label>
          </div>
          <div>
            <MetricCounter
              init={expiry.initialized}
              value={expiry.metrics.alert}
              title="A"
              tooltip={t('expired.alert')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.metrics.error}
              title="E"
              tooltip={t('expired.error')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.metrics.cached_file + expiry.metrics.file + expiry.metrics.filescore}
              title="F"
              tooltip={t('expired.file')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.metrics.result + expiry.metrics.emptyresult}
              title="R"
              tooltip={t('expired.result')}
            />
            {configuration?.retrohunt?.enabled && (
              <MetricCounter
                init={expiry.initialized}
                value={expiry.metrics.retrohunt_hit}
                title="R"
                tooltip={t('expired.retrohunt_hit')}
              />
            )}

            <MetricCounter
              init={expiry.initialized}
              value={expiry.metrics.submission + expiry.metrics.submission_summary + expiry.metrics.submission_tree}
              title="S"
              tooltip={t('expired.submission')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.metrics.badlist}
              title="B"
              tooltip={t('expired.badlist')}
            />
            <MetricCounter
              init={expiry.initialized}
              value={expiry.metrics.safelist}
              title="S"
              tooltip={t('expired.safelist')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} />
      </Grid>
    </CoreCard>
  );
};

type AlerterCardProps = {
  alerter: AlerterMessage['msg'];
};

const WrappedAlerterCard = ({ alerter }: AlerterCardProps) => {
  const { t } = useTranslation(['dashboard']);

  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const [error, setError] = useState<string>(null);

  useEffect(() => {
    if (alerter.metrics.error > 0) {
      setError(t('alerter.error'));
    } else if ((timer !== null && alerter.initialized) || (timer === null && !alerter.initialized)) {
      if (error !== null) setError(null);
      if (timer !== null) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setError(t('timeout'));
        }, 10000)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerter]);

  return (
    <CoreCard error={!!error || !!alerter.error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {(error || alerter.error) && (
            <Tooltip title={error || alerter.error}>
              <ErrorIcon>
                <ErrorOutlineOutlinedIcon />
              </ErrorIcon>
            </Tooltip>
          )}
          <TitleBox>{`${t('alerter')} :: x${alerter.instances}`}</TitleBox>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <div>
            <label>{t('queued')}</label>
          </div>
          <div>
            <MetricCounter
              init={alerter.initialized}
              value={alerter.queues.alert}
              title="A"
              tooltip={t('queues.alert')}
            />
            <MetricCounter
              init={alerter.initialized}
              value={alerter.queues.alert_retry}
              title="R"
              tooltip={t('queues.alert_retry')}
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <div>
            <label>{t('throughput')}</label>
          </div>
          <div>
            <MetricCounter
              init={alerter.initialized}
              value={alerter.metrics.created}
              title="C"
              tooltip={t('throughput.created')}
            />
            <MetricCounter
              init={alerter.initialized}
              value={alerter.metrics.error}
              title="E"
              tooltip={t('throughput.error')}
            />
            <MetricCounter
              init={alerter.initialized}
              value={alerter.metrics.received}
              title="R"
              tooltip={t('throughput.received')}
            />
            <MetricCounter
              init={alerter.initialized}
              value={alerter.metrics.updated}
              title="U"
              tooltip={t('throughput.updated')}
            />
            <MetricCounter
              init={alerter.initialized}
              value={alerter.metrics.wait}
              title="W"
              tooltip={t('throughput.wait')}
            />
          </div>
        </Grid>
      </Grid>
    </CoreCard>
  );
};

type ScalerResourcesCardProps = {
  scaler: ScalerMessage['msg'];
};

const WrappedScalerResourcesCard = ({ scaler }: ScalerResourcesCardProps) => {
  const { t } = useTranslation(['dashboard']);

  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const [error, setError] = useState<string>(null);

  useEffect(() => {
    if ((timer !== null && scaler.initialized) || (timer === null && !scaler.initialized)) {
      if (error !== null) setError(null);
      if (timer !== null) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setError(t('timeout'));
        }, 10000)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scaler]);

  return (
    <CoreCard error={!!error || !!scaler.error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {(error || scaler.error) && (
            <Tooltip title={error || scaler.error}>
              <ErrorIcon>
                <ErrorOutlineOutlinedIcon />
              </ErrorIcon>
            </Tooltip>
          )}
          <TitleBox>{t('resources')}</TitleBox>
        </Grid>
        <Grid size={{ xs: 6 }} style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block' }}>
            <ArcGauge
              initialized={scaler ? scaler.initialized : false}
              pctValue={
                scaler.metrics.cpu_total === 0
                  ? 0
                  : ((scaler.metrics.cpu_total - scaler.metrics.cpu_free) / scaler.metrics.cpu_total) * 100
              }
              title={t('cpu')}
              caption={`${Number((scaler.metrics.cpu_total - scaler.metrics.cpu_free).toFixed(1))} / ${Number(
                scaler.metrics.cpu_total.toFixed(1)
              )} ${t('cores')}`}
              width="120px"
            />
          </div>
        </Grid>
        <Grid size={{ xs: 6 }} style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block' }}>
            <ArcGauge
              initialized={scaler ? scaler.initialized : false}
              pctValue={
                scaler.metrics.memory_total === 0
                  ? 0
                  : ((scaler.metrics.memory_total - scaler.metrics.memory_free) / scaler.metrics.memory_total) * 100
              }
              title={t('ram')}
              caption={`${Number(
                ((scaler.metrics.memory_total - scaler.metrics.memory_free) / 1024).toFixed(1)
              )} / ${Number((scaler.metrics.memory_total / 1024).toFixed(1))} ${t('gb')}`}
              width="120px"
            />
          </div>
        </Grid>
      </Grid>
    </CoreCard>
  );
};

type ServiceCardProps = {
  service: ServiceMessage['msg'];
  max_inflight: number;
};

const WrappedServiceCard = ({ service, max_inflight }: ServiceCardProps) => {
  const { t } = useTranslation(['dashboard']);

  const [error, setError] = useState<string>(null);

  useEffect(() => {
    if (service.scaler.target !== 0 && service.instances === 0) {
      setError(t('service.error.none'));
    } else if (service.metrics.fail_nonrecoverable > 0) {
      setError(t('service.error.fail_nonrecoverable'));
    } else if (service.queue > max_inflight / 4) {
      setError(t('service.error.queue'));
    } else if (error !== null) {
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  return (
    <CoreCard error={!!error || !!service.error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {(error || service.error) && (
            <Tooltip title={error || service.error}>
              <ErrorIcon>
                <ErrorOutlineOutlinedIcon />
              </ErrorIcon>
            </Tooltip>
          )}
          <TitleBox>{`${service.service_name} :: ${service.instances} / ${service.scaler.target}`}</TitleBox>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <MetricCounter init value={service.queue} title="Q" tooltip={t('service.queue')} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <MetricCounter init value={service.activity.busy} title="B" tooltip={t('service.busy')} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <MetricCounter init value={service.metrics.execute} title="P" tooltip={t('service.processed')} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <MetricCounter init value={service.metrics.fail_nonrecoverable} title="F" tooltip={t('service.failed')} />
          <MetricCounter init value={service.metrics.fail_recoverable} title="R" tooltip={t('service.retried')} />
        </Grid>
      </Grid>
    </CoreCard>
  );
};

const WARN_SHARD_SIZE = 40_000_000_000;

type ElasticCardProps = {
  elastic: ElasticMessage['msg'];
};

const WrappedElasticCard = ({ elastic }: ElasticCardProps) => {
  const { t } = useTranslation(['dashboard']);

  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const [error, setError] = useState<string>(null);

  let largestIndex: string = null;
  let shardSize: number = null;
  if (elastic.shard_sizes.length > 0) {
    const row = elastic.shard_sizes.reduce((a, b) => (a.shard_size > b.shard_size ? a : b));
    largestIndex = row.name;
    shardSize = row.shard_size;
  }

  useEffect(() => {
    if (elastic.initialized && elastic.instances === 0) {
      setError(t('elasticsearch.error.none'));
    } else if (elastic.initialized && elastic.request_time > 0.1) {
      setError(t('elasticsearch.error.slow'));
    } else if (elastic.initialized && elastic.unassigned_shards > 0) {
      setError(t('elasticsearch.error.unassigned'));
    } else if (elastic.initialized && shardSize > WARN_SHARD_SIZE) {
      setError(t('elasticsearch.error.shard_size'));
    } else if ((timer !== null && elastic.initialized) || (timer === null && !elastic.initialized)) {
      if (error !== null) setError(null);
      if (timer !== null) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setError(t('timeout'));
        }, 10000)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elastic]);

  return (
    <CoreCard error={!!error || !!elastic.error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {(error || elastic.error) && (
            <Tooltip title={error || elastic.error}>
              <ErrorIcon>
                <ErrorOutlineOutlinedIcon />
              </ErrorIcon>
            </Tooltip>
          )}
          <TitleBox>{`${t('elasticsearch')} :: x${elastic.instances}`}</TitleBox>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <MetricCounter
            init={elastic.initialized}
            value={humanSeconds(elastic.request_time, t)}
            title="P"
            tooltip={t('elasticsearch.ping')}
          />
          <MetricCounter
            init={elastic.initialized}
            value={elastic.unassigned_shards}
            title="U"
            tooltip={t('elasticsearch.unassigned')}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <div>
            <label>{t('big_index')}</label>
          </div>
          <MetricCounter
            init={elastic.initialized}
            value={largestIndex}
            title="I"
            tooltip={t('elasticsearch.shard.index')}
          />
          <MetricCounter
            init={elastic.initialized}
            value={bytesToSize(shardSize)}
            title="S"
            tooltip={t('elasticsearch.shard.size')}
          />
        </Grid>
      </Grid>
    </CoreCard>
  );
};

const WARN_RETROHUNT_STORAGE = 10_000_000_000;

type RetrohuntCardProps = {
  retrohunt: RetrohuntMessage['msg'];
};

const WrappedRetrohuntCard = ({ retrohunt }: RetrohuntCardProps) => {
  const { t } = useTranslation(['dashboard']);

  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const [error, setError] = useState<string>(null);

  let pendingFiles: number | string = retrohunt.pending_files;
  if (pendingFiles === 1_000_000) {
    pendingFiles = pendingFiles.toString() + '+';
  }

  useEffect(() => {
    if (retrohunt.initialized && retrohunt.instances === 0) {
      setError(t('retrohunt.error.none'));
    } else if (retrohunt.initialized && retrohunt.worker_storage_available < WARN_RETROHUNT_STORAGE) {
      setError(t('retrohunt.error.storage'));
    } else if ((timer !== null && retrohunt.initialized) || (timer === null && !retrohunt.initialized)) {
      if (error !== null) setError(null);
      if (timer !== null) clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setError(t('timeout'));
        }, 10000)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrohunt]);

  return (
    <CoreCard error={!!error || !!retrohunt.error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          {(error || retrohunt.error) && (
            <Tooltip title={error || retrohunt.error}>
              <ErrorIcon>
                <ErrorOutlineOutlinedIcon />
              </ErrorIcon>
            </Tooltip>
          )}
          <TitleBox>{`${t('retrohunt')} :: x${retrohunt.instances}`}</TitleBox>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <MetricCounter
            init={retrohunt.initialized}
            value={humanSeconds(retrohunt.request_time, t)}
            title="P"
            tooltip={t('retrohunt.request_time')}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <div>
            <label>{t('retrohunt.label.stats')}</label>
          </div>
          <MetricCounter
            init={retrohunt.initialized}
            value={retrohunt.active_searches}
            title="A"
            tooltip={t('retrohunt.active_searches')}
          />
          <MetricCounter
            init={retrohunt.initialized}
            value={pendingFiles}
            title="F"
            tooltip={t('retrohunt.pending_files')}
          />
          <MetricCounter
            init={retrohunt.initialized}
            value={retrohunt.ingested_last_minute}
            title="I"
            tooltip={t('retrohunt.ingested')}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <div>
            <label>{t('retrohunt.label.worker')}</label>
          </div>
          <MetricCounter
            init={retrohunt.initialized}
            value={retrohunt.last_minute_cpu.toFixed(1)}
            title="C"
            tooltip={t('retrohunt.cpu_minute')}
          />
          <MetricCounter
            init={retrohunt.initialized}
            value={bytesToSize(retrohunt.total_memory_used)}
            title="M"
            tooltip={t('retrohunt.memory')}
          />
          <MetricCounter
            init={retrohunt.initialized}
            value={bytesToSize(retrohunt.worker_storage_available)}
            title="S"
            tooltip={t('retrohunt.worker_storage')}
          />
        </Grid>
      </Grid>
    </CoreCard>
  );
};

const IngestCard = React.memo(WrappedIngestCard);
const DispatcherCard = React.memo(WrappedDispatcherCard);
const ExpiryCard = React.memo(WrappedExpiryCard);
const ArchiveCard = React.memo(WrappedArchiveCard);
const AlerterCard = React.memo(WrappedAlerterCard);
const ScalerResourcesCard = React.memo(WrappedScalerResourcesCard);
const ServiceCard = React.memo(WrappedServiceCard);
const ElasticCard = React.memo(WrappedElasticCard);
const RetrohuntCard = React.memo(WrappedRetrohuntCard);

type ServicesList = {
  up: string[] | any;
  down: string[] | any;
  timing: Record<string, number>;
};

const basicReducer = <T extends object>(state: T, newState: T) => ({ ...state, ...newState });

const serviceReducer = (
  state: Record<string, ServiceMessage['msg']>,
  serviceState: { type: 'service' | 'scaler'; hb: ScalerStatusMessage['msg'] | ServiceMessage['msg'] }
) => {
  const { type: hbType, hb } = serviceState;
  const current = state[hb.service_name] || {};
  if (hbType === 'scaler') {
    const newState = {};
    newState[hb.service_name] = {
      ...DEFAULT_SERVICE,
      ...current,
      service_name: hb.service_name,
      scaler: hb.metrics
    };
    return { ...state, ...newState };
  }

  const newState = {};
  newState[hb.service_name] = {
    ...DEFAULT_SERVICE,
    ...current,
    ...hb
  };
  return { ...state, ...newState };
};

const serviceListReducer = (state: ServicesList, serviceName: string) => {
  const { up, down, timing } = state;
  const curTime = Math.floor(new Date().getTime() / 1000);
  timing[serviceName] = curTime;
  if (up.indexOf(serviceName) === -1) {
    up.push(serviceName);
  }
  if (down.indexOf(serviceName) !== -1) {
    // This is a bug
    down.pop(serviceName);
  }

  return { up, down, timing };
};

const DEFAULT_ALERTER = {
  instances: 0,
  queues: {
    alert: 0,
    alert_retry: 0
  },
  metrics: {
    created: 0,
    error: 0,
    received: 0,
    updated: 0,
    wait: 0
  },
  error: null,
  initialized: false
} as AlerterMessage['msg'];

const DEFAULT_DISPATCHER = {
  instances: 0,
  inflight: {
    outstanding: 0,
    max: 0,
    per_instance: []
  },
  queues: {
    ingest: 0,
    files: 0,
    start: [],
    result: [],
    command: []
  },
  metrics: {
    busy_seconds: 0,
    busy_seconds_count: 0,
    cpu_seconds: 0,
    cpu_seconds_count: 0,
    files_completed: 0,
    submissions_completed: 0
  },
  error: null,
  initialized: false
} as DispatcherMessage['msg'];

const DEFAULT_ARCHIVE = {
  instances: 0,
  metrics: {
    exception: 0,
    file: 0,
    invalid: 0,
    not_found: 0,
    received: 0,
    result: 0,
    submission: 0
  },
  error: null,
  initialized: false,
  queued: 0
} as ArchiveMessage['msg'];

const DEFAULT_EXPIRY = {
  instances: 0,
  queues: {
    alert: 0,
    badlist: 0,
    cached_file: 0,
    emptyresult: 0,
    error: 0,
    file: 0,
    filescore: 0,
    result: 0,
    retrohunt_hit: 0,
    safelist: 0,
    submission: 0,
    submission_tree: 0,
    submission_summary: 0
  },
  metrics: {
    alert: 0,
    badlist: 0,
    cached_file: 0,
    emptyresult: 0,
    error: 0,
    file: 0,
    filescore: 0,
    result: 0,
    retrohunt_hit: 0,
    safelist: 0,
    submission: 0,
    submission_tree: 0,
    submission_summary: 0
  },
  error: null,
  initialized: false
} as ExpiryMessage['msg'];

const DEFAULT_INGESTER = {
  instances: 0,
  metrics: {
    busy_seconds: 0,
    busy_seconds_count: 0,
    cache_miss: 0,
    cache_expired: 0,
    cache_stale: 0,
    cache_hit_local: 0,
    cache_hit: 0,
    cpu_seconds: 0,
    cpu_seconds_count: 0,
    bytes_completed: 0,
    bytes_ingested: 0,
    duplicates: 0,
    error: 0,
    files_completed: 0,
    skipped: 0,
    submissions_completed: 0,
    submissions_ingested: 0,
    timed_out: 0,
    safelisted: 0
  },
  processing: {
    inflight: 0
  },
  processing_chance: {
    critical: 1,
    high: 1,
    medium: 1,
    low: 1
  },
  queues: {
    ingest: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  },
  error: null,
  initialized: false
} as IngestMessage['msg'];

const DEFAULT_SCALER = {
  instances: 0,
  metrics: {
    memory_total: 0,
    memory_free: 0,
    cpu_total: 0,
    cpu_free: 0
  },
  error: null,
  initialized: false
} as ScalerMessage['msg'];

const DEFAULT_SERVICE = {
  duty_cycle: 0,
  instances: 0,
  last_hb: 0,
  metrics: {
    cache_hit: 0,
    cache_miss: 0,
    cache_skipped: 0,
    execute: 0,
    fail_recoverable: 0,
    fail_nonrecoverable: 0,
    scored: 0,
    not_scored: 0
  },
  scaler: {
    running: 0,
    target: 0,
    minimum: 0,
    maximum: 0,
    dynamic_maximum: 0,
    queue: 0,
    pressure: 0.0,
    duty_cycle: 0.0
  },
  queue: 0,
  activity: {
    busy: 0,
    idle: 0
  },
  service_name: null,
  error: null
} as ServiceMessage['msg'];

const DEFAULT_SERVICE_LIST = {
  up: [],
  down: [],
  timing: {}
} as ServicesList;

const DEFAULT_ELASTIC = {
  instances: 0,
  request_time: 0,
  unassigned_shards: 0,
  shard_sizes: [],
  error: null,
  initialized: false
} as ElasticMessage['msg'];

const DEFAULT_RETROHUNT = {
  instances: 0,
  request_time: 0,
  pending_files: 0,
  ingested_last_minute: 0,
  worker_storage_available: 0,
  total_storage_available: 0,
  active_searches: 0,
  last_minute_cpu: 0,
  total_memory_used: 0,
  error: null,
  initialized: false
} as RetrohuntMessage['msg'];

const Dashboard = () => {
  const { t } = useTranslation(['dashboard']);
  const { apiCall } = useMyAPI();
  const { configuration } = useALContext();

  const [alerter, setAlerter] = useReducer<AlerterMessage['msg'], AnyActionArg>(basicReducer, DEFAULT_ALERTER);
  const [archive, setArchive] = useReducer<ArchiveMessage['msg'], AnyActionArg>(basicReducer, DEFAULT_ARCHIVE);
  const [dispatcher, setDispatcher] = useReducer<DispatcherMessage['msg'], AnyActionArg>(
    basicReducer,
    DEFAULT_DISPATCHER
  );
  const [expiry, setExpiry] = useReducer<ExpiryMessage['msg'], AnyActionArg>(basicReducer, DEFAULT_EXPIRY);
  const [ingester, setIngester] = useReducer<IngestMessage['msg'], AnyActionArg>(basicReducer, DEFAULT_INGESTER);
  const [scaler, setScaler] = useReducer<ScalerMessage['msg'], AnyActionArg>(basicReducer, DEFAULT_SCALER);
  const [elastic, setElastic] = useReducer<ElasticMessage['msg'], AnyActionArg>(basicReducer, DEFAULT_ELASTIC);
  const [retrohunt, setRetrohunt] = useReducer<RetrohuntMessage['msg'], AnyActionArg>(basicReducer, DEFAULT_RETROHUNT);
  const [services, setServices] = useReducer<Record<string, ServiceMessage['msg']>, AnyActionArg>(serviceReducer, {});
  const [servicesList, setServicesList] = useReducer<ServicesList, AnyActionArg>(
    serviceListReducer,
    DEFAULT_SERVICE_LIST
  );

  const [dispatcherStatus, setDispatcherStatus] = useState<boolean>(null);
  const [ingestStatus, setIngestStatus] = useState<boolean>(null);

  function handleIngesterStatusChange(event) {
    apiCall({
      url: `/api/v4/system/status/ingester/?active=${event.target.checked}`,
      method: 'POST',
      onSuccess: api_data => {
        if (api_data.api_response.success) {
          setIngestStatus(!ingestStatus);
        }
      }
    });
  }

  function handleDispatcherStatusChange(event) {
    apiCall({
      url: `/api/v4/system/status/dispatcher/?active=${event.target.checked}`,
      method: 'POST',
      onSuccess: api_data => {
        if (api_data.api_response.success) {
          setDispatcherStatus(!dispatcherStatus);
        }
      }
    });
  }

  function reloadStatuses() {
    apiCall({
      url: `/api/v4/system/status/ALL/`,
      onSuccess: api_data => {
        setIngestStatus(api_data.api_response.ingester);
        setDispatcherStatus(api_data.api_response.dispatcher);
      }
    });
  }

  useEffectOnce(() => {
    reloadStatuses();
    const intervalID = setInterval(reloadStatuses, 30000);

    return () => {
      clearInterval(intervalID);
    };
  });

  const handleAlerterHeartbeat = (hb: AlerterMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug('Socket-IO :: AlerterHeartbeat', hb);
    setAlerter({ ...hb, initialized: true });
  };

  const handleArchiveHeartbeat = (hb: ArchiveMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug('Socket-IO :: ArchiveHeartbeat', hb);
    setArchive({ ...hb, initialized: true });
  };

  const handleDispatcherHeartbeat = (hb: DispatcherMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug('Socket-IO :: DispatcherHeartbeat', hb);
    setDispatcher({ ...hb, initialized: true });
  };

  const handleExpiryHeartbeat = (hb: ExpiryMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug('Socket-IO :: ExpiryHeartbeat', hb);
    setExpiry({ ...hb, initialized: true });
  };

  const handleIngestHeartbeat = (hb: IngestMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug('Socket-IO :: IngestHeartbeat', hb);
    setIngester({ ...hb, initialized: true });
  };

  const handleScalerHeartbeat = (hb: ScalerMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug('Socket-IO :: ScalerHeartbeat', hb);
    setScaler({ ...hb, initialized: true });
  };

  const handleElasticHeartbeat = (hb: ElasticMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug('Socket-IO :: ElasticHeartbeat', hb);
    setElastic({ ...hb, initialized: true });
  };

  const handleRetrohuntHeartbeat = (hb: RetrohuntMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug('Socket-IO :: RetrohuntHeartbeat', hb);
    setRetrohunt({ ...hb, initialized: true });
  };

  const handleServiceHeartbeat = (hb: ServiceMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug(`Socket-IO :: ServiceHeartbeat ${hb.service_name}`, hb);
    setServicesList(hb.service_name);
    setServices({ type: 'service', hb: { ...hb, last_hb: Math.floor(new Date().getTime() / 1000) } });
  };

  const handleScalerStatusHeartbeat = (hb: ScalerStatusMessage['msg']) => {
    // eslint-disable-next-line no-console
    console.debug(`Socket-IO :: ScalerStatusHeartbeat ${hb.service_name}`, hb);
    setServices({ type: 'scaler', hb });
  };

  useEffectOnce(() => {
    const socket = io(NAMESPACE);

    socket.on('connect', () => {
      socket.emit('monitor', { status: 'start' });
      // eslint-disable-next-line no-console
      console.debug('Socket-IO :: Connecting to socketIO server...');
    });

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.debug('Socket-IO :: Disconnected from socketIO server.');
    });
    // eslint-disable-next-line no-console
    socket.on('monitoring', data => console.debug('Socket-IO :: Connected to socket server', data));

    socket.on('AlerterHeartbeat', handleAlerterHeartbeat);
    socket.on('ArchiveHeartbeat', handleArchiveHeartbeat);
    socket.on('DispatcherHeartbeat', handleDispatcherHeartbeat);
    socket.on('ExpiryHeartbeat', handleExpiryHeartbeat);
    socket.on('IngestHeartbeat', handleIngestHeartbeat);
    socket.on('ScalerHeartbeat', handleScalerHeartbeat);
    socket.on('ScalerStatusHeartbeat', handleScalerStatusHeartbeat);
    socket.on('ServiceHeartbeat', handleServiceHeartbeat);
    socket.on('ElasticHeartbeat', handleElasticHeartbeat);
    socket.on('RetrohuntHeartbeat', handleRetrohuntHeartbeat);

    return () => {
      socket.disconnect();
    };
  });

  return (
    <PageFullWidth margin={4}>
      <Typography gutterBottom color="primary" variant="h2" align="center">
        {t('title')}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <IngestCard ingester={ingester} handleStatusChange={handleIngesterStatusChange} status={ingestStatus} />
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <DispatcherCard
            dispatcher={dispatcher}
            up={servicesList.up}
            down={servicesList.down}
            handleStatusChange={handleDispatcherStatusChange}
            status={dispatcherStatus}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
            xl:
              configuration.datastore.archive.enabled && configuration.retrohunt.enabled
                ? 4
                : !configuration.datastore.archive.enabled && !configuration.retrohunt.enabled
                  ? 3
                  : 6
          }}
        >
          <ExpiryCard expiry={expiry} />
        </Grid>
        {configuration.datastore.archive.enabled && (
          <Grid size={{ xs: 12, md: 6, xl: configuration.retrohunt.enabled ? 4 : 6 }}>
            <ArchiveCard archive={archive} />
          </Grid>
        )}
        {configuration.retrohunt.enabled && (
          <Grid key="retrohunt" size={{ xs: 12, md: 6, xl: configuration.retrohunt.enabled ? 4 : 6 }}>
            <RetrohuntCard retrohunt={retrohunt} />
          </Grid>
        )}
        <Grid
          key="elastic"
          size={{
            xs: 12,
            md:
              (!configuration.datastore.archive.enabled && configuration.retrohunt.enabled) ||
              (configuration.datastore.archive.enabled && !configuration.retrohunt.enabled)
                ? 4
                : 6,
            xl: !configuration.datastore.archive.enabled && !configuration.retrohunt.enabled ? 3 : 4
          }}
        >
          <ElasticCard elastic={elastic} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md:
              (!configuration.datastore.archive.enabled && configuration.retrohunt.enabled) ||
              (configuration.datastore.archive.enabled && !configuration.retrohunt.enabled)
                ? 4
                : 8,
            xl: !configuration.datastore.archive.enabled && !configuration.retrohunt.enabled ? 3 : 4
          }}
        >
          <AlerterCard alerter={alerter} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 4,
            xl: !configuration.datastore.archive.enabled && !configuration.retrohunt.enabled ? 3 : 4
          }}
        >
          <ScalerResourcesCard scaler={scaler} />
        </Grid>
        {Object.keys(services)
          .sort()
          .map(key => (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
              <ServiceCard service={services[key]} max_inflight={dispatcher.inflight.max} />
            </Grid>
          ))}
      </Grid>
    </PageFullWidth>
  );
};

export default Dashboard;
