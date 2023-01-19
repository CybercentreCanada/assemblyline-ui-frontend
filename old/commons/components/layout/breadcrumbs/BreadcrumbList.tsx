import { Tooltip } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { BreadcrumbItem } from 'commons/components/hooks/useAppSitemap';
import BreadcrumbLastItem from 'commons/components/layout/breadcrumbs/BreadcrumbLastItem';
import BreadcrumbLinkItem from 'commons/components/layout/breadcrumbs/BreadcrumbLinkItem';
import { useStyles as useBreadcrumbStyles } from 'commons/components/layout/breadcrumbs/Breadcrumbs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type BreadcrumbListProps = {
  compact?: boolean;
  disableStyle?: boolean;
  disableEllipsis?: boolean;
  allLinks?: boolean;
  textOnly?: boolean;
  exceptLast?: boolean;
  isStatic?: boolean;
  itemsBefore?: number;
  itemsAfter?: number;
  items: BreadcrumbItem[];
};

const splitItems = (
  items: BreadcrumbItem[],
  itemsBeforeCount: number,
  itemsAfterCount: number,
  expanded: boolean,
  isStatic: boolean
): { before: BreadcrumbItem[]; after: BreadcrumbItem[]; hasEllipsis: boolean } => {
  const _items = items.concat().filter(i => !i.route.exclude);
  if (_items.length <= itemsBeforeCount + itemsAfterCount + 1 || isStatic) {
    return { before: null, after: _items, hasEllipsis: false };
  }
  const before = _items.slice(0, itemsBeforeCount);
  const after = expanded ? _items.slice(itemsBeforeCount) : _items.slice(_items.length - itemsAfterCount);
  return { before, after, hasEllipsis: before.length + after.length + 1 < _items.length || expanded };
};

const BreadcrumbList: React.FC<BreadcrumbListProps> = ({
  items,
  disableStyle,
  itemsBefore = 1,
  itemsAfter = 1,
  allLinks = false,
  textOnly = false,
  exceptLast = false,
  isStatic = false
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const classes = useBreadcrumbStyles();
  const { before, after, hasEllipsis } = splitItems(
    exceptLast ? items.slice(0, items.length - 1) : items,
    itemsBefore,
    itemsAfter,
    expanded,
    isStatic
  );
  const last = after.length > 0 && !allLinks ? after.pop() : before ? before.pop() : null;
  return (
    <MuiBreadcrumbs
      aria-label="breadcrumb"
      className={!disableStyle ? classes.breadcrumbs : ''}
      maxItems={1000}
      // classes={{ root: { color: 'inherit' } }}
    >
      {before &&
        before.map(item => <BreadcrumbLinkItem key={`bcrumb-${item.route.path}`} item={item} textOnly={textOnly} />)}
      {hasEllipsis && (
        <BreadcrumbsEllipsis expanded={expanded} onClick={() => setExpanded(!expanded)} css={classes.moreicon} />
      )}
      {after &&
        after.map(item => <BreadcrumbLinkItem key={`bcrumb-${item.route.path}`} item={item} textOnly={textOnly} />)}
      {last && <BreadcrumbLastItem item={last} textOnly={textOnly} />}
    </MuiBreadcrumbs>
  );
};

const BreadcrumbsEllipsis = ({ onClick, css, expanded }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t(expanded ? 'tooltip.breadcrumbs.min' : 'tooltip.breadcrumbs.max')}>
      <MoreHorizIcon fontSize="small" className={css} onClick={onClick} />
    </Tooltip>
  );
};

export default BreadcrumbList;
