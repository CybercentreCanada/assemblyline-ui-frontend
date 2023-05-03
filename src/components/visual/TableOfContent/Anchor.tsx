import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Button } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import React, { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnchorDef, useStore } from './Provider';

const useStyles = makeStyles(theme => ({
  anchor: {
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
  button: {
    transition: 'display 50ms, opacity 50ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    display: 'hidden',
    opacity: 0,
    minWidth: 0,
    padding: theme.spacing(0.25)
  },
  icon: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5)
  }
}));

type AnchorProps = {
  children?: React.ReactNode;
  className?: string;
  component?: React.ElementType;
  label?: string;
  level?: number;
};

export const WrappedAnchor = ({
  children,
  className,
  component: Element = 'div',
  label = null,
  level = 0,
  ...props
}: AnchorProps) => {
  const classes = useStyles();
  const { copy } = useClipboard();

  const [, setStore] = useStore(store => null);
  const [hash, setHash] = useState<string>(null);
  const ref = useRef<HTMLSpanElement>();

  const appBarHeight = useMemo(() => Math.floor(document.getElementById('appbar').getBoundingClientRect().height), []);

  const nextPath = useCallback((path: number[] = [0], depth: number = 0): number[] => {
    let next = [];
    for (let i = 0; i <= depth; ++i) {
      if (i < path.length && i < depth) next = [...next, path[i]];
      else if (i < path.length && i === depth) next = [...next, path[i] + 1];
      else next = [...next, 0];
    }
    return next;
  }, []);

  const getNextPath = useCallback(
    (_anchors: AnchorDef[] = [], _level: number = 0): number[] => {
      if (!_anchors) return [];
      if (_anchors.length === 0) return [0];
      const lastAnchor = _anchors[_anchors.length - 1];
      let depth = lastAnchor.path.length - 1;
      if (lastAnchor.level < _level) depth += 1;
      else if (lastAnchor.level > _level) depth -= 1;
      depth = Math.max(depth, 0);
      return nextPath(lastAnchor.path, depth);
    },
    [nextPath]
  );

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(() => {
    document.getElementById('app-scrollct').scrollTo({ top: ref.current.offsetTop - appBarHeight, behavior: 'smooth' });
    const { origin, pathname, search } = window.location;
    copy(`${origin}${pathname}${search}#${hash}`);
  }, [appBarHeight, copy, hash]);

  useEffect(() => {
    setStore(store => {
      const path: number[] = getNextPath(store.anchors, level);
      const newLabel: string = label || ref?.current?.innerText;
      const newHash: string = `${path.map(p => p + 1).join('.')}-${newLabel.replace(/\s/g, '-')}`;
      setHash(newHash);
      return { anchors: [...store.anchors, { hash: newHash, level, path, element: ref.current, label: newLabel }] };
    });
  }, [getNextPath, label, level, setStore]);

  return (
    <Element {...props} id={hash} ref={ref} className={clsx(className, classes.anchor)}>
      {children}
      <Button
        classes={{ root: clsx(classes.button) }}
        component={Link}
        size="small"
        tabIndex={-1}
        to={`${window.location.search}#${hash}`}
        variant="outlined"
        onClick={handleClick}
      >
        <LinkOutlinedIcon className={classes.icon} />
      </Button>
    </Element>
  );
};

export const Anchor = React.memo(WrappedAnchor);
export default Anchor;
