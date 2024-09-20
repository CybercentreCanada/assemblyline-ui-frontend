import { Link, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import type { BreadcrumbItem } from 'commons/components/app/hooks/useAppSitemap';
import useAppSitemap from 'commons/components/app/hooks/useAppSitemap';
import BreadcrumbIcon from 'commons/components/breadcrumbs/BreadcrumbIcon';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

type BreadcrumbLinkItemProps = {
  textOnly?: boolean;
  item: BreadcrumbItem;
};

const useStyles = makeStyles(() => ({
  link: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}));

const BreadcrumbLinkItem: React.FC<BreadcrumbLinkItemProps> = ({ item, textOnly }) => {
  const { route, matcher } = item;
  const classes = useStyles();
  const { getTitle: resolveTitle } = useAppSitemap();
  const url = matcher ? matcher.pathname : route.path;
  return (
    <Link component={RouterLink} key={`bcrumb-${url}`} color="inherit" to={url} className={classes.link}>
      {!textOnly && <BreadcrumbIcon item={item} />}
      <Tooltip title={url}>
        <span
          style={{
            maxWidth: route.textWidth || '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {resolveTitle(item)}
        </span>
      </Tooltip>
    </Link>
  );
};

export default BreadcrumbLinkItem;
