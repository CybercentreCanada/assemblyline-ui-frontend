import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Button, Collapse, IconButton, Typography, TypographyTypeMap } from '@mui/material';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from 'react';
import { Link } from 'react-router-dom';

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
    padding: 0,
    margin: 0,
    fontWeight: 500,
    fontSize: '0.8125rem'
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

type ToCContextProps = {
  onAnchorCreate?: (item: TocItem) => TocItem;
  onAnchorClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, item: TocItem) => void;
  onLinkCreate?: (node: TocNode, link: HTMLElement) => void;
  onLinkClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, item: TocItem) => void;
};

type PageWithToCProps = {
  children: React.ReactNode;
  margin?: number;
};

type ToCItemProps = {
  children: React.ReactNode;
};

type TocItem = {
  id?: string;
  hash?: string; // to replace id
  title?: string;
  index?: number;
  level?: number;
  path?: number[];
  isAdmin?: boolean;
  anchor?: HTMLElement;
  link?: HTMLElement;
  collapse?: boolean;
};

export type TocNode = TocItem & {
  subNodes?: TocNode[];
};

const ToCContext = React.createContext<ToCContextProps>(null);

const useMyToc: () => ToCContextProps = () => useContext(ToCContext) as ToCContextProps;

const WrappedPageWithToC = ({ children, margin }: PageWithToCProps) => {
  const classes = useStyles();

  const [tableOfContent, setTableOfContent] = useState<TocNode[]>([]);
  const [anchors, setAnchors] = useState<TocItem[]>([]);
  const anchorsRef = useRef<TocItem[]>([]);
  const activeAnchor = useRef<TocItem>();
  const [, startScrollTransition] = useTransition();

  const nextPath = useCallback((path: number[] = [0], depth: number = 0): number[] => {
    let next = [];
    for (let i = 0; i <= depth; ++i) {
      if (i < path.length && i < depth) next = [...next, path[i]];
      else if (i < path.length && i === depth) next = [...next, path[i] + 1];
      else next = [...next, 0];
    }
    return next;
  }, []);

  const updateValueFromPath = useCallback(
    (nodes: TocNode[], path: number[], { key, value }: { key: any; value: any }): TocNode[] => {
      if (Array.isArray(path) && path.length <= 1) nodes[path[0]] = { ...nodes[path[0]], [key]: value };
      else if (nodes[path[0]] && 'subNodes' in nodes[path[0]])
        nodes[path[0]].subNodes = updateValueFromPath(nodes[path[0]].subNodes, path.slice(1), { key, value });
      return nodes;
    },
    []
  );

  const formatAnchorPath = useCallback(
    (items: TocItem[] = []): TocItem[] => {
      let item = items[0];
      let result = [{ ...item, path: [0] }];
      let depth = 0;
      for (let i = 1; i < items.length; i++) {
        const lastResult = result[result.length - 1];
        if (items[i].level < lastResult.level) depth -= 1;
        else if (items[i].level > lastResult.level) depth += 1;
        depth = Math.max(depth, 0);
        result = [...result, { ...items[i], path: nextPath(lastResult.path, depth) }];
      }
      return result;
    },
    [nextPath]
  );

  const formatNodes = useCallback(
    (items: TocItem[] = [], nodes: TocNode[] = [], depth: number = 1): { items: TocItem[]; nodes: TocNode[] } => {
      if (!Array.isArray(items) || items.length === 0) return { items, nodes };
      const item = items[0];
      if (item.path.length === depth) {
        return formatNodes(items.slice(1), [...nodes, { ...item, subNodes: [] }], depth);
      } else if (item.path.length > depth) {
        const { items: newItems, nodes: subNodes } = formatNodes(
          items.slice(1),
          [{ ...item, subNodes: [] }],
          depth + 1
        );
        nodes[nodes.length - 1].subNodes = subNodes;
        return formatNodes(newItems, nodes, depth);
      } else return { items, nodes };
    },
    []
  );

  // Reset the Table of Content on page reload
  useLayoutEffect(() => {
    setAnchors([]);
    setTableOfContent([]);
    anchorsRef.current = [];
    return () => {
      setAnchors([]);
      setTableOfContent([]);
      anchorsRef.current = [];
    };
  }, []);

  // Reset the Table of Content on page reload
  useEffect(() => {
    setAnchors([]);
    setTableOfContent([]);
    anchorsRef.current = [];
    return () => {
      setAnchors([]);
      setTableOfContent([]);
      anchorsRef.current = [];
    };
  }, []);

  // Create the Table of Content from the page anchors
  useEffect(() => {
    setTableOfContent(formatNodes(anchors).nodes);
  }, [anchors, formatNodes]);

  // Select the active anchor on page scroll
  useEffect(() => {
    const onScroll = () => {
      startScrollTransition(() => {
        const el = anchorsRef.current.find(item => {
          const top = item.anchor.getBoundingClientRect().top;
          return top + window.scrollY >= 0 && top - window.scrollY <= window.innerHeight;
        });

        if (!el) return;
        activeAnchor?.current?.link?.classList?.remove(classes.active);
        el?.link?.classList?.add(classes.active);
        activeAnchor.current = el;
      });
    };

    onScroll();
    document.getElementById('app-scrollct').addEventListener('scroll', onScroll);
    return () => {
      document.getElementById('app-scrollct').removeEventListener('scroll', onScroll);
    };
  }, [classes.active, startScrollTransition]);

  const onAnchorCreate: ToCContextProps['onAnchorCreate'] = useCallback(
    item => {
      const newAnchors = formatAnchorPath([...anchorsRef.current, { ...item, collapse: true }]);
      newAnchors[newAnchors.length - 1].hash = `${newAnchors[newAnchors.length - 1].path
        .map(p => p + 1)
        .join('.')}-${newAnchors[newAnchors.length - 1].title.replace(/\s/g, '-')}`;
      anchorsRef.current = newAnchors;
      setAnchors(newAnchors);
      return newAnchors[newAnchors.length - 1];
    },
    [formatAnchorPath]
  );

  const onAnchorClick: ToCContextProps['onAnchorClick'] = useCallback((event, item) => {
    item.anchor.scrollIntoView({ behavior: 'smooth', block: 'start' } as ScrollIntoViewOptions);
  }, []);

  const onLinkCreate: ToCContextProps['onLinkCreate'] = useCallback(
    (node, link) => {
      setAnchors(_anchors => {
        const index = _anchors.findIndex(a => Object.is(a.path, node.path));
        _anchors[index] = { ..._anchors[index], link };
        return _anchors;
      });
      setTableOfContent(toc => updateValueFromPath(toc, node.path, { key: 'link', value: link }));
    },
    [updateValueFromPath]
  );

  const onLinkClick: ToCContextProps['onLinkClick'] = useCallback((event, item) => {
    item.anchor.scrollIntoView({ behavior: 'smooth', block: 'start' } as ScrollIntoViewOptions);
  }, []);

  return (
    <ToCContext.Provider value={{ onAnchorCreate, onAnchorClick, onLinkCreate, onLinkClick }}>
      <main className={classes.main}>
        <div id="main-content" className={classes.content}>
          {useMemo(
            () => (
              <>{children}</>
            ),
            [children]
          )}
        </div>
        <nav id="toc-content" className={classes.toc}>
          <Typography variant="body1" children={'Contents'} />
          {useMemo(
            () => (
              <Typography component="ul" className={classes.ul} variant="body1">
                {tableOfContent.map(node => (
                  <ToCLink key={`${node.path.join('-')}-${node.title}`} node={node} depth={0} />
                ))}
              </Typography>
            ),
            [classes.ul, tableOfContent]
          )}
        </nav>
      </main>
    </ToCContext.Provider>
  );
};

