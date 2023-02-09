import makeStyles from '@mui/styles/makeStyles';
import { darken, lighten } from '@mui/material/styles';

export const useTableStyles = makeStyles(theme => ({
  container: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    outline: 'none'
  },
  header: {
    display: 'flex'
  },
  headerCell: {
    position: 'relative',
    flexGrow: 0,
    textAlign: 'left',
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    border: '1px solid',
    borderColor: 'transparent',
    '&:hover $headerCellMenuBtn': {
      display: 'inherit',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? lighten(theme.palette.background.default, 0.05)
          : darken(theme.palette.background.default, 0.05)
    },
    '&[data-menuopen="true"]': {
      border: '1px dashed',
      borderColor:
        theme.palette.mode === 'dark'
          ? lighten(theme.palette.background.default, 0.3)
          : darken(theme.palette.background.default, 0.3),
      backgroundColor:
        theme.palette.mode === 'dark'
          ? lighten(theme.palette.background.default, 0.05)
          : darken(theme.palette.background.default, 0.05)
    }
  },
  headerCellMenuBtn: {
    display: 'none',
    position: 'absolute',
    top: theme.spacing(0.5),
    right: theme.spacing(0.5)
  },
  headerCellMenuPopper: {
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
    backgroundColor:
      theme.palette.mode === 'dark' ? lighten(theme.palette.background.default, 0.1) : theme.palette.background.default
  },
  bodyOuter: {
    position: 'relative',
    flex: 1
  },
  bodyInnerFlex: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'auto'
  },
  row: {},
  rowInner: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  cell: {
    flex: 1,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  top: {
    display: 'flex',
    alignItems: 'center'
    // paddingBottom: theme.spacing(1)
  },
  filterSelector: {
    marginBottom: theme.spacing(2)
  },
  filterList: {
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export const useItemStyles = makeStyles(theme => ({
  item: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    '&[data-listitem-focus="true"]': {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? lighten(theme.palette.background.default, 0.25)
          : darken(theme.palette.background.default, 0.25)
    },
    '&[data-listitem-selected="true"]': {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? lighten(theme.palette.background.default, 0.025)
          : darken(theme.palette.background.default, 0.025)
    }
  },
  itemDivider: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider
  },
  itemHover: {
    '& $actions': {
      display: 'none',
      verticalAlign: 'center'
    },
    '&:hover': {
      cursor: 'pointer',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? lighten(theme.palette.background.default, 0.05)
          : darken(theme.palette.background.default, 0.05)
    },
    '&:hover $actions': {
      display: 'inherit'
    }
  },
  children: {},
  actions: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'inherit',
    margin: 'auto'
  }
}));
