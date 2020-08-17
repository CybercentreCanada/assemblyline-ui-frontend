import { Box, makeStyles, Tooltip } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { BreadcrumbItem } from 'commons/components/hooks/useAppSitemap';
import BreadcrumbsLong from 'commons/components/layout/breadcrumbs/BreadcrumbsLong';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  moreicon: {
    // opacity: 1,
    verticalAlign: 'bottom',
    marginTop: '5px',
    display: 'inline-flex',
    '&:hover': {
      cursor: 'pointer'
    }
  }
});

type BreadcrumbEllipsisItemProps = {
  items: BreadcrumbItem[];
};

const BreadcrumbEllipsisItem: React.FC<BreadcrumbEllipsisItemProps> = ({ items }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const onToggleHidden = () => setOpen(!open);

  const ellipsis = (
    <Tooltip title={t(open ? 'tooltip.breadcrumbs.min' : 'tooltip.breadcrumbs.max')}>
      <MoreHorizIcon fontSize="small" className={classes.moreicon} onClick={onToggleHidden} />
    </Tooltip>
  );

  return (
    <Box style={{ display: 'inline-flex' }}>
      {ellipsis} {open ? <>&nbsp;&nbsp;</> : null}
      {open ? <BreadcrumbsLong items={items} disableEllipsis disableStyle allLinks /> : null}
    </Box>
  );
};

export default BreadcrumbEllipsisItem;
