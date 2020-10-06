import { makeStyles } from '@material-ui/core';

const useMetaListStyles = makeStyles(theme => ({
  outer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'auto',
    width: '100%',
    height: '100%',
    outline: 'none'
  },
  inner: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden'
  },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  progressCt: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.7,
    zIndex: 1,
    alignItems: 'center',
    backgroundColor: theme.palette.background.default
  },
  progressSpinner: {
    position: 'absolute',
    left: '50%',
    top: '50%'
  }
}));

const useBooklistStyles = makeStyles(theme => ({
  outer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  inner: {
    position: 'relative',
    overflow: 'auto',
    outline: 'none'
  },
  pager: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(1)
  },
  pagerSpacer: {
    flex: 1
  },
  pagerItems: {
    display: 'flex',
    flexDirection: 'row'
  },
  pagerItem: {
    marginLeft: theme.spacing(1),
    display: 'inline-block'
  },
  progressCt: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.7,
    zIndex: 1,
    alignItems: 'center',
    backgroundColor: theme.palette.background.default
  },
  progressSpinner: {
    position: 'absolute',
    left: '50%',
    top: '50%'
  }
}));

const useInfinitelistStyles = makeStyles(theme => ({
  outer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  inner: {
    position: 'relative',
    overflow: 'auto',
    outline: 'none',
    height: '100%'
  },
  pagerItems: {
    display: 'flex',
    flexDirection: 'row'
  },
  pagerItem: {
    marginLeft: theme.spacing(1),
    display: 'inline-block'
  },
  progressCt: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.7,
    zIndex: 1,
    alignItems: 'center',
    backgroundColor: theme.palette.background.default
  },
  progressSpinner: {
    position: 'absolute',
    left: '50%',
    top: '50%'
  }
}));

const useListItemStyles = makeStyles(theme => ({
  itemCt: {
    position: 'relative',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-listitem-focus="true"]': {
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-listitem-selected="true"]': {
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 15%)' : 'hsl(0, 0%, 92%)'
    }
  },
  itemOuter: {
    position: 'relative',
    overflow: 'auto'
  },
  itemInner: {},
  itemDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  }
}));

export default function useListStyles() {
  return {
    listItemClasses: useListItemStyles(),
    metaListClasses: useMetaListStyles(),
    booklistClasses: useBooklistStyles(),
    infinitelistClases: useInfinitelistStyles()
  };
}
