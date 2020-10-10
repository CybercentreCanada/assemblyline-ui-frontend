import { Button, makeStyles } from '@material-ui/core';
import SearchQuery from 'components/elements/search/search-query';
import React from 'react';

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
  searchQuery: SearchQuery;
  updateQuery: (query: SearchQuery) => void;
  setDrawer: (drawer: { open: boolean; type: 'filter' | 'favorites' | 'actions' }) => void;
}

const AlertListItemActions: React.FC<AlertListItemActionsProps> = React.memo(({ updateQuery, setDrawer }) => {
  const classes = useStyles();
  return (
    <div className={classes.listactions}>
      <Button
        title="Workflow Action"
        onClick={() => {
          console.log('workflow action');
          // const q = newQuery()
          //   .setQuery(`file.sha256:${item.file.sha256}`)
          //   .setTc(query.getTc())
          //   .setTcStart(query.getTcStart());
          // setWorkflowAction({ query: q, total: 1, filters: q.parseFilters() });
          // setDrawer({ open: true, type: 'actions' });
        }}
        color="primary"
        size="small"
        variant="outlined"
      >
        Workflow Action
      </Button>
      <Button
        title="Take Ownership"
        onClick={() => console.log('click')}
        color="primary"
        size="small"
        variant="outlined"
      >
        Take Ownership
      </Button>
    </div>
  );
});

export default AlertListItemActions;
