import { makeStyles, Typography, useTheme } from '@material-ui/core';
import AmpStoriesOutlinedIcon from '@material-ui/icons/AmpStoriesOutlined';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import CenterFocusStrongOutlinedIcon from '@material-ui/icons/CenterFocusStrongOutlined';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import SearchQuery from 'components/visual/SearchBar/search-query';
import { getValueFromPath } from 'helpers/utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { useHistory } from 'react-router-dom';
import { AlertDrawerState } from './alerts';
import { AlertItem } from './hooks/useAlerts';
import usePromiseAPI from './hooks/usePromiseAPI';

interface AlertListItemActionsProps {
  item: AlertItem;
  index: number;
  currentQuery: SearchQuery;
  setDrawer: (state: AlertDrawerState) => void;
  onTakeOwnershipComplete?: () => void;
  vertical?: boolean;
}

const useStyles = makeStyles(theme => ({
  verticalSpeedDial: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[0],
    '&.MuiFab-primary': {
      backgroundColor: theme.palette.background.paper
    },
    '&.MuiFab-primary:hover': {
      backgroundColor: theme.palette.action.hover
    },
    color: theme.palette.text.secondary
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

const AlertListItemActions: React.FC<AlertListItemActionsProps> = React.memo(
  ({ item, index, currentQuery, setDrawer, onTakeOwnershipComplete, vertical = false }) => {
    const { onTakeOwnership } = usePromiseAPI();
    const classes = useStyles();
    const groupBy = currentQuery.getGroupBy();
    const { t } = useTranslation('alerts');
    const theme = useTheme();
    const [takeOwnershipConfirmation, setTakeOwnershipConfirmation] = useState<OwnerProps>(DEFAULT_OWNER);
    const [open, setOpen] = useState(false);
    const history = useHistory();

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

    const handleClose = () => {
      setOpen(false);
    };

    const handleOpen = () => {
      setOpen(true);
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
          classes={{ actionsClosed: vertical ? null : classes.actionsClosed }}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          FabProps={{
            size: vertical ? 'medium' : 'small',
            className: vertical ? classes.verticalSpeedDial : null
          }}
          direction={vertical ? 'down' : 'left'}
        >
          <SpeedDialAction
            icon={<BiNetworkChart style={{ height: '1.3rem', width: '1.3rem' }} />}
            tooltipTitle={t('workflow_action')}
            tooltipPlacement={vertical ? 'left' : 'bottom'}
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
            }}
          />
          <SpeedDialAction
            icon={<AmpStoriesOutlinedIcon />}
            tooltipTitle={t('submission')}
            tooltipPlacement={vertical ? 'left' : 'bottom'}
            onClick={() => {
              history.push(`/submission/${item.sid}`);
            }}
          />
          {!item.owner && (
            <SpeedDialAction
              icon={<AssignmentIndIcon />}
              tooltipTitle={t('take_ownership')}
              tooltipPlacement={vertical ? 'left' : 'bottom'}
              onClick={() => {
                setTakeOwnershipConfirmation({ open: true, query: buildActionQuery() });
              }}
            />
          )}
          {item.group_count && (
            <SpeedDialAction
              icon={<CenterFocusStrongOutlinedIcon />}
              tooltipTitle={t('focus')}
              tooltipPlacement={vertical ? 'left' : 'bottom'}
              onClick={() => {
                history.push(`/alerts/?${buildFocusQuery().buildURLQueryString()}`);
              }}
            />
          )}
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
                  <span style={{ display: 'inline-block', padding: theme.spacing(1), wordBreak: 'break-all' }}>
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
  }
);

export default AlertListItemActions;
