import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Collapse, IconButton, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSignal, useStore } from './ContentWithTOC';
import { arrayEquals, arraySubset, getValueFromPath, setValueFromPath } from './utils';

const useStyles = makeStyles(theme => ({
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
  const translation = useSignal(store => store.translation);

  const { t } = useTranslation(translation);
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLLIElement>();

  const node = useSignal(store => getValueFromPath(store.nodes, path));
  const anchor = useSignal(store => store.anchors.find(a => a.hash === node.anchorHash));
  const expandAll = useSignal(store => store.expandAll);
  const isActive = useSignal(store => arrayEquals(path, store.anchors[store.activeIndex]?.path));
  const isSubset = useSignal(store => arraySubset(path, store.anchors[store.activeIndex]?.path));
  const setStore = useStore();

  const isExpanded = useMemo<boolean>(() => expandAll || isSubset || open, [expandAll, isSubset, open]);
  const hasSubNodes = useMemo<boolean>(
    () => 'subNodes' in node && Array.isArray(node.subNodes) && node.subNodes.length > 0,
    [node]
  );

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(() => {
    const appBarHeight = Math.floor(document.getElementById('appbar').getBoundingClientRect().height);
    document
      .getElementById('app-scrollct')
      .scrollTo({ top: anchor.element.offsetTop - appBarHeight, behavior: 'smooth' });
  }, [anchor.element]);

  const handleCollapseClick: MouseEventHandler<HTMLButtonElement> = useCallback(event => {
    setOpen(o => !o);
  }, []);

  useEffect(() => {
    setStore(store => ({
      nodes: setValueFromPath(store.nodes, path, { key: 'link', value: ref.current })
    }));
  }, [path, setStore]);

  return (
    <>
      <Typography ref={ref} component="li" className={clsx(classes.li, isActive && classes.active)}>
        <Link
          className={classes.link}
          children={t(anchor.i18nKey)}
          data-no-markdown-link={anchor.hash}
          to={`${window.location.search}#${anchor.hash}`}
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
            <Node key={`${node.subNodes[i].anchorHash}`} path={[...path, i]} depth={depth + 1} />
          ))}
        </Collapse>
      )}
    </>
  );
};

export const Node = React.memo(WrappedNode);
export default Node;
