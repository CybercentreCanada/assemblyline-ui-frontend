import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import useAppSitemap from 'commons/components/hooks/useAppSitemap';
import BreadcrumbsLong from 'commons/components/layout/breadcrumbs/BreadcrumbsLong';
import BreadcrumbsShort from 'commons/components/layout/breadcrumbs/BreadcrumbsShort';
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
  const {
    breadcrumbs,
    props: { lastOnly, exceptLast, allLinks }
  } = useAppSitemap();
  const items = exceptLast ? (breadcrumbs.length > 1 ? breadcrumbs.slice(0, breadcrumbs.length - 1) : []) : breadcrumbs;

  return breadcrumbsState && isMedium ? (
    <BreadcrumbsLong items={items} disableStyle={disableStyle} allLinks={allLinks} />
  ) : (
    <BreadcrumbsShort items={items} disableEllipsis={lastOnly} disableStyle={disableStyle} />
  );
};

export default Breadcrumbs;
