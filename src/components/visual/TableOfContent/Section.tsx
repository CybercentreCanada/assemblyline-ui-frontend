import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { MouseEventHandler, useCallback } from 'react';
import { Node } from './Node';
import { useStore } from './Provider';

const useStyles = makeStyles(theme => ({
  main: {
    display: 'grid',
    width: '100%',
    marginTop: '-64px',
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: '1fr 242px'
    }
  },
  content: {
    paddingTop: '64px',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  },
  toc: {
    display: 'none',
    height: '100vh',
    overflowY: 'auto',
    paddingBottom: '32px',
    paddingLeft: '2px',
    paddingRight: '32px',
    paddingTop: '100px',
    position: 'sticky',
    top: 0,
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    },
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  },
  typography: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    scrollSnapMarginTop: theme.typography.h1.fontSize,
    scrollMarginTop: theme.typography.h1.fontSize,
    '&:hover>a': {
      display: 'inline-flex',
      opacity: 1
    }
  },
  anchor: {
    transition: 'display 50ms, opacity 50ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    display: 'hidden',
    opacity: 0,
    minWidth: 0,
    padding: theme.spacing(0.25)
  },
  icon: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5)
  },
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    '&>li>a': {
      color: theme.palette.text.secondary,
      textDecoration: 'none',
      padding: '0px 8px 0px 10px',
      margin: '4px 0px 8px',
      borderLeft: `1px solid transparent`,
      '&:hover': {
        color: theme.palette.text.primary,
        borderLeft: `1px solid ${theme.palette.text.primary}`
      },
      '&:active': {
        color: `${theme.palette.primary.main} !important`,
        borderLeft: `1px solid ${theme.palette.primary.main} !important`
      },
      '&:active:hover': {
        color: `${theme.palette.secondary.main} !important`,
        borderLeft: `1px solid ${theme.palette.secondary.main} !important`
      }
    },
    '&>li>a &>li>a.active': {}
  },
  li: {
    display: 'flex',
    padding: 0,
    margin: 0,
    fontWeight: 500,
    fontSize: '0.8125rem',
    '&:hover>.expand': {
      opacity: 1
    }
  },
  link: {
    flex: 1,
    color: theme.palette.text.secondary,
    textDecoration: 'none',
    padding: '0px 8px 0px 10px',
    margin: '4px 0px 8px',
    borderLeft: `1px solid transparent`,
    '&:hover': {
      color: theme.palette.text.primary,
      borderLeft: `1px solid ${theme.palette.text.primary}`
    },
    '&:active': {
      color: `${theme.palette.primary.main} !important`,
      borderLeft: `1px solid ${theme.palette.primary.main} !important`
    },
    '&:active:hover': {
      color: `${theme.palette.secondary.main} !important`,
      borderLeft: `1px solid ${theme.palette.secondary.main} !important`
    }
  },
  active: {
    '&>a': {
      color: `${theme.palette.primary.main} !important`,
      borderLeft: `1px solid ${theme.palette.primary.main} !important`,
      '&:hover': {
        color: `${theme.palette.secondary.main} !important`,
        borderLeft: `1px solid ${theme.palette.secondary.main} !important`
      }
    }
  },
  expandContainer: {
    opacity: 0,
    '&.visible': {
      opacity: 1
    }
  },
  expandIconButton: {
    transform: 'rotate(90deg)',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
  },
  expanded: {
    transform: 'rotate(0deg)'
  },
  title: {
    flex: 1,
    textDecoration: 'none',
    padding: '0px 8px 0px 0px',
    margin: '4px 0px 8px'
  }
}));

export const WrappedSection = () => {
  const classes = useStyles();
  const [nodes, setStore] = useStore(store => store.nodes);
  const [expandAll] = useStore(store => store.expandAll);

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    setStore(store => ({ expandAll: !store.expandAll }));
  }, [setStore]);

  return (
    <>
      <Typography className={clsx(classes.li)} component="div" variant="body1">
        <div className={classes.title}>
          <span>{'Contents'}</span>
        </div>
        <div className={clsx('expand', classes.expandContainer, expandAll && 'visible')}>
          <IconButton
            className={clsx(classes.expandIconButton, expandAll && classes.expanded)}
            size="small"
            onClick={handleClick}
          >
            <ExpandMoreIcon fontSize="inherit" />
          </IconButton>
        </div>
      </Typography>
      <Typography component="ul" className={classes.ul} variant="body1">
        {nodes.map((_, i) => (
          <Node key={`${nodes[i].hash}`} path={[i]} depth={0} />
        ))}
      </Typography>
    </>
  );
};

export const Section = React.memo(WrappedSection);
export default Section;
