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
import { Badge, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import { Alert } from 'components/models/base/alert';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import SearchQuery from 'components/visual/SearchBar/search-query';
import { getValueFromPath } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import AlertEventsTable from './alert-events';
import { AlertDrawerState } from './alerts';
import usePromiseAPI from './hooks/usePromiseAPI';

export type PossibleVerdict = 'malicious' | 'non_malicious';

interface AlertListItemActionsProps {
  item: Alert;
  index: number;
  currentQuery: SearchQuery;
  setDrawer: (state: AlertDrawerState) => void;
  onTakeOwnershipComplete?: () => void;
  onVerdictComplete?: (verdict: PossibleVerdict) => void;
  type?: 'normal' | 'drawer';
}

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
  }
}));

interface OwnerProps {
  open: boolean;
  query: SearchQuery;
}

const DEFAULT_OWNER = {
  open: false,
  query: null
};

const SpeedDialActionLink = props => {
  const { to, ...others } = props;

  return (
    <Link to={to}>
      <SpeedDialAction {...others} />
    </Link>
  );
};

const SpeedDialActionButton = props => {
  return (
    <div>
      <SpeedDialAction {...props} />
    </div>
  );
};

const WrappedAlertListItemActions: React.FC<AlertListItemActionsProps> = ({
  item,
  index,
  currentQuery,
  setDrawer,
  onTakeOwnershipComplete,
  onVerdictComplete,
  type = 'normal'
}) => {
  const { onTakeOwnership, setVerdict } = usePromiseAPI();
  const classes = useStyles();
  const groupBy = currentQuery.getGroupBy();
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();
  const [takeOwnershipConfirmation, setTakeOwnershipConfirmation] = useState<OwnerProps>(DEFAULT_OWNER);
  const [viewHistory, setViewHistory] = useState(false);
  const [open, setOpen] = useState(false);
  const { user: currentUser } = useAppUser<CustomUser>();
  const [hasSetMalicious, setHasSetMalicious] = useState(false);
  const [hasSetNonMalicious, setHasSetNonMalicious] = useState(false);
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));
  const vertical = type === 'drawer' && !upSM;
  const permanent = type === 'drawer' && upSM;
  const hasEvents = item && item.events && item.events.length > 0 ? true : false;

  useEffect(() => {
    setHasSetMalicious(item.verdict.malicious.indexOf(currentUser.username) !== -1);
    setHasSetNonMalicious(item.verdict.non_malicious.indexOf(currentUser.username) !== -1);
  }, [currentUser.username, item]);

  const handleVerdict = async (verdict: PossibleVerdict) => {
    try {
      await setVerdict(item.alert_id, verdict);
      showSuccessMessage(t(`verdict.${verdict}.success`));
      if (verdict === 'malicious') {
        setHasSetMalicious(true);
        setHasSetNonMalicious(false);
      } else {
        setHasSetMalicious(false);
        setHasSetNonMalicious(true);
      }
      if (onVerdictComplete) {
        onVerdictComplete(verdict);
      }
    } catch (api_data) {
      showErrorMessage(t('verdict.failed'));
    }
  };

  const onTakeOwnershipOkClick = async () => {
    try {
      await onTakeOwnership(takeOwnershipConfirmation.query);
      setTakeOwnershipConfirmation({ open: false, query: null });
      if (onTakeOwnershipComplete) {
        onTakeOwnershipComplete();
      }
    } catch (api_data) {
      setTakeOwnershipConfirmation({ open: false, query: null });
    }
  };

  const onTakeOwnershipCancelClick = () => {
    setTakeOwnershipConfirmation({ open: false, query: null });
  };

  const buildActionQuery = (): SearchQuery => {
    const _actionQuery = currentQuery.newBase(name => name === 'tc_start');
    _actionQuery.setGroupBy('');

    if (groupBy) {
      _actionQuery.setQuery(`${groupBy}:${getValueFromPath(item, groupBy)}`);
    } else {
      _actionQuery.setQuery(`alert_id:${item.alert_id}`);
    }
    return _actionQuery;
  };

  const buildFocusQuery = (): SearchQuery => {
    const focusQuery = currentQuery.build();
    focusQuery.setGroupBy('');
    focusQuery.addFq(`${groupBy}:${getValueFromPath(item, groupBy)}`);
    return focusQuery;
  };

  const handleClose = (event, reason) => {
    if (reason === 'toggle' || reason === 'escapeKeyDown') {
      setOpen(false);
    }
  };

  const handleOpen = (event, reason) => {
    if (reason === 'toggle') {
      setOpen(true);
    }
  };

  return (
    <div
      style={{
        marginTop: vertical ? null : theme.spacing(-1),
        marginRight: vertical ? null : theme.spacing(-1)
      }}
    >
      <SpeedDial
        ariaLabel={t('action_menu')}
        icon={
          <SpeedDialIcon
            icon={vertical ? <ExpandMoreIcon /> : <ChevronLeftIcon />}
            openIcon={vertical ? <ExpandLessIcon /> : <ChevronRightIcon />}
          />
        }
        classes={{
          actionsClosed: vertical ? null : classes.actionsClosed,
          root: permanent ? classes.permanentSpeedDial : null
        }}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open || permanent}
        FabProps={{
          size: vertical ? 'medium' : 'small',
          color: 'secondary',
          className: vertical ? classes.verticalSpeedDialFab : permanent ? classes.permanentSpeedDialFab : null
        }}
        direction={vertical ? 'down' : 'left'}
      >
        {currentUser.roles.includes('alert_manage') && (
          <SpeedDialActionButton
            icon={<BugReportOutlinedIcon />}
            tooltipTitle={t(hasSetMalicious ? 'verdict.malicious.set' : 'verdict.malicious.action')}
            tooltipPlacement={vertical ? 'left' : 'bottom'}
            FabProps={{
              size: permanent ? 'medium' : 'small',
              style: {
                boxShadow: permanent ? theme.shadows[0] : null,
                margin: permanent ? '8px 2px 8px 2px' : null,
                color: hasSetMalicious
                  ? theme.palette.mode === 'dark'
                    ? theme.palette.error.light
                    : theme.palette.error.dark
                  : null
              }
            }}
            onClick={
              !hasSetMalicious
                ? () => {
                    handleVerdict('malicious');
                    handleClose(null, 'toggle');
                  }
                : null
            }
          />
        )}
        {currentUser.roles.includes('alert_manage') && (
          <SpeedDialActionButton
            icon={<VerifiedUserOutlinedIcon />}
            tooltipTitle={t(hasSetNonMalicious ? 'verdict.non_malicious.set' : 'verdict.non_malicious.action')}
            tooltipPlacement={vertical ? 'left' : 'bottom'}
            FabProps={{
              size: permanent ? 'medium' : 'small',
              style: {
                boxShadow: permanent ? theme.shadows[0] : null,
                margin: permanent ? '8px 2px 8px 2px' : null,
                color: hasSetNonMalicious
                  ? theme.palette.mode === 'dark'
                    ? theme.palette.success.light
                    : theme.palette.success.dark
                  : null
              }
            }}
            onClick={
              !hasSetNonMalicious
                ? () => {
                    handleVerdict('non_malicious');
                    handleClose(null, 'toggle');
                  }
                : null
            }
          />
        )}
        {currentUser.roles.includes('alert_manage') && (
          <SpeedDialActionButton
            icon={<BiNetworkChart style={{ height: '1.3rem', width: '1.3rem' }} />}
            tooltipTitle={t('workflow_action')}
            tooltipPlacement={vertical ? 'left' : 'bottom'}
            FabProps={{
              size: permanent ? 'medium' : 'small',
              style: {
                margin: permanent ? '8px 2px 8px 2px' : null,
                boxShadow: permanent ? theme.shadows[0] : null
              }
            }}
            onClick={() => {
              const actionQuery = buildActionQuery();
              setDrawer({
                open: true,
                type: 'actions',
                actionData: {
                  query: actionQuery,
                  alert: {
                    index,
                    alert_id: item.alert_id,
                    priority: item.priority,
                    status: item.status,
                    labels: item.label
                  }
                }
              });
              handleClose(null, 'toggle');
            }}
          />
        )}
        {currentUser.roles.includes('submission_view') && (
          <SpeedDialActionLink
            icon={<ViewCarouselOutlinedIcon />}
            to={`/submission/${item.sid}`}
            tooltipTitle={t('submission')}
            tooltipPlacement={vertical ? 'left' : 'bottom'}
            FabProps={{
              size: permanent ? 'medium' : 'small',
              style: {
                margin: permanent ? '8px 2px 8px 2px' : null,
                boxShadow: permanent ? theme.shadows[0] : null
              }
            }}
            onClick={() => handleClose(null, 'toggle')}
          />
        )}
        {currentUser.roles.includes('alert_manage') && !item.owner && (
          <SpeedDialActionButton
            icon={<AssignmentIndIcon />}
            tooltipTitle={t('take_ownership')}
            tooltipPlacement={vertical ? 'left' : 'bottom'}
            FabProps={{
              size: permanent ? 'medium' : 'small',
              style: {
                margin: permanent ? '8px 2px 8px 2px' : null,
                boxShadow: permanent ? theme.shadows[0] : null
              }
            }}
            onClick={() => {
              setTakeOwnershipConfirmation({ open: true, query: buildActionQuery() });
              handleClose(null, 'toggle');
            }}
          />
        )}
        {item.group_count && (
          <SpeedDialActionLink
            icon={<CenterFocusStrongOutlinedIcon />}
            to={`/alerts/?${buildFocusQuery().buildURLQueryString()}`}
            tooltipTitle={t('focus')}
            tooltipPlacement={vertical ? 'left' : 'bottom'}
            FabProps={{
              size: permanent ? 'medium' : 'small',
              style: {
                margin: permanent ? '8px 2px 8px 2px' : null,
                boxShadow: permanent ? theme.shadows[0] : null
              }
            }}
            onClick={() => handleClose(null, 'toggle')}
          />
        )}
        <SpeedDialActionButton
          icon={
            <Badge badgeContent={hasEvents ? item.events.length : 0}>
              <WorkHistoryOutlinedIcon color={hasEvents ? 'inherit' : 'disabled'} />
            </Badge>
          }
          disableRipple={!hasEvents}
          tooltipTitle={t(hasEvents ? 'history' : 'history.none')}
          tooltipPlacement={vertical ? 'left' : 'bottom'}
          FabProps={{
            size: permanent ? 'medium' : 'small',
            style: {
              margin: permanent ? '8px 2px 8px 2px' : null,
              boxShadow: permanent ? theme.shadows[0] : null
            }
          }}
          onClick={() => {
            if (hasEvents) {
              setViewHistory(true);
            }
          }}
        />
        <AlertEventsTable alert={item} viewHistory={viewHistory} setViewHistory={setViewHistory} />
      </SpeedDial>
      {takeOwnershipConfirmation.open && (
        <ConfirmationDialog
          open={takeOwnershipConfirmation.open}
          handleClose={onTakeOwnershipCancelClick}
          handleAccept={onTakeOwnershipOkClick}
          title={t('actions.takeownershipdiag.header')}
          cancelText={t('actions.cancel')}
          acceptText={t('actions.ok')}
          text={
            groupBy ? (
              <>
                <span style={{ display: 'inline-block' }}>{t('actions.takeownershipdiag.content.grouped')}</span>
                <span style={{ display: 'inline-block', padding: theme.spacing(1), wordBreak: 'break-word' }}>
                  <Typography variant="caption">{`${groupBy}: ${getValueFromPath(item, groupBy)}`}</Typography>
                </span>
              </>
            ) : (
              t('actions.takeownershipdiag.content.single')
            )
          }
        />
      )}
    </div>
  );
};

const AlertListItemActions = React.memo(WrappedAlertListItemActions);
export default AlertListItemActions;
