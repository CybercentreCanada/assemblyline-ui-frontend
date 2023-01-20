import { Link } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppSitemap, { BreadcrumbItem } from 'commons_deprecated/components/hooks/useAppSitemap';
import BreadcrumbIcon from 'commons_deprecated/components/layout/breadcrumbs/BreadcrumbIcon';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const useStyles = makeStyles({
  link: {
    display: 'flex'
    // alignItems: 'center'
  },
  text: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
});

type BreadcrumbLinkItemProps = {
  textOnly?: boolean;
  item: BreadcrumbItem;
};

const LinkRouter = props => <Link {...props} component={RouterLink} />;

const BreadcrumbLinkItem: React.FC<BreadcrumbLinkItemProps> = ({ item, textOnly = false }) => {
  const classes = useStyles();
  const { route, matcher } = item;
  const { resolveTitle } = useAppSitemap();
  const url = matcher ? matcher.url : route.path;
  return (
    <LinkRouter
      style={route.icon ? { paddingTop: '3px' } : null}
      key={`bcrumb-${url}`}
      color="inherit"
      to={url}
      className={classes.link}
    >
      {!textOnly && <BreadcrumbIcon item={item} />}
      {/* <Tooltip title={url}> */}
      <span className={classes.text}>{resolveTitle(item)}</span>
      {/* </Tooltip> */}
    </LinkRouter>
  );
};

export default BreadcrumbLinkItem;
