import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import {
  Badge,
  CircularProgress,
  CloseReason,
  Grid,
  IconButton,
  OpenReason,
  Paper,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import { DEFAULT_QUERY } from 'components/routes/alerts';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import { getValueFromPath } from 'helpers/utils';
import { To } from 'history';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { Link, useLocation } from 'react-router-dom';
import { AlertItem } from '../models/Alert';
import { buildSearchQuery, getGroupBy } from '../utils/alertUtils';
import { AlertEventsTable } from './Components';
import { AlertWorkflowDrawer } from './Workflows';

const useStyles = makeStyles(theme => ({
  verticalSpeedDialFab: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[0],
    '&.MuiFab-root': {
      backgroundColor: theme.palette.background.paper
    },
    '&.MuiFab-root:hover': {
      backgroundColor: theme.palette.action.hover
    },
    '&.MuiFab-root:active': {
      boxShadow: theme.shadows[0]
    },
    color: theme.palette.text.secondary
  },
  permanentSpeedDialFab: {
    display: 'none',
    color: theme.palette.text.secondary
  },
  permanentSpeedDial: {
    marginRight: '-6px'
  },
  actionsClosed: {
    width: 0
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  preview: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: theme.spacing(1),
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}));

type AlertActionButtonProps = {
  authorized?: boolean;
  color?: CSSProperties['color'];
  disabled?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  open?: boolean;
  permanent?: boolean;
  showSkeleton?: boolean;
  speedDial?: boolean;
  to?: To;
  tooltipTitle?: string;
  vertical?: boolean;
  onClick?: React.MouseEventHandler<any>;
};

const AlertActionButton: React.FC<AlertActionButtonProps> = React.memo(
  ({
    authorized = true,
    color = null,
    disabled = false,
    icon = null,
    loading = false,
    open = false,
    permanent = false,
    showSkeleton = false,
    speedDial = false,
    to = null,
    tooltipTitle = '',
    vertical = false,
    onClick = () => null
  }: AlertActionButtonProps) => {
    const theme = useTheme();
    const classes = useStyles();

    const Wrapper = useCallback<React.FC<{ children: React.ReactNode; href: To }>>(
      ({ children, href }) => (href ? <Link to={href}>{children}</Link> : <div>{children}</div>),
      []
    );

    if (showSkeleton)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else if (!authorized) return null;
    else if (speedDial)
      return (
        <Wrapper href={to}>
          <SpeedDialAction
            icon={
              <>
                {icon}
                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
              </>
            }
            open={open}
            tooltipTitle={tooltipTitle}
            tooltipPlacement={vertical ? 'left' : 'bottom'}
            FabProps={{
              disabled: disabled || loading,
              size: permanent ? 'medium' : 'small',
              style: {
                boxShadow: permanent ? theme.shadows[0] : null,
                margin: permanent ? '8px 2px 8px 2px' : null,
                ...(loading ? { color: theme.palette.action.disabled } : color && { color: color })
              }
            }}
            onClick={disabled || loading ? null : onClick}
          />
        </Wrapper>
      );
    else
      return (
        <Tooltip title={tooltipTitle}>
          <span>
            <IconButton
              href={!to ? null : typeof to === 'string' ? to : `${to.pathname}${to.search}${to.hash}`}
              disabled={disabled || loading}
              size="large"
              onClick={disabled || loading ? null : onClick}
              style={{ ...(loading ? { color: theme.palette.action.disabled } : color && { color: color }) }}
            >
              {icon}
              {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </IconButton>
          </span>
        </Tooltip>
      );
  }
);

type AlertActionProps<T = {}> = T & {
  alert: AlertItem;
  speedDial?: boolean;
  open?: boolean;
  vertical?: boolean;
  permanent?: boolean;
  onClick?: () => void;
};

export const AlertHistory: React.FC<AlertActionProps> = React.memo(
  ({
    alert,
    speedDial = false,
    open = false,
    vertical = false,
    permanent = false,
    onClick = () => null
  }: AlertActionProps) => {
    const { t } = useTranslation(['alerts']);
    const theme = useTheme();

    const [viewHistory, setViewHistory] = useState<boolean>(false);

    const hasEvents = useMemo<boolean>(() => alert && alert.events && alert.events.length > 0, [alert]);

    return (
      <>
        <AlertActionButton
          tooltipTitle={t(hasEvents ? 'history' : 'history.none')}
          open={open}
          vertical={vertical}
          permanent={permanent}
          speedDial={speedDial}
          showSkeleton={!alert}
          color={hasEvents ? theme.palette.action.active : theme.palette.action.disabled}
          icon={
            <Badge badgeContent={hasEvents ? alert.events.length : 0}>
              <WorkHistoryOutlinedIcon color={hasEvents ? 'inherit' : 'disabled'} />
            </Badge>
          }
          onClick={() => {
            if (hasEvents) setViewHistory(true);
            onClick();
          }}
        />
        <AlertEventsTable alert={alert} viewHistory={viewHistory} setViewHistory={setViewHistory} />
      </>
    );
  }
);

export const AlertGroup: React.FC<AlertActionProps> = React.memo(
  ({
    alert,
    open = false,
    speedDial = false,
    vertical = false,
    permanent = false,
    onClick = () => null
  }: AlertActionProps) => {
    const { t } = useTranslation(['alerts']);
    const theme = useTheme();
    const location = useLocation();

    const search = useMemo<string>(() => {
      if (!alert || !alert.group_count) return '';

      const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
      const groupBy = getGroupBy(location.search, DEFAULT_QUERY);
      query.set('group_by', '');
      query.add('fq', `${groupBy}:${getValueFromPath(alert, groupBy)}`);
      return query.getDeltaString();
    }, [alert, location.search]);

    return (
      <AlertActionButton
        tooltipTitle={t('focus')}
        to={`${location.pathname}?${search}${location.hash}`}
        open={open}
        vertical={vertical}
        permanent={permanent}
        speedDial={speedDial}
        showSkeleton={!alert}
        authorized={alert?.group_count > 0}
        color={theme.palette.action.active}
        icon={<CenterFocusStrongOutlinedIcon />}
        onClick={onClick}
      />
    );
  }
);

export const AlertOwnership: React.FC<AlertActionProps> = React.memo(
  ({
    alert,
    open = false,
    speedDial = false,
    vertical = false,
    permanent = false,
    onClick = () => null
  }: AlertActionProps) => {
    const { t } = useTranslation(['alerts']);
    const theme = useTheme();
    const classes = useStyles();
    const location = useLocation();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showErrorMessage, showSuccessMessage } = useMySnackbar();

    const [confirmation, setConfirmation] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);

    const groupBy = useMemo<string>(() => getGroupBy(location.search, DEFAULT_QUERY), [location.search]);

    const queryString = useMemo<string>(() => {
      if (!alert) return null;
      const q = buildSearchQuery({ search: location.search, singles: ['tc_start', 'tc'], multiples: ['fq'] });
      q.set('q', groupBy ? `${groupBy}:${getValueFromPath(alert, groupBy)}` : `alert_id:${alert.alert_id}`);
      return q.toString();
    }, [alert, groupBy, location.search]);

    const parseSearchParams = useCallback((search: string) => {
      let entries = [];
      for (const entry of new URLSearchParams(search).entries()) {
        entries.push(entry);
      }
      entries.sort((a, b) => `${a[0]}${a[1]}`.localeCompare(`${b[0]}${b[1]}`));
      return entries;
    }, []);

    const handleTakeOwnership = useCallback(
      (prevAlert: AlertItem, q: string) => {
        apiCall({
          url: `/api/v4/alert/ownership/batch/?${q}`,
          method: 'GET',
          onSuccess: ({ api_response }) => {
            if (!api_response.success) {
              showErrorMessage(t('take_ownership.error'));
              return;
            } else {
              const detail: Partial<AlertItem>[] = [{ ...prevAlert, owner: currentUser.username }];
              window.dispatchEvent(new CustomEvent<Partial<AlertItem>[]>('alertUpdate', { detail }));
              showSuccessMessage(t('take_ownership.success'));
            }
          },
          onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
          onEnter: () => setWaiting(true),
          onExit: () => {
            setWaiting(false);
            setConfirmation(false);
            onClick();
          }
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [currentUser.username, onClick, showErrorMessage, showSuccessMessage, t]
    );

    return (
      <>
        <AlertActionButton
          tooltipTitle={t('take_ownership')}
          open={open}
          vertical={vertical}
          permanent={permanent}
          speedDial={speedDial}
          showSkeleton={!alert}
          authorized={currentUser.roles.includes('alert_manage') && !alert?.owner}
          color={theme.palette.action.active}
          icon={<AssignmentIndIcon />}
          onClick={() => {
            setConfirmation(true);
            onClick();
          }}
        />
        {confirmation && (
          <ConfirmationDialog
            open={confirmation}
            handleClose={() => setConfirmation(false)}
            handleAccept={() => handleTakeOwnership(alert, queryString)}
            title={t('actions.takeownershipdiag.header')}
            cancelText={t('actions.cancel')}
            acceptText={t('actions.ok')}
            waiting={waiting}
            text={
              groupBy ? (
                <Grid container rowGap={2}>
                  <Grid>{t('actions.takeownershipdiag.content.grouped')}</Grid>
                  <Grid item>
                    <Typography variant="subtitle2">{t('actions.takeownershipdiag.properties')}</Typography>
                    <Paper component="pre" variant="outlined" className={classes.preview}>
                      {!queryString || queryString === '' ? (
                        <div>{t('none')}</div>
                      ) : (
                        parseSearchParams(queryString)?.map(([k, v], i) => (
                          <div key={i} style={{ display: 'contents', wordBreak: 'break-word' }}>
                            <b>{k}: </b>
                            {v ? <span>{v}</span> : <i>{t('session.none')}</i>}
                          </div>
                        ))
                      )}
                    </Paper>
                  </Grid>
                  <Grid>{t('actions.takeownershipdiag.confirm')}</Grid>
                </Grid>
              ) : (
                <Grid container rowGap={2}>
                  <Grid>
                    {t('actions.takeownershipdiag.content.single')}
                    <b>{`"${alert.alert_id}".`}</b>
                  </Grid>
                  <Grid>{t('actions.takeownershipdiag.confirm')}</Grid>
                </Grid>
              )
            }
          />
        )}
      </>
    );
  }
);

export const AlertSubmission: React.FC<AlertActionProps> = React.memo(
  ({
    alert,
    open = false,
    speedDial = false,
    vertical = false,
    permanent = false,
    onClick = () => null
  }: AlertActionProps) => {
    const { t } = useTranslation(['alerts']);
    const theme = useTheme();
    const { user: currentUser } = useAppUser<CustomUser>();

    return (
      <AlertActionButton
        tooltipTitle={t('submission')}
        to={`/submission/${alert?.sid}`}
        open={open}
        vertical={vertical}
        permanent={permanent}
        speedDial={speedDial}
        showSkeleton={!alert}
        authorized={currentUser.roles.includes('submission_view')}
        color={theme.palette.action.active}
        icon={<ViewCarouselOutlinedIcon />}
        onClick={onClick}
      />
    );
  }
);

type AlertWorkflowProps = AlertActionProps<{ inDrawer?: boolean }>;

export const AlertWorkflow: React.FC<AlertWorkflowProps> = React.memo(
  ({
    alert,
    open = false,
    speedDial = false,
    inDrawer = false,
    vertical = false,
    permanent = false,
    onClick = () => null
  }: AlertWorkflowProps) => {
    const { t } = useTranslation(['alerts']);
    const theme = useTheme();
    const location = useLocation();
    const { user: currentUser } = useAppUser<CustomUser>();

    const [openWorkflow, setOpenWorkflow] = useState<boolean>(false);

    const groupBy = useMemo<string>(() => getGroupBy(location.search, DEFAULT_QUERY), [location.search]);

    const query = useMemo<SimpleSearchQuery>(() => {
      if (!alert) return null;
      else {
        const q = buildSearchQuery({
          search: location.search,
          ...(speedDial && !inDrawer ? { singles: ['tc_start', 'tc'], multiples: ['fq'] } : null)
        });
        q.set('q', groupBy ? `${groupBy}:${getValueFromPath(alert, groupBy)}` : `alert_id:${alert.alert_id}`);
        return q;
      }
    }, [alert, groupBy, inDrawer, location.search, speedDial]);

    return (
      <>
        <AlertActionButton
          tooltipTitle={t('workflow_action')}
          open={open}
          vertical={vertical}
          permanent={permanent}
          speedDial={speedDial}
          showSkeleton={!query}
          authorized={currentUser.roles.includes('alert_manage')}
          color={theme.palette.action.active}
          icon={<BiNetworkChart style={{ height: '1.3rem', width: '1.3rem' }} />}
          onClick={() => {
            onClick();
            setOpenWorkflow(o => !o);
          }}
        />
        <AlertWorkflowDrawer
          alerts={[alert]}
          query={query}
          open={openWorkflow}
          hideTC
          // initialBody={{
          //   status: alert.status as Status,
          //   priority: alert.priority as Priority,
          //   labels: alert.label,
          //   removed_labels: []
          // }}
          onClose={() => setOpenWorkflow(false)}
        />
      </>
    );
  }
);

export const AlertSafelist: React.FC<AlertActionProps> = React.memo(
  ({
    alert,
    open = false,
    speedDial = false,
    vertical = false,
    permanent = false,
    onClick = () => null
  }: AlertActionProps) => {
    const { t } = useTranslation(['alerts']);
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showErrorMessage, showSuccessMessage } = useMySnackbar();

    const [loading, setLoading] = useState<boolean>(false);

    const hasSetNonMalicious = useMemo<boolean>(
      () => alert && alert.verdict.non_malicious.indexOf(currentUser.username) !== -1,
      [alert, currentUser.username]
    );

    const handleNonMaliciousChange = useCallback(
      (prevAlert: AlertItem) => {
        apiCall({
          method: 'PUT',
          url: `/api/v4/alert/verdict/${prevAlert.alert_id}/non_malicious/`,
          onSuccess: ({ api_response }) => {
            if (!api_response.success) {
              showErrorMessage(t('verdict.error.non_malicious'));
              return;
            } else {
              const detail: Partial<AlertItem>[] = [
                {
                  ...prevAlert,
                  verdict: {
                    non_malicious: [...prevAlert.verdict.non_malicious, currentUser.username],
                    malicious: prevAlert.verdict.malicious.filter(v => v !== currentUser.username)
                  }
                }
              ];
              window.dispatchEvent(new CustomEvent<Partial<AlertItem>[]>('alertUpdate', { detail }));
              showSuccessMessage(t('verdict.success.non_malicious'));
            }
          },
          onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
          onEnter: () => setLoading(true),
          onExit: () => {
            setLoading(false);
            onClick();
          }
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [currentUser.username, onClick, showErrorMessage, showSuccessMessage, t]
    );

    return (
      <AlertActionButton
        tooltipTitle={t(hasSetNonMalicious ? 'verdict.non_malicious.set' : 'verdict.non_malicious.action')}
        open={open}
        loading={loading}
        disabled={hasSetNonMalicious}
        vertical={vertical}
        permanent={permanent}
        speedDial={speedDial}
        showSkeleton={!alert}
        authorized={currentUser.roles.includes('alert_manage')}
        color={
          hasSetNonMalicious
            ? theme.palette.mode === 'dark'
              ? theme.palette.success.light
              : theme.palette.success.dark
            : null
        }
        icon={<VerifiedUserOutlinedIcon />}
        onClick={hasSetNonMalicious ? null : () => handleNonMaliciousChange(alert)}
      />
    );
  }
);

export const AlertBadlist: React.FC<AlertActionProps> = React.memo(
  ({
    alert,
    open = false,
    speedDial = false,
    vertical = false,
    permanent = false,
    onClick = () => null
  }: AlertActionProps) => {
    const { t } = useTranslation(['alerts']);
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useAppUser<CustomUser>();
    const { showErrorMessage, showSuccessMessage } = useMySnackbar();

    const [loading, setLoading] = useState<boolean>(false);

    const hasSetMalicious = useMemo<boolean>(
      () => alert && alert.verdict.malicious.indexOf(currentUser.username) !== -1,
      [alert, currentUser.username]
    );

    const handleMaliciousChange = useCallback(
      (prevAlert: AlertItem) => {
        apiCall({
          method: 'PUT',
          url: `/api/v4/alert/verdict/${prevAlert.alert_id}/malicious/`,
          onSuccess: ({ api_response }) => {
            if (!api_response.success) {
              showErrorMessage(t('verdict.error.malicious'));
              return;
            } else {
              const detail: Partial<AlertItem>[] = [
                {
                  ...prevAlert,
                  verdict: {
                    malicious: [...prevAlert.verdict.malicious, currentUser.username],
                    non_malicious: prevAlert.verdict.non_malicious.filter(v => v !== currentUser.username)
                  }
                }
              ];
              window.dispatchEvent(new CustomEvent<Partial<AlertItem>[]>('alertUpdate', { detail }));
              showSuccessMessage(t('verdict.success.malicious'));
            }
          },
          onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
          onEnter: () => setLoading(true),
          onExit: () => {
            setLoading(false);
            onClick();
          }
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [currentUser.username, onClick, showErrorMessage, showSuccessMessage, t]
    );

    return (
      <AlertActionButton
        tooltipTitle={t(hasSetMalicious ? 'verdict.malicious.set' : 'verdict.malicious.action')}
        open={open}
        loading={loading}
        disabled={hasSetMalicious}
        vertical={vertical}
        permanent={permanent}
        speedDial={speedDial}
        showSkeleton={!alert}
        authorized={currentUser.roles.includes('alert_manage')}
        color={
          hasSetMalicious
            ? theme.palette.mode === 'dark'
              ? theme.palette.error.light
              : theme.palette.error.dark
            : null
        }
        icon={<BugReportOutlinedIcon />}
        onClick={hasSetMalicious ? null : () => handleMaliciousChange(alert)}
      />
    );
  }
);

type Props = {
  alert: AlertItem;
  inDrawer?: boolean;
};

const WrappedAlertActions = ({ alert, inDrawer = false }: Props) => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);

  const prevSearch = useRef<string>('');

  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  const vertical = useMemo<boolean>(() => inDrawer && !upSM, [inDrawer, upSM]);
  const permanent = useMemo<boolean>(() => inDrawer && upSM, [inDrawer, upSM]);

  useEffect(() => {
    if (open || permanent) setRender(true);
  }, [open, permanent]);

  useEffect(() => {
    return () => setRender(false);
  }, []);

  useEffect(() => {
    if (location.search !== prevSearch.current) {
      setOpen(false);
      prevSearch.current = location.search;
    }
  }, [location.search]);

  if (
    !currentUser.roles.includes('submission_view') &&
    !currentUser.roles.includes('alert_manage') &&
    !alert?.group_count
  )
    return null;
  else
    return (
      <div style={{ marginTop: vertical ? null : theme.spacing(-1), marginRight: vertical ? null : theme.spacing(-1) }}>
        <SpeedDial
          ariaLabel={t('action_menu')}
          classes={{
            actionsClosed: vertical ? null : classes.actionsClosed,
            root: permanent ? classes.permanentSpeedDial : null
          }}
          icon={
            <SpeedDialIcon
              icon={vertical ? <ExpandMoreIcon /> : <ChevronLeftIcon />}
              openIcon={vertical ? <ExpandLessIcon /> : <ChevronRightIcon />}
            />
          }
          direction={vertical ? 'down' : 'left'}
          open={open || permanent}
          onOpen={(event, reason: OpenReason) =>
            reason !== 'toggle' && reason !== 'mouseEnter' ? null : setOpen(true)
          }
          onClose={(event, reason: CloseReason) =>
            reason !== 'toggle' && reason !== 'escapeKeyDown' ? null : setOpen(false)
          }
          FabProps={{
            size: vertical ? 'medium' : 'small',
            color: 'secondary',
            className: vertical ? classes.verticalSpeedDialFab : permanent ? classes.permanentSpeedDialFab : null
          }}
        >
          {!alert || !render
            ? []
            : [
                <AlertBadlist
                  key={`${alert?.alert_id}.AlertBadlist`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                />,
                <AlertSafelist
                  key={`${alert?.alert_id}.AlertSafelist`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                />,
                <AlertWorkflow
                  key={`${alert?.alert_id}.AlertWorkflow`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  inDrawer={inDrawer}
                  vertical={vertical}
                  permanent={permanent}
                  onClick={() => setOpen(false)}
                />,
                <AlertSubmission
                  key={`${alert?.alert_id}.AlertSubmission`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                  onClick={() => setOpen(false)}
                />,
                <AlertOwnership
                  key={`${alert?.alert_id}.AlertOwnership`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                  onClick={() => setOpen(false)}
                />,
                <AlertGroup
                  key={`${alert?.alert_id}.AlertGroup`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                  onClick={() => setOpen(false)}
                />,
                <AlertHistory
                  key={`${alert?.alert_id}.AlertHistory`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                  onClick={() => setOpen(false)}
                />
              ]}
        </SpeedDial>
      </div>
    );
};

export const AlertActions = React.memo(WrappedAlertActions);
export default AlertActions;
