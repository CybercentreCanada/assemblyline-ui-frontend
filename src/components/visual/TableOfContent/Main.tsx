import makeStyles from '@mui/styles/makeStyles';
import React, { useCallback, useEffect, useLayoutEffect, useTransition } from 'react';
import { AnchorDef, NodeDef, Props, useSignal, useStore } from './ContentWithTOC';
import Section from './Section';

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

type FormatNodes = (
  _anchors?: AnchorDef[],
  _nodes?: NodeDef[],
  _depth?: number
) => { _anchors: AnchorDef[]; _nodes: NodeDef[] };

export const WrappedMain = ({ translation, children, titleI18nKey = 'toc', topI18nKey = 'top' }: Props) => {
  const classes = useStyles();
  const anchors = useSignal(store => store.anchors);
  const setStore = useStore();
  const [, startScrollTransition] = useTransition();

  const formatNodes: FormatNodes = useCallback((_anchors = [], _nodes = [], _depth = 1) => {
    if (!Array.isArray(_anchors) || _anchors.length === 0) return { _anchors, _nodes };
    const _anchor = _anchors[0];
    if (_anchor.path.length === _depth) {
      return formatNodes(_anchors.slice(1), [..._nodes, { anchorHash: _anchor.hash, subNodes: [] }], _depth);
    } else if (_anchor.path.length > _depth) {
      const { _anchors: newAnchors, _nodes: subNodes } = formatNodes(
        _anchors.slice(1),
        [{ anchorHash: _anchor.hash, subNodes: [] }],
        _depth + 1
      );
      _nodes[_nodes.length - 1].subNodes = subNodes;
      return formatNodes(newAnchors, _nodes, _depth);
    } else return { _anchors, _nodes };
  }, []);

  useEffect(() => {
    setStore(store => ({ translation, titleI18nKey, topI18nKey }));
  }, [setStore, titleI18nKey, topI18nKey, translation]);

  useEffect(() => {
    setStore(store => ({ nodes: formatNodes(anchors)._nodes }));
  }, [anchors, formatNodes, setStore]);

  useLayoutEffect(() => {
    const item = anchors?.find(anchor => anchor.hash === window?.location?.hash?.slice(1));
    if (item) item.element.scrollIntoView({ behavior: 'smooth' } as ScrollIntoViewOptions);
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

          store.anchors[store.activeIndex]?.link?.classList?.remove(classes.active);
          store.anchors[index]?.link?.classList?.add(classes.active);
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
      <div id="content" className={classes.content}>
        {children}
      </div>
      <nav id="toc" className={classes.toc}>
        <Section />
      </nav>
    </main>
  );
};

export const Main = React.memo(WrappedMain);
export default Main;
