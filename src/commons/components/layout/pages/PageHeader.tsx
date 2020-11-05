/* eslint-disable react-hooks/exhaustive-deps */
import { AppBar, Button, ButtonProps, IconButton, IconButtonProps, Toolbar, useTheme } from '@material-ui/core';
import useAppBarHeight from 'commons/components/hooks/useAppBarHeight';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import React from 'react';

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

  const barWillHide = currentLayout !== 'top' && autoHideAppbar;

  return (
    <AppBar
      id="header1"
      position={isSticky ? 'sticky' : 'relative'}
      style={{
        top: isSticky ? (barWillHide ? 0 : appBarHeight) : null,
        backgroundColor: backgroundColor || theme.palette.background.default,
        zIndex: !isSticky ? theme.zIndex.appBar - 100 : null
      }}
      elevation={elevation}
      color="inherit"
    >
      <Toolbar style={{ minHeight: 0, display: 'block' }} disableGutters>
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
  );
};

export default PageHeader;
