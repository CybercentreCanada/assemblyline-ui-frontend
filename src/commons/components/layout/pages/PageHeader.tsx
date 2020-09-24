import { AppBar, Box, Button, ButtonProps, IconButton, IconButtonProps, Toolbar, useTheme } from '@material-ui/core';
import useAppSitemap from 'commons/components/hooks/useAppSitemap';
import BreadcrumbLastItem from 'commons/components/layout/breadcrumbs/BreadcrumbLastItem';
import Breadcrumbs from 'commons/components/layout/breadcrumbs/Breadcrumbs';
import React from 'react';

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
  backgroundColor = 'inherit',
  elevation = 0
}) => {
  const theme = useTheme();
  const { last } = useAppSitemap();
  let comp = null;
  switch (mode) {
    case 'breadcrumbs':
      comp = <Breadcrumbs disableStyle />;
      break;
    case 'provided':
      comp = <Box display="inline-block">{title}</Box>;
      break;
    default:
      comp = (
        <Box component="span">
          <BreadcrumbLastItem item={last()} />
        </Box>
      );
  }

  return (
    <AppBar
      position={isSticky ? 'sticky' : 'relative'}
      style={{ backgroundColor }}
      elevation={elevation}
      color="inherit"
    >
      <Toolbar disableGutters>
        <Box>{left}</Box>
        <Box flexGrow={1}>{comp}</Box>
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
  );
};

export default PageHeader;
