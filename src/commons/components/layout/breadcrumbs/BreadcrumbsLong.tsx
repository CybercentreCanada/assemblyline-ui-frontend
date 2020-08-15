import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import { BreadcrumbItem } from 'commons/components/hooks/useSitemap';
import BreadcrumbEllipsisItem from 'commons/components/layout/breadcrumbs/BreadcrumbEllipsisItem';
import BreadcrumbLastItem from 'commons/components/layout/breadcrumbs/BreadcrumbLastItem';
import BreadcrumbLinkItem from 'commons/components/layout/breadcrumbs/BreadcrumbLinkItem';
import { useStyles as useBreadcrumbStyles } from 'commons/components/layout/breadcrumbs/Breadcrumbs';
import React from 'react';

type BreadcrumbsLongProps = {
  compact?: boolean;
  disableStyle?: boolean;
  disableEllipsis?: boolean;
  allLinks?: boolean;
  textOnly?: boolean;
  items: BreadcrumbItem[];
};

const splitItems = (
  items: BreadcrumbItem[],
  disableEllipsis: boolean
): {
  first: BreadcrumbItem;
  ellipsis: BreadcrumbItem[];
  after: BreadcrumbItem[];
  last: BreadcrumbItem;
} => {
  const first = items[0];
  let ellipsis = null;
  let after = items.length > 2 ? items.slice(1, items.length - 1) : null;
  const last = items.length > 1 ? items[items.length - 1] : null;
  if (items.length > 5 && !disableEllipsis) {
    ellipsis = items.slice(1, items.length - 3);
    after = items.slice(items.length - 3, items.length - 1);
  }
  return {
    first,
    ellipsis,
    after,
    last
  };
};

const BreadcrumbsLong: React.FC<BreadcrumbsLongProps> = ({
  items,
  disableStyle,
  disableEllipsis,
  allLinks = false,
  textOnly = false,
  compact = false
}) => {
  const { currentLayout, drawerState, showQuickSearch } = useAppLayout();
  const classes = useBreadcrumbStyles(currentLayout, drawerState, showQuickSearch);
  const { first, ellipsis, after, last } = splitItems(items, disableEllipsis);
  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      className={!disableStyle ? classes.breadcrumbs : ''}
      style={compact ? { fontSize: '0.8rem' } : null}
    >
      {items.length === 1 && !allLinks ? (
        <BreadcrumbLastItem key={`bcrumb-${first.route.path}`} item={first} textOnly={textOnly} />
      ) : first ? (
        <BreadcrumbLinkItem key={`bcrumb-${first.route.path}`} item={first} textOnly={textOnly} />
      ) : null}
      {ellipsis ? <BreadcrumbEllipsisItem key="bcrumb-ellipsis" items={ellipsis} /> : null}
      {after
        ? after.map(item => (
            // eslint-disable-next-line react/jsx-indent
            <BreadcrumbLinkItem key={`bcrumb-${item.route.path}`} item={item} textOnly={textOnly} />
          ))
        : null}
      {last ? (
        allLinks ? (
          <BreadcrumbLinkItem key={`bcrumb-${last.route.path}`} item={last} textOnly={textOnly} />
        ) : (
          <BreadcrumbLastItem key={`bcrumb-${last.route.path}`} item={last} textOnly={textOnly} />
        )
      ) : null}
    </MuiBreadcrumbs>
  );
};

export default BreadcrumbsLong;
