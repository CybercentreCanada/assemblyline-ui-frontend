import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Button, Typography, TypographyTypeMap } from '@mui/material';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, {
  RefObject,
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
  getUniqueID?: () => string;
  onAnchorCreate?: (data: ToCData) => void;
  onAnchorClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: ToCData) => void;
  onAnchorVisible?: (data: ToCData, visible: boolean) => void;
  onLinkCreate?: (data: ToCData) => void;
  onLinkClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: ToCData) => void;
};

type PageWithToCProps = {
  children: React.ReactNode;
  margin?: number;
};

type ToCItemProps = {
  children: React.ReactNode;
};

export type ToCItem = {
  id: string;
  subItems?: ToCItem[];
  is_admin?: boolean;
};

type ToCData = {
  id?: string;
  title?: string;
  index?: number;
  level?: number;
  anchor?: HTMLElement;
  link?: HTMLElement;
};

export type ContentWithTOCItemDef = {
  id: string;
  subItems?: ContentWithTOCItemDef[];
  is_admin?: boolean;
};

const ToCContext = React.createContext<ToCContextProps>(null);

const useMyToc: () => ToCContextProps = () => useContext(ToCContext) as ToCContextProps;

const WrappedPageWithToC = ({ children, margin }: PageWithToCProps) => {
  const classes = useStyles();

  const [tableOfContent, setTableOfContent] = useState<ToCData[]>([]);
  const tableOfContentRef = useRef<ToCData[]>([]);
  const activeElement = useRef<ToCData>();
  const [, startScrollTransition] = useTransition();

  /**
   * Reset the Table of Content on reload
   */
  useLayoutEffect(() => {
    setTableOfContent([]);
    return () => setTableOfContent([]);
  }, []);

  /**
   * Reset the Table of Content on reload
   */
  useEffect(() => {
    setTableOfContent([]);
    return () => setTableOfContent([]);
  }, []);

  /**
   * Apply the Table of Content State on its Ref
   */
  useEffect(() => {
    tableOfContentRef.current = tableOfContent;
  }, [tableOfContent]);

  const formatTableOfContent = useCallback((toc: ToCData[]) => {
    return toc;
  }, []);

  /**
   * Format the Table of Content array into another array
   */
  useEffect(() => {
    const newTOC = formatTableOfContent(tableOfContent);
  }, [formatTableOfContent, tableOfContent]);

  const getUniqueID: ToCContextProps['getUniqueID'] = useCallback(() => {
    return '';
  }, []);

  const onAnchorCreate: ToCContextProps['onAnchorCreate'] = useCallback(item => {
    setTableOfContent(toc => [...toc, item]);
  }, []);

  const onAnchorClick: ToCContextProps['onAnchorClick'] = useCallback((event, item) => {
    item.anchor.scrollIntoView({ behavior: 'smooth', block: 'start' } as ScrollIntoViewOptions);
  }, []);

  const onAnchorVisible: ToCContextProps['onAnchorVisible'] = useCallback((item, visible) => {
    // const element = tableOfContentRef.current.find(e => e.anchor === item.anchor);
    // if (!element || !('index' in element)) return;
    // if (visible) visibleElements.current = [...visibleElements.current, element].sort((a, b) => a.index - b.index);
    // else visibleElements.current = visibleElements.current.filter(i => i.index !== element.index);
    // if (visibleElements?.current && Array.isArray(visibleElements.current) && visibleElements.current.length > 0) {
    //   activeElement.current?.link.classList.remove(classes.active);
    //   visibleElements.current[0].link.classList.add(classes.active);
    //   activeElement.current = visibleElements.current[0];
    // }
    // console.log(
    //   visibleElements.current?.map(e => ({
    //     index: e.index
    //   }))
    // );
  }, []);

  const onLinkCreate: ToCContextProps['onLinkCreate'] = useCallback(item => {
    setTableOfContent(toc => {
      toc[item.index] = item;
      return toc;
    });
  }, []);

  const onLinkClick: ToCContextProps['onLinkClick'] = useCallback((event, item) => {
    document.getElementById(item.id).scrollIntoView({ behavior: 'smooth', block: 'start' } as ScrollIntoViewOptions);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      startScrollTransition(() => {
        const el = tableOfContentRef.current.find(item => {
          const top = item.anchor.getBoundingClientRect().top;
          return top + window.scrollY >= 0 && top - window.scrollY <= window.innerHeight;
        });

        if (!el) return;
        activeElement?.current?.link?.classList?.remove(classes.active);
        el?.link?.classList?.add(classes.active);
        activeElement.current = el;
      });
    };

    onScroll();
    document.getElementById('app-scrollct').addEventListener('scroll', onScroll);
    return () => {
      document.getElementById('app-scrollct').removeEventListener('scroll', onScroll);
    };
  }, [classes.active]);

  return (
    <ToCContext.Provider
      value={{ getUniqueID, onAnchorCreate, onAnchorClick, onAnchorVisible, onLinkCreate, onLinkClick }}
    >
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
                {tableOfContent.map((item, i) => (
                  <ToCLink key={`toc-${item.title}`} item={item} index={i} />
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
  item: ToCData;
  index: number;
};

const ToCLink: React.FC<ToCElementProps> = ({ item, index }) => {
  const classes = useStyles();

  const { onLinkCreate, onLinkClick } = useMyToc();
  const ref = useRef();

  useEffect(() => {
    onLinkCreate({ ...item, index, link: ref.current });
  }, [index, item, onLinkCreate]);

  return (
    <Typography ref={ref} component="li" className={classes.li}>
      <Link
        children={item.title}
        data-no-markdown-link={item.id}
        to={`#${item.id}`}
        onClick={event => {
          onLinkClick(event, { ...item, index, link: ref.current });
        }}
      />
    </Typography>
  );
};

/**
 * TYPOGRAPHY ANCHOR
 */
type ToCItemProps2 = DefaultComponentProps<TypographyTypeMap<{ label?: string; level?: number }, 'span'>>;

export const ToCAnchor = ({ children, label = null, level = 0, ...props }: ToCItemProps2) => {
  const classes = useStyles();

  const { onAnchorCreate, onAnchorClick } = useMyToc();

  const ref = useRef<HTMLSpanElement>();
  const [text, setText] = useState<string>(label);
  const [id, setID] = useState<string>(null);

  useEffect(() => {
    setID(ref?.current?.innerText.replace(/\s/g, '-'));
  }, []);

  useEffect(() => {
    if (!id) return;
    onAnchorCreate({ id, title: ref?.current?.innerText, level, anchor: ref.current });
  }, [id, level, onAnchorCreate]);

  return (
    <>
      {useMemo(
        () => (
          <Typography id={id} ref={ref} variant="h1" className={classes.typography} {...props}>
            {`${children}`}
            <Button
              classes={{ root: clsx(classes.anchor) }}
              component={Link}
              size="small"
              tabIndex={-1}
              to={`#${id}`}
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
        [children, classes.anchor, classes.icon, classes.typography, id, onAnchorClick, props]
      )}
    </>
  );
};

export const PageWithToC = React.memo(WrappedPageWithToC);
export default PageWithToC;

function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);
  const observer = useMemo(() => new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting)), []);
  useEffect(() => {
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [observer, ref]);
  return isIntersecting;
}
