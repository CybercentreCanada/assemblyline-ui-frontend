import { Box, Button, IconButton } from '@material-ui/core';
import useSitemap from 'commons/components/hooks/useSitemap';
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
  const { last } = useSitemap();

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
    <Box pb={1} display="flex" flexShrink={0} width="100%">
      <Box display="inline-block" flexGrow={1}>
        {comp}
      </Box>
      <Box display="inline-block">
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
    </Box>
  );
};

export default PageHeader;
