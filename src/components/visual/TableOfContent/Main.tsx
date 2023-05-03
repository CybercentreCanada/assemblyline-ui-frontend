import makeStyles from '@mui/styles/makeStyles';
import React, { useCallback, useEffect, useLayoutEffect, useTransition } from 'react';
import { AnchorDef, NodeDef, useStore } from './Provider';
import Section from './Section';
import { getValueFromPath } from './utils';

const useStyles = makeStyles(theme => ({
  main: {
    display: 'grid',
    marginTop: '-64px',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: '1fr 242px'
    }
  },
  content: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingTop: '64px'
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
  active: {
    '&>a': {
      color: `${theme.palette.primary.main} !important`,
      borderLeft: `1px solid ${theme.palette.primary.main} !important`,
      '&:hover': {
        color: `${theme.palette.secondary.main} !important`,
        borderLeft: `1px solid ${theme.palette.secondary.main} !important`
      }
    }
  }
}));

type MainProps = {
  children: React.ReactNode;
};

type FormatNodes = (
  _anchors?: AnchorDef[],
  _nodes?: NodeDef[],
  _depth?: number
) => { _anchors: AnchorDef[]; _nodes: NodeDef[] };

export const WrappedMain = ({ children }: MainProps) => {
  const classes = useStyles();
  const [anchors, setStore] = useStore(store => store.anchors);
  const [, startScrollTransition] = useTransition();

  const formatNodes: FormatNodes = useCallback((_anchors = [], _nodes = [], _depth = 1) => {
    if (!Array.isArray(_anchors) || _anchors.length === 0) return { _anchors, _nodes };
    const _anchor = _anchors[0];
    if (_anchor.path.length === _depth) {
      return formatNodes(_anchors.slice(1), [..._nodes, { ..._anchor, subNodes: [] }], _depth);
    } else if (_anchor.path.length > _depth) {
      const { _anchors: newAnchors, _nodes: subNodes } = formatNodes(
        _anchors.slice(1),
        [{ ..._anchor, subNodes: [] }],
        _depth + 1
      );
      _nodes[_nodes.length - 1].subNodes = subNodes;
      return formatNodes(newAnchors, _nodes, _depth);
    } else return { _anchors, _nodes };
  }, []);

  useEffect(() => {
    setStore(store => ({ nodes: formatNodes(anchors)._nodes }));
  }, [anchors, formatNodes, setStore]);

  useLayoutEffect(() => {
    const item = anchors?.find(anchor => anchor.hash === window?.location?.hash?.slice(1));
    if (!item) return;
    item.element.scrollIntoView({ behavior: 'smooth' } as ScrollIntoViewOptions);
  }, [anchors]);

  useEffect(() => {
    const onScroll = () => {
      startScrollTransition(() => {
        setStore(store => {
          if (store.nodes.length === 0) return {};
          const appBarHeight = document.getElementById('appbar').getBoundingClientRect().height;
          let index = store.anchors.length - 1;
          while (index >= 0) {
            const top = store.anchors[index].element.getBoundingClientRect()?.top;
            if (top + window.scrollY - appBarHeight <= 0 && top - window.scrollY <= window.innerHeight) break;
            index -= 1;
          }
          if (index === null || index === undefined || index < 0) return { activeIndex: null };

          const node1 = getValueFromPath(store.nodes, store.anchors[store.activeIndex]?.path);
          node1?.link?.classList?.remove(classes.active);

          const node2 = getValueFromPath(store.nodes, store.anchors[index]?.path);
          node2?.link?.classList?.add(classes.active);

          return { activeIndex: index, activePath: store.anchors[index].path };
        });
      });
    };

    onScroll();
    document.getElementById('app-scrollct').addEventListener('scroll', onScroll);
    return () => {
      document.getElementById('app-scrollct').removeEventListener('scroll', onScroll);
    };
  }, [classes.active, setStore, startScrollTransition]);

  return (
    <main className={classes.main}>
      <div id="main-content" className={classes.content}>
        {children}
      </div>
      <nav id="table-of-content" className={classes.toc}>
        <Section />
      </nav>
    </main>
  );
};

export const Main = React.memo(WrappedMain);
export default Main;
