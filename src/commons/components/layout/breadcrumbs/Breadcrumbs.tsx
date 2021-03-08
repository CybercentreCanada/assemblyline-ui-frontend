import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import useAppSitemap from 'commons/components/hooks/useAppSitemap';
import BreadcrumbList from 'commons/components/layout/breadcrumbs/BreadcrumbList';
import React from 'react';

export const useStyles = makeStyles(theme => ({
  breadcrumbs: {
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 2
  },
  moreicon: {
    verticalAlign: 'bottom',
    marginTop: '5px',
    display: 'inline-flex',
    '&:hover': {
      cursor: 'pointer'
    }
  }
}));

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
    last,
    is404
  } = useAppSitemap();

  const current = last();
  const isStatic = !!current.route.breadcrumbs;

  let items = null;
  if (lastOnly || is404(current)) {
    items = [current];
  } else if (isStatic) {
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
      isStatic={isStatic}
      itemsBefore={isExpanded ? itemsBefore : 0}
      itemsAfter={isExpanded ? itemsAfter : 1}
    />
  );
};

export default Breadcrumbs;
