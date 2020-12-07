import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme
} from '@material-ui/core';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '@material-ui/icons/Warning';
import SearchQuery from 'components/visual/SearchBar/search-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertDrawerState } from './alerts';
import { AlertItem } from './hooks/useAlerts';
import usePromiseAPI from './hooks/usePromiseAPI';

interface AlertListItemActionsProps {
  item: AlertItem;
  currentQuery: SearchQuery;
  setDrawer: (state: AlertDrawerState) => void;
  onTakeOwnershipComplete?: () => void;
}

const AlertListItemActions: React.FC<AlertListItemActionsProps> = React.memo(
  ({ item, currentQuery, setDrawer, onTakeOwnershipComplete }) => {
    const { onTakeOwnership } = usePromiseAPI();
    const [progress, setProgress] = useState<boolean>(false);
    const [takeOwnershipConfirmation, setTakeOwnershipConfirmation] = useState<{ open: boolean; query: SearchQuery }>({
      open: false,
      query: null
    });

    const onTakeOwnershipOkClick = async () => {
      setProgress(true);
      try {
        await onTakeOwnership(takeOwnershipConfirmation.query);
        setProgress(false);
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
      const _actionQuery = currentQuery.newBase(name => {
        return name === 'tc_start';
      });

      const groupBy = currentQuery.getGroupBy();

      //
      if (groupBy === 'file.sha256') {
        _actionQuery.setQuery(`file.sha256:${item.file.sha256}`);
      } else if (groupBy === 'file.sha1') {
        _actionQuery.setQuery(`file.sha1:${item.file.sha1}`);
      } else if (groupBy === 'file.md5') {
        _actionQuery.setQuery(`file.md5:${item.file.md5}`);
      } else if (groupBy === 'file.name') {
        _actionQuery.setQuery(`file.name:${item.file.name}`);
      } else if (groupBy === 'priority') {
        _actionQuery.setQuery(`priority:${item.priority}`);
      } else if (groupBy === 'status') {
        _actionQuery.setQuery(`status:${item.status}`);
      }
      return _actionQuery;
    };

    return (
      <>
        <div>
          {!item.owner && (
            <IconButton
              title="Take Ownership"
              onClick={() => {
                setTakeOwnershipConfirmation({ open: true, query: buildActionQuery() });
              }}
            >
              <AssignmentIndIcon />
            </IconButton>
          )}
          <IconButton
            title="Workflow Action"
            onClick={() => {
              const actionQuery = buildActionQuery();
              setDrawer({ open: true, type: 'actions', actionData: { query: actionQuery, total: 1 } });
            }}
          >
            <AccountTreeIcon />
          </IconButton>
        </div>
        {takeOwnershipConfirmation.open && (
          <TakeOwnershipConfirmDialog
            item={item}
            progress={progress}
            open={takeOwnershipConfirmation.open}
            actionQuery={takeOwnershipConfirmation.query}
            onTakeOwnershipOkClick={onTakeOwnershipOkClick}
            onTakeOwnershipCancelClick={onTakeOwnershipCancelClick}
          />
        )}
      </>
    );
  }
);

const TakeOwnershipConfirmDialog: React.FC<{
  open: boolean;
  progress: boolean;
  actionQuery: SearchQuery;
  item: AlertItem;
  onTakeOwnershipOkClick: () => void;
  onTakeOwnershipCancelClick: () => void;
}> = ({ open, progress, actionQuery, item, onTakeOwnershipOkClick, onTakeOwnershipCancelClick }) => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  let content = t('page.alerts.actions.takeownershipdiag.content');
  content = content.replace('{0}', `${item.group_count}`);
  content = content.replace('{1}', actionQuery.getGroupBy());
  const groupByValue = actionQuery.getQuery().split(':')[1];

  return (
    <Dialog disableBackdropClick disableEscapeKeyDown maxWidth="xs" open={open}>
      <DialogTitle>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', color: theme.palette.warning.main }}>
          <WarningIcon fontSize="large" />
          <Typography style={{ marginLeft: theme.spacing(2) }} variant="h6">
            {t('page.alerts.actions.takeownershipdiag.header')}
          </Typography>
        </div>
      </DialogTitle>
      <DialogContent dividers>
        <div>{content}:</div>
        <div style={{ padding: theme.spacing(1), wordBreak: 'break-all' }}>
          <Typography variant="caption">{groupByValue}</Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onTakeOwnershipOkClick}
          variant="contained"
          color="primary"
          size="small"
          startIcon={progress ? <CircularProgress size={20} /> : <CheckIcon />}
          disabled={progress}
        >
          {t('page.alerts.actions.ok')}
        </Button>
        <Button
          autoFocus
          onClick={onTakeOwnershipCancelClick}
          variant="contained"
          size="small"
          startIcon={<CloseIcon />}
        >
          {t('page.alerts.actions.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertListItemActions;
