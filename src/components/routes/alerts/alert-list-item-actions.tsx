import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
  useTheme
} from '@material-ui/core';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import WarningIcon from '@material-ui/icons/Warning';
import SearchQuery from 'components/elements/search/search-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FcWorkflow } from 'react-icons/fc';
import { AlertDrawerState } from './alerts';
import { AlertItem } from './hooks/useAlerts';

// Some generated style classes
const useStyles = makeStyles(theme => ({
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    width: '600px',
    [theme.breakpoints.down('xs')]: {
      width: '100vw'
    }
  },
  searchresult: {
    fontStyle: 'italic'
  },
  listactions: {}
}));

interface AlertListItemActionsProps {
  item: AlertItem;
  searchQuery: SearchQuery;
  setDrawer: (state: AlertDrawerState) => void;
}

const AlertListItemActions: React.FC<AlertListItemActionsProps> = React.memo(({ item, searchQuery, setDrawer }) => {
  const [takeOwnershipConfirmation, setTakeOwnershipConfirmation] = useState<{ open: boolean; query: SearchQuery }>({
    open: false,
    query: null
  });
  const classes = useStyles();

  const onTakeOwnershipOkClick = () => {
    setTakeOwnershipConfirmation({ open: false, query: null });
  };

  const onTakeOwnershipCancelClick = () => {
    setTakeOwnershipConfirmation({ open: false, query: null });
  };

  const buildActionQuery = (): SearchQuery => {
    const _actionQuery = searchQuery.newBase(name => {
      return name === 'tc_start';
    });

    const groupBy = searchQuery.getGroupBy();

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
      <div className={classes.listactions}>
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
            console.log('workflow action.');
            const actionQuery = buildActionQuery();
            setDrawer({ open: true, type: 'actions', actionData: { query: actionQuery, total: 1 } });
          }}
        >
          <FcWorkflow />
        </IconButton>
      </div>
      {takeOwnershipConfirmation.open && (
        <TakeOwnershipConfirmDialog
          item={item}
          open={takeOwnershipConfirmation.open}
          actionQuery={takeOwnershipConfirmation.query}
          onTakeOwnershipOkClick={onTakeOwnershipOkClick}
          onTakeOwnershipCancelClick={onTakeOwnershipCancelClick}
        />
      )}
    </>
  );
});

const TakeOwnershipConfirmDialog: React.FC<{
  open: boolean;
  actionQuery: SearchQuery;
  item: AlertItem;
  onTakeOwnershipOkClick: () => void;
  onTakeOwnershipCancelClick: () => void;
}> = ({ open, actionQuery, item, onTakeOwnershipOkClick, onTakeOwnershipCancelClick }) => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  let content = t('page.alerts.actions.takeownershipdiag.content');
  content = content.replace('{0}', `${item.group_count}`);
  content = content.replace('{1}', actionQuery.getGroupBy());

  console.log(actionQuery);
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
        <div>{content}</div>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onTakeOwnershipCancelClick} variant="contained" size="small">
          {t('page.alerts.actions.cancel')}
        </Button>
        <Button onClick={onTakeOwnershipOkClick} variant="contained" color="primary" size="small">
          {t('page.alerts.actions.ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertListItemActions;
