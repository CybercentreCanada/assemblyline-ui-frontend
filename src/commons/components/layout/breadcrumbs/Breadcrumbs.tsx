import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import useAppSitemap from 'commons/components/hooks/useAppSitemap';
import BreadcrumbLastItem from 'commons/components/layout/breadcrumbs/BreadcrumbLastItem';
import BreadcrumbList from 'commons/components/layout/breadcrumbs/BreadcrumbList';
import React from 'react';

export const useStyles = (layout, open, hasQuickSearch) => {
  return makeStyles(theme => ({
    breadcrumbs: {
      flexGrow: 1,
      [theme.breakpoints.down(hasQuickSearch ? 'sm' : 'xs')]: {
        display: 'none'
      },
      marginLeft: layout === 'side' ? (open ? theme.spacing(7) + 240 - 56 : theme.spacing(7)) : theme.spacing(3),
      overflow: 'auto'
    },
    moreicon: {
      verticalAlign: 'bottom',
      marginTop: '5px',
      display: 'inline-flex',
      '&:hover': {
        cursor: 'pointer'
      }
    }
  }))();
};

type BreadcrumbsProps = {
  disableStyle?: boolean;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ disableStyle }) => {
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.up('md'));
  const { breadcrumbsState } = useAppLayout();
  const isExpanded = breadcrumbsState && isMedium;
  const {
    breadcrumbs,
    props: { lastOnly, exceptLast, allLinks, itemsBefore = 1, itemsAfter = 1 },
    getSiteRoute,
    last
  } = useAppSitemap();

  const current = last();
  const isStatic = !!current.route.breadcrumbs;

  if (lastOnly) {
    return <BreadcrumbLastItem item={current} />;
  }

  let items = null;
  if (isStatic) {
    const staticBreadcrumbs = current.route.breadcrumbs.map(path => getSiteRoute(path));
    items = [...staticBreadcrumbs, current];
  } else {
    items = exceptLast ? (breadcrumbs.length > 1 ? breadcrumbs.slice(0, breadcrumbs.length - 1) : []) : breadcrumbs;
  }

  return (
    <BreadcrumbList
      items={items}
      disableStyle={disableStyle}
      allLinks={allLinks}
      itemsBefore={isExpanded ? itemsBefore : 0}
      itemsAfter={isExpanded ? itemsAfter : 1}
    />
  );
};

export default Breadcrumbs;
