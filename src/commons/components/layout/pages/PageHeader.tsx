/* eslint-disable react-hooks/exhaustive-deps */
import {
  AppBar,
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Toolbar,
  Tooltip,
  useTheme
} from '@material-ui/core';
import useAppBarHeight from 'commons/components/hooks/useAppBarHeight';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import React from 'react';

export type PageHeaderAction = {
  key?: string;
  title?: string;
  tooltip?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProp?: ButtonProps | IconButtonProps;
};

type PageHeaderProps = {
  children?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  actions?: PageHeaderAction[];
  isSticky?: boolean;
  elevation?: number;
  backgroundColor?: string;
};

const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  left,
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
      {children}
      {(left || right || actions) && (
        <Toolbar style={{ minHeight: 0 }} disableGutters>
          <div style={{ flexGrow: 1 }}>{left}</div>
          <div>
            {actions &&
              actions.map((a, i) => {
                let act = null;
                if (a.title) {
                  act = (
                    <Button
                      key={a.tooltip ? null : a.key ? a.key : `ph-action-${i}`}
                      startIcon={a.icon}
                      color={a.color}
                      onClick={a.action}
                      {...(a.btnProp as ButtonProps)}
                      style={{ marginRight: theme.spacing(1) }}
                    >
                      {a.title}
                    </Button>
                  );
                } else {
                  act = (
                    <IconButton
                      key={a.tooltip ? null : a.key ? a.key : `ph-action-${i}`}
                      color={a.color}
                      onClick={a.action}
                      {...(a.btnProp as IconButtonProps)}
                      style={{ marginRight: theme.spacing(1) }}
                    >
                      {a.icon}
                    </IconButton>
                  );
                }
                return a.tooltip ? (
                  <Tooltip key={a.key ? a.key : `ph-action-${i}`} title={a.tooltip}>
                    {act}
                  </Tooltip>
                ) : (
                  act
                );
              })}
          </div>
          <div>{right}</div>
        </Toolbar>
      )}
    </AppBar>
  );
};

export default PageHeader;
