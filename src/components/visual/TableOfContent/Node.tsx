import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Collapse, IconButton, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from './Provider';
import { arraySubset, getValueFromPath, setValueFromPath } from './utils';

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
  }
}));

type NodeProps = {
  path: number[];
  depth: number;
};

export const WrappedNode: React.FC<NodeProps> = ({ path = [], depth = 0 }) => {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLLIElement>();
  const [node, setStore] = useStore(store => getValueFromPath(store.nodes, path));
  const [expandAll] = useStore(store => store.expandAll);
  const [isActive] = useStore(store => arraySubset(path, store.activePath));
  const appBarHeight = useMemo(() => Math.floor(document.getElementById('appbar').getBoundingClientRect().height), []);
  const isExpanded = useMemo<boolean>(() => expandAll || isActive || open, [expandAll, isActive, open]);
  const hasSubNodes = useMemo<boolean>(
    () => 'subNodes' in node && Array.isArray(node.subNodes) && node.subNodes.length > 0,
    [node]
  );

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(() => {
    document
      .getElementById('app-scrollct')
      .scrollTo({ top: node.element.offsetTop - appBarHeight, behavior: 'smooth' });
  }, [appBarHeight, node.element]);

  const handleCollapseClick: MouseEventHandler<HTMLButtonElement> = useCallback(event => {
    setOpen(o => !o);
  }, []);

  useEffect(() => {
    setStore(store => ({
      nodes: setValueFromPath(store.nodes, path, { key: 'link', value: ref.current })
    }));
  }, [path, setStore]);

  // console.log(node);

  return (
    <>
      <Typography ref={ref} component="li" className={classes.li}>
        <Link
          className={classes.link}
          children={node.label}
          data-no-markdown-link={node.hash}
          to={`${window.location.search}#${node.hash}`}
          tabIndex={-1}
          onClick={handleClick}
          style={{ paddingLeft: `calc(${depth + 1}*10px)` }}
        />
        {hasSubNodes && (
          <div className={clsx('expand', classes.expandContainer, isExpanded && !expandAll && 'visible')}>
            <IconButton
              className={clsx(classes.expandIconButton, isExpanded && !expandAll && classes.expanded)}
              size="small"
              onClick={e => handleCollapseClick(e)}
            >
              <ExpandMoreIcon fontSize="inherit" />
            </IconButton>
          </div>
        )}
      </Typography>
      {hasSubNodes && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit component="ul" className={classes.ul}>
          {node.subNodes.map((_, i) => (
            <Node key={`${node.subNodes[i].hash}`} path={[...path, i]} depth={depth + 1} />
          ))}
        </Collapse>
      )}
    </>
  );
};

export const Node = React.memo(WrappedNode);
export default Node;