/**
 * TABLE OF CONTENT LINK
 */
type ToCElementProps = {
  node: TocNode;
  depth?: number;
};

const ToCLink: React.FC<ToCElementProps> = ({ node, depth = 0 }) => {
  const classes = useStyles();

  const { onLinkCreate, onLinkClick } = useMyToc();
  const ref = useRef();

  useEffect(() => {
    onLinkCreate(node, ref.current);
  }, [node, onLinkCreate]);

  return (
    <>
      <Typography ref={ref} component="li" className={classes.li} style={{ marginLeft: `calc(${depth}*10px)` }}>
        <Link
          children={node.title}
          data-no-markdown-link={node.id}
          to={`#${node.hash}`}
          onClick={event => {
            onLinkClick(event, { ...node, link: ref.current });
          }}
        />
        <IconButton size="small">{node.collapse ? <ExpandMore /> : <ExpandLess />}</IconButton>
      </Typography>
      <Collapse in={node.collapse} timeout="auto" unmountOnExit>
        {node.subNodes.map(subNode => (
          <ToCLink key={`${subNode.path.join('-')}-${subNode.title}`} node={subNode} depth={depth + 1} />
        ))}
      </Collapse>
    </>
  );
};

/**
 * TYPOGRAPHY ANCHOR
 */
type ToCAnchorProps = DefaultComponentProps<TypographyTypeMap<{ label?: string; level?: number }, 'span'>>;

export const ToCAnchor = ({ children, label = null, level = 0, ...props }: ToCAnchorProps) => {
  const classes = useStyles();

  const { onAnchorCreate, onAnchorClick } = useMyToc();

  const [hash, setHash] = useState<string>(null);
  const ref = useRef<HTMLSpanElement>();

  useEffect(() => {
    const anchor = onAnchorCreate({ title: ref?.current?.innerText, level, anchor: ref.current });
    setHash(anchor.hash);
  }, [hash, level, onAnchorCreate]);

  return (
    <>
      {useMemo(
        () => (
          <Typography id={hash} ref={ref} className={classes.typography} {...props}>
            {`${children}`}
            <Button
              classes={{ root: clsx(classes.anchor) }}
              component={Link}
              size="small"
              tabIndex={-1}
              to={`#${hash}`}
              variant="outlined"
              onClick={event => {
                onAnchorClick(event, {
                  id: ref?.current?.innerText.replace(/\s/g, '-'),
                  title: ref?.current?.innerText,
                  anchor: ref.current
                });
              }}
            >
              <LinkOutlinedIcon className={classes.icon} />
            </Button>
          </Typography>
        ),
        [children, classes, hash, onAnchorClick, props]
      )}
    </>
  );
};

export const PageWithToC = React.memo(WrappedPageWithToC);
export default PageWithToC;
