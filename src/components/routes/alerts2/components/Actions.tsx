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
  IconButton,
  OpenReason,
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
import { AlertItem } from 'components/routes/alerts/hooks/useAlerts';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import { getValueFromPath } from 'helpers/utils';
import { To } from 'history';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { Link, useLocation } from 'react-router-dom';
import { getGroupBy } from '../utils/buildSearchQuery';
import { AlertEventsTable } from './Components';

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
  }
}));

type AlertActionButtonProps = {
  color?: CSSProperties['color'];
  disabled?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  open?: boolean;
  permanent?: boolean;
  speedDial?: boolean;
  to?: To;
  tooltipTitle?: string;
  vertical?: boolean;
  onClick?: React.MouseEventHandler<any>;
};

const AlertActionButton: React.FC<AlertActionButtonProps> = React.memo(
  ({
    color = null,
    disabled = false,
    icon = null,
    loading = false,
    open = false,
    permanent = false,
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

    if (speedDial)
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

type AlertActionProps = {
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

    if (!alert)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else
      return (
        <>
          <AlertActionButton
            tooltipTitle={t(hasEvents ? 'history' : 'history.none')}
            open={open}
            vertical={vertical}
            permanent={permanent}
            speedDial={speedDial}
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

    if (!alert)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else if (!alert.group_count) return null;
    else
      return (
        <AlertActionButton
          tooltipTitle={t('focus')}
          to={`${location.pathname}?${search}${location.hash}`}
          open={open}
          vertical={vertical}
          permanent={permanent}
          speedDial={speedDial}
          color={theme.palette.action.active}
          icon={<CenterFocusStrongOutlinedIcon />}
          onClick={onClick}
        />
      );
  }
);

// TODO
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
    const location = useLocation();
    const { apiCall } = useMyAPI();
    const { showErrorMessage, showSuccessMessage } = useMySnackbar();
    const { user: currentUser } = useAppUser<CustomUser>();

    const [confirmation, setConfirmation] = useState<boolean>(false);

    const groupBy = useMemo<string>(() => getGroupBy(location.search, DEFAULT_QUERY), [location.search]);

    // const buildActionQuery = (): SearchQuery => {
    //   const _actionQuery = currentQuery.newBase(name => name === 'tc_start');
    //   _actionQuery.setGroupBy('');

    //   if (groupBy) {
    //     _actionQuery.setQuery(`${groupBy}:${getValueFromPath(item, groupBy)}`);
    //   } else {
    //     _actionQuery.setQuery(`alert_id:${item.alert_id}`);
    //   }
    //   return _actionQuery;
    // };

    // const handleTakeOwnership = useCallback(() => {
    //   //       // https://malware-stg.cyber.gc.ca/api/v4/alert/ownership/batch/?
    //   //       tc_start=2024-03-24T04%3A49%3A46.150416Z&
    //   //       q=alert_id%3A2qotQ0i6nhXl3jr54veMfc

    //   // https://malware-stg.cyber.gc.ca/api/v4/alert/ownership/batch/?
    //   // tc_start=2024-03-24T04%3A49%3A46.150416Z&
    //   // q=alert_id%3A4iT7qG9nR6wTWp0ZaOO6oM

    //   const search = buildSearchQuery(location.search, ['q', 'tc_start', 'tc'], ['fq']);

    //   apiCall({
    //     url: `/api/v4/alert/ownership/batch/?${search}`,
    //     onSuccess: () => {
    //       window.dispatchEvent(
    //         new CustomEvent<AlertItem>('alertUpdate', { detail: { ...alert, owner: currentUser.username } })
    //       );
    //       showSuccessMessage(t(''));
    //     },
    //     onFailure: ({ api_error_message }) => {
    //       showErrorMessage(api_error_message);
    //     },
    //     onEnter: () => setLoading(true),
    //     onExit: () => setLoading(false)
    //   });
    // }, [alert, apiCall, currentUser.username, location.search]);

    // const buildActionQuery = (): SearchQuery => {
    //   const _actionQuery = currentQuery.newBase(name => name === 'tc_start');
    //   _actionQuery.setGroupBy('');

    //   if (groupBy) {
    //     _actionQuery.setQuery(`${groupBy}:${getValueFromPath(item, groupBy)}`);
    //   } else {
    //     _actionQuery.setQuery(`alert_id:${item.alert_id}`);
    //   }
    //   return _actionQuery;
    // };

    // const onTakeOwnershipOkClick = async () => {
    //   try {
    //     await onTakeOwnership(takeOwnershipConfirmation.query);
    //     setTakeOwnershipConfirmation({ open: false, query: null });
    //     if (onTakeOwnershipComplete) {
    //       onTakeOwnershipComplete();
    //     }
    //   } catch (api_data) {
    //     setTakeOwnershipConfirmation({ open: false, query: null });
    //   }
    // };

    // const onTakeOwnershipCancelClick = () => {
    //   setTakeOwnershipConfirmation({ open: false, query: null });
    // };

    const handleTakeOwnership = useCallback(() => {}, []);

    if (!alert)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else if (!currentUser.roles.includes('alert_manage') || alert.owner) return null;
    else
      return (
        <>
          <AlertActionButton
            tooltipTitle={t('take_ownership')}
            open={open}
            vertical={vertical}
            permanent={permanent}
            speedDial={speedDial}
            color={theme.palette.action.active}
            icon={<AssignmentIndIcon />}
            onClick={() => setConfirmation(true)}
          />
          {confirmation && (
            <ConfirmationDialog
              open={confirmation}
              handleClose={() => setConfirmation(false)}
              handleAccept={() => handleTakeOwnership()}
              title={t('actions.takeownershipdiag.header')}
              cancelText={t('actions.cancel')}
              acceptText={t('actions.ok')}
              text={
                groupBy ? (
                  <>
                    <span style={{ display: 'inline-block' }}>{t('actions.takeownershipdiag.content.grouped')}</span>
                    <span style={{ display: 'inline-block', padding: theme.spacing(1), wordBreak: 'break-word' }}>
                      <Typography variant="caption">{`${groupBy}: ${getValueFromPath(alert, groupBy)}`}</Typography>
                    </span>
                  </>
                ) : (
                  t('actions.takeownershipdiag.content.single')
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

    if (!alert)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else if (!currentUser.roles.includes('submission_view')) return null;
    else
      return (
        <AlertActionButton
          tooltipTitle={t('submission')}
          to={`/submission/${alert.sid}`}
          open={open}
          vertical={vertical}
          permanent={permanent}
          speedDial={speedDial}
          color={theme.palette.action.active}
          icon={<ViewCarouselOutlinedIcon />}
          onClick={onClick}
        />
      );
  }
);

export const AlertWorkflow: React.FC<AlertActionProps> = React.memo(
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

    if (!alert)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else if (!currentUser.roles.includes('alert_manage')) return null;
    else
      return (
        <AlertActionButton
          tooltipTitle={t('workflow_action')}
          open={open}
          vertical={vertical}
          permanent={permanent}
          speedDial={speedDial}
          color={theme.palette.action.active}
          icon={<BiNetworkChart style={{ height: '1.3rem', width: '1.3rem' }} />}
          onClick={onClick}
        />
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

    const handleNonMaliciousChange = useCallback(() => {
      apiCall({
        method: 'PUT',
        url: `/api/v4/alert/verdict/${alert.alert_id}/non_malicious/`,
        onSuccess: ({ api_response }) => {
          if (!api_response.success) {
            showErrorMessage(t('verdict.error.non_malicious'));
            return;
          } else {
            const verdict = {
              non_malicious: [...alert.verdict.non_malicious, currentUser.username],
              malicious: alert.verdict.malicious.filter(v => v !== currentUser.username)
            };
            window.dispatchEvent(new CustomEvent<AlertItem>('alertUpdate', { detail: { ...alert, verdict } }));
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alert, currentUser.username, onClick, showErrorMessage, showSuccessMessage, t]);

    if (!alert)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else if (!currentUser.roles.includes('alert_manage')) return null;
    else
      return (
        <AlertActionButton
          tooltipTitle={t(hasSetNonMalicious ? 'verdict.non_malicious.set' : 'verdict.non_malicious.action')}
          open={open}
          loading={loading}
          disabled={hasSetNonMalicious}
          vertical={vertical}
          permanent={permanent}
          speedDial={speedDial}
          color={
            hasSetNonMalicious
              ? theme.palette.mode === 'dark'
                ? theme.palette.success.light
                : theme.palette.success.dark
              : null
          }
          icon={<VerifiedUserOutlinedIcon />}
          onClick={hasSetNonMalicious ? null : () => handleNonMaliciousChange()}
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

    const handleMaliciousChange = useCallback(() => {
      apiCall({
        method: 'PUT',
        url: `/api/v4/alert/verdict/${alert.alert_id}/malicious/`,
        onSuccess: ({ api_response }) => {
          if (!api_response.success) {
            showErrorMessage(t('verdict.error.malicious'));
            return;
          } else {
            const verdict = {
              malicious: [...alert.verdict.malicious, currentUser.username],
              non_malicious: alert.verdict.non_malicious.filter(v => v !== currentUser.username)
            };
            window.dispatchEvent(new CustomEvent<AlertItem>('alertUpdate', { detail: { ...alert, verdict } }));
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alert, currentUser.username, onClick, showErrorMessage, showSuccessMessage, t]);

    if (!alert)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else if (!currentUser.roles.includes('alert_manage')) return null;
    else
      return (
        <AlertActionButton
          tooltipTitle={t(hasSetMalicious ? 'verdict.malicious.set' : 'verdict.malicious.action')}
          open={open}
          loading={loading}
          disabled={hasSetMalicious}
          vertical={vertical}
          permanent={permanent}
          speedDial={speedDial}
          color={
            hasSetMalicious
              ? theme.palette.mode === 'dark'
                ? theme.palette.error.light
                : theme.palette.error.dark
              : null
          }
          icon={<BugReportOutlinedIcon />}
          onClick={hasSetMalicious ? null : () => handleMaliciousChange()}
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
    !alert.group_count
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
                  key={`${alert.alert_id}.AlertBadlist`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                />,
                <AlertSafelist
                  key={`${alert.alert_id}.AlertSafelist`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                />,
                <AlertWorkflow
                  key={`${alert.alert_id}.AlertWorkflow`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                  onClick={() => setOpen(false)}
                />,
                <AlertSubmission
                  key={`${alert.alert_id}.AlertSubmission`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                  onClick={() => setOpen(false)}
                />,
                <AlertOwnership
                  key={`${alert.alert_id}.AlertOwnership`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                  onClick={() => setOpen(false)}
                />,
                <AlertGroup
                  key={`${alert.alert_id}.AlertGroup`}
                  alert={alert}
                  open={open || permanent}
                  speedDial
                  vertical={vertical}
                  permanent={permanent}
                  onClick={() => setOpen(false)}
                />,
                <AlertHistory
                  key={`${alert.alert_id}.AlertHistory`}
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
