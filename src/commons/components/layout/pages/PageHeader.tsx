import {
  AppBar,
  Box,
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  RootRef,
  Toolbar,
  useTheme
} from '@material-ui/core';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import useAppSitemap from 'commons/components/hooks/useAppSitemap';
import useTopBarScrollTrigger from 'commons/components/hooks/useTopBarScrollTrigger';
import BreadcrumbLastItem from 'commons/components/layout/breadcrumbs/BreadcrumbLastItem';
import Breadcrumbs from 'commons/components/layout/breadcrumbs/Breadcrumbs';
import React, { useLayoutEffect, useRef, useState } from 'react';

export type PageHeaderAction = {
  title?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProp?: ButtonProps | IconButtonProps;
};

type PageHeaderProps = {
  mode?: 'title' | 'breadcrumbs' | 'provided';
  left?: React.ReactNode;
  right?: React.ReactNode;
  actions?: PageHeaderAction[];
  title?: React.ReactNode;
  isSticky?: boolean;
  elevation?: number;
  backgroundColor?: string;
};

const PageHeader: React.FC<PageHeaderProps> = ({
  mode,
  title,
  left,
  right,
  actions,
  isSticky = false,
  backgroundColor = null,
  elevation = 0
}) => {
  const theme = useTheme();
  const { last } = useAppSitemap();
  const { currentLayout, autoHideAppbar } = useAppLayout();
  const topBarScrollTrigger = useTopBarScrollTrigger();
  const [top, setTop] = useState<number>(-1);
  const [initialTop, setInitialTop] = useState<number>(-1);
  const containerEL = useRef<HTMLDivElement>();
  const isSideLayout = currentLayout === 'side';

  useLayoutEffect(() => {
    const appBar = document.getElementById('appbar');
    if (isSticky && appBar) {
      const appBarRect = appBar.getBoundingClientRect();
      if (topBarScrollTrigger && isSideLayout && autoHideAppbar) {
        setTop(initialTop - appBarRect.height);
      } else {
        setTop(initialTop);
      }
    }
  }, [isSticky, isSideLayout, initialTop, topBarScrollTrigger, autoHideAppbar]);

  useLayoutEffect(() => {
    if (isSticky && containerEL.current) {
      const rect = containerEL.current.getBoundingClientRect();
      setInitialTop(rect.top);
    }
  }, [isSticky, containerEL, currentLayout]);

  const renderTitle = () => {
    switch (mode) {
      case 'breadcrumbs':
        return <Breadcrumbs disableStyle />;
      case 'provided':
        return title;
      default:
        return (
          <Box component="span">
            <BreadcrumbLastItem item={last()} />
          </Box>
        );
    }
  };

  return (
    <RootRef rootRef={containerEL}>
      <AppBar
        position={isSticky ? 'sticky' : 'relative'}
        style={{
          top: top > -1 ? top : null,
          backgroundColor: backgroundColor || theme.palette.background.default,
          paddingTop: theme.spacing(0.5)
        }}
        elevation={elevation}
        color="inherit"
      >
        <Toolbar style={{ minHeight: mode === 'provided' && (title || left || right) ? 0 : '' }} disableGutters>
          <Box>{left}</Box>
          <Box flexGrow={1}>{renderTitle()}</Box>
          <Box>
            {actions
              ? actions.map((a, i) => {
                  if (a.title) {
                    return (
                      <Button
                        key={`ph-action-${i}`}
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
                      key={`ph-action-${i}`}
                      color={a.color}
                      onClick={a.action}
                      {...(a.btnProp as IconButtonProps)}
                      style={{ marginRight: theme.spacing(1) }}
                    >
                      {a.icon}
                    </IconButton>
                  );
                })
              : null}
          </Box>
          <Box>{right}</Box>
        </Toolbar>
      </AppBar>
    </RootRef>
  );
};

export default PageHeader;
