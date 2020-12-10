import { IconButton, makeStyles, Tooltip, Typography, useTheme } from '@material-ui/core';
import AmpStoriesOutlinedIcon from '@material-ui/icons/AmpStoriesOutlined';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import CenterFocusStrongOutlinedIcon from '@material-ui/icons/CenterFocusStrongOutlined';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import SearchQuery from 'components/visual/SearchBar/search-query';
import { getValueFromPath } from 'helpers/utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { AlertDrawerState } from './alerts';
import { AlertItem } from './hooks/useAlerts';
import usePromiseAPI from './hooks/usePromiseAPI';

interface AlertListItemActionsProps {
  item: AlertItem;
  currentQuery: SearchQuery;
  setDrawer: (state: AlertDrawerState) => void;
  onTakeOwnershipComplete?: () => void;
}

const useStyles = makeStyles(theme => ({
  iconBackground: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: theme.spacing(1),
    boxShadow: theme.shadows[8]
  }
}));

const AlertListItemActions: React.FC<AlertListItemActionsProps> = React.memo(
  ({ item, currentQuery, setDrawer, onTakeOwnershipComplete }) => {
    const { onTakeOwnership } = usePromiseAPI();
    const classes = useStyles();
    const groupBy = currentQuery.getGroupBy();
    const { t } = useTranslation('alerts');
    const theme = useTheme();
    const [takeOwnershipConfirmation, setTakeOwnershipConfirmation] = useState<{ open: boolean; query: SearchQuery }>({
      open: false,
      query: null
    });

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

    return (
      <>
        <div>
          {!item.owner && (
            <div className={classes.iconBackground}>
              <Tooltip title={t('take_ownership')}>
                <IconButton
                  onClick={() => {
                    setTakeOwnershipConfirmation({ open: true, query: buildActionQuery() });
                  }}
                  style={{ marginRight: 0 }}
                >
                  <AssignmentIndIcon />
                </IconButton>
              </Tooltip>
            </div>
          )}
          {item.group_count && (
            <div className={classes.iconBackground}>
              <Tooltip title={t('focus')}>
                <IconButton
                  component={Link}
                  to={`/alerts/?${buildFocusQuery().buildURLQueryString()}`}
                  style={{ marginRight: 0 }}
                >
                  <CenterFocusStrongOutlinedIcon />
                </IconButton>
              </Tooltip>
            </div>
          )}
          <div className={classes.iconBackground}>
            <Tooltip title={t('submission')}>
              <IconButton component={Link} to={`/submission/${item.sid}`} style={{ marginRight: 0 }}>
                <AmpStoriesOutlinedIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div className={classes.iconBackground}>
            <Tooltip title={t('workflow_action')}>
              <IconButton
                onClick={() => {
                  const actionQuery = buildActionQuery();
                  setDrawer({ open: true, type: 'actions', actionData: { query: actionQuery, total: 1 } });
                }}
                style={{ marginRight: 0 }}
              >
                <BiNetworkChart />
              </IconButton>
            </Tooltip>
          </div>
        </div>
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
      </>
    );
  }
);

export default AlertListItemActions;
