import { Tooltip, Typography } from '@material-ui/core';
import useSitemap, { BreadcrumbItem } from 'commons/components/hooks/useSitemap';
import BreadcrumbIcon from 'commons/components/layout/breadcrumbs/BreadcrumbIcon';
import { useStyles as useLinkStyle, useStyles } from 'commons/components/layout/breadcrumbs/BreadcrumbLinkItem';
import React from 'react';

type BreadcrumbLastItemProps = {
  textOnly?: boolean;
  item: BreadcrumbItem;
};

const BreadcrumbLastItem: React.FC<BreadcrumbLastItemProps> = ({ item, textOnly = false }) => {
  const classes = useStyles();
  const {
    route,
    matcher: { url }
  } = item;
  const linkClasses = useLinkStyle();
  const { resolveTitle } = useSitemap();

  return (
    <Typography
      style={route.icon ? { paddingTop: '3px' } : null}
      key={`bcrumb-${url}`}
      color="textPrimary"
      className={linkClasses.link}
    >
      {!textOnly ? <BreadcrumbIcon item={item} /> : null}
      <Tooltip title={url}>
        <span className={classes.text}>{resolveTitle(item)}</span>
      </Tooltip>
    </Typography>
  );
};

export default BreadcrumbLastItem;
