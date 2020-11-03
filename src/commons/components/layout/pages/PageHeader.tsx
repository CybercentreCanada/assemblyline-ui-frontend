/* eslint-disable react-hooks/exhaustive-deps */
import {
  AppBar,
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  RootRef,
  Toolbar,
  useTheme
} from '@material-ui/core';
import useAppBarHeight from 'commons/components/hooks/useAppBarHeight';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import React, { useLayoutEffect, useRef, useState } from 'react';

export type PageHeaderAction = {
  key?: string;
  title?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProp?: ButtonProps | IconButtonProps;
};

type PageHeaderProps = {
  children?: React.ReactNode;
  right?: React.ReactNode;
  actions?: PageHeaderAction[];
  isSticky?: boolean;
  elevation?: number;
  backgroundColor?: string;
};

const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  right,
  actions,
  isSticky = false,
  backgroundColor = null,
  elevation = 0
}) => {
  const theme = useTheme();
  const { currentLayout, autoHideAppbar } = useAppLayout();
  const appBarHeight = useAppBarHeight();
  const [top, setTop] = useState<number>(-1);
  const [initialTop, setInitialTop] = useState<number>();
  const containerEL = useRef<HTMLDivElement>();
  //
  useLayoutEffect(() => {
    if (isSticky && initialTop !== undefined) {
      let _top = initialTop;
      if (currentLayout === 'top' || !autoHideAppbar) {
        _top += appBarHeight;
      }
      // console.log(`updatetop: ${_top}`);
      setTop(_top);
    }
  }, [initialTop, currentLayout, autoHideAppbar, appBarHeight]);

  useLayoutEffect(() => {
    if (isSticky && containerEL.current) {
      const _initialTop = containerEL.current.offsetTop;
      // console.log(`inittop: ${_initialTop}`);
      setInitialTop(_initialTop);
    }
  }, [containerEL]);

  return (
    <RootRef rootRef={containerEL}>
      <AppBar
        id="header1"
        position={isSticky ? 'sticky' : 'relative'}
        style={{
          top: top > -1 ? top : null,
          backgroundColor: backgroundColor || theme.palette.background.default,
          paddingTop: theme.spacing(0.5),
          zIndex: !isSticky ? theme.zIndex.appBar - 100 : null
        }}
        elevation={elevation}
        color="inherit"
      >
        <Toolbar style={{ minHeight: 0 }} disableGutters>
          <div style={{ flexGrow: 1 }}>{children}</div>
          <div>
            {actions &&
              actions.map((a, i) => {
                if (a.title) {
                  return (
                    <Button
                      key={a.key ? a.key : `ph-action-${i}`}
                      startIcon={a.icon}
                      color={a.color}
                      onClick={a.action}
                      {...(a.btnProp as ButtonProps)}
                      style={{ marginRight: theme.spacing(1) }}
                    >
                      {a.title}
                    </Button>
                  );
                }
                return (
                  <IconButton
                    key={a.key ? a.key : `ph-action-${i}`}
                    color={a.color}
                    onClick={a.action}
                    {...(a.btnProp as IconButtonProps)}
                    style={{ marginRight: theme.spacing(1) }}
                  >
                    {a.icon}
                  </IconButton>
                );
              })}
          </div>
          <div>{right}</div>
        </Toolbar>
      </AppBar>
    </RootRef>
  );
};

export default PageHeader;
