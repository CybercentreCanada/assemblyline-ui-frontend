import { IconButton, makeStyles } from '@material-ui/core';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import SearchQuery from 'components/elements/search/search-query';
import React from 'react';
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
  const classes = useStyles();
  return (
    <div className={classes.listactions}>
      <IconButton title="Take Ownership" onClick={() => console.log('click')}>
        <AssignmentIndIcon />
      </IconButton>
      <IconButton
        title="Workflow Action"
        onClick={() => {
          console.log('workflow action.');

          const actionQuery = searchQuery.newBase();
          actionQuery.setTcStart(searchQuery.getTcStart()).setQuery(`file.sha256:${item.file.sha256}`);
          setDrawer({ open: true, type: 'actions', actionData: { query: actionQuery, total: 1 } });
        }}
      >
        <FcWorkflow />
      </IconButton>
    </div>
  );
});

export default AlertListItemActions;
