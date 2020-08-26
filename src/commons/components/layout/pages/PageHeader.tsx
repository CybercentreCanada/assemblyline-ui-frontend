import { Box, Button, IconButton, Toolbar } from '@material-ui/core';
import useAppSitemap from 'commons/components/hooks/useAppSitemap';
import BreadcrumbLastItem from 'commons/components/layout/breadcrumbs/BreadcrumbLastItem';
import Breadcrumbs from 'commons/components/layout/breadcrumbs/Breadcrumbs';
import React from 'react';

export type PageHeaderAction = {
  title?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action: () => void;
};

type PageHeaderProps = {
  mode?: 'title' | 'breadcrumbs' | 'provided';
  actions?: PageHeaderAction[];
  title?: React.ReactNode;
};

const PageHeader: React.FC<PageHeaderProps> = ({ mode, title, actions }) => {
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
    <Toolbar disableGutters>
      <Box flexGrow={1}>{comp}</Box>
      <Box>
        {actions
          ? actions.map((a, i) => {
              if (a.title) {
                return (
                  <Button key={`ph-action-${i}`} startIcon={a.icon} color={a.color} onClick={a.action}>
                    {a.title}
                  </Button>
                );
              }
              return (
                <IconButton key={`ph-action-${i}`} color={a.color} onClick={a.action}>
                  {a.icon}
                </IconButton>
              );
            })
          : null}
      </Box>
    </Toolbar>
  );
};

export default PageHeader;
