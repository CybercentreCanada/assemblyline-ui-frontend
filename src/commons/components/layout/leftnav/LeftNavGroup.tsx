import { Collapse, List, ListItem, ListItemIcon, ListItemText, Popover, Tooltip } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import { LeftNavGroupProps } from 'commons/components/layout/leftnav/LeftNavDrawer';
import LeftNavItem from 'commons/components/layout/leftnav/LeftNavItem';
import React, { useState } from 'react';

const LeftNavGroup: React.FC<LeftNavGroupProps> = ({ open = true, id, title, icon, items }) => {
  const { drawerState } = useAppLayout();
  const [popoverTarget, setPopoverTarget] = useState<(EventTarget & Element) | undefined>();

  const onPopoverClick = (event: React.MouseEvent) => {
    setPopoverTarget(event ? event.currentTarget : undefined);
  };

  const [collapseOpen, setCollapseOpen] = React.useState(false);
  const handleClick = (event: React.MouseEvent) => {
    if (open) {
      setCollapseOpen(!collapseOpen);
    } else {
      onPopoverClick(event);
    }
  };

  const groupItem = (
    <ListItem button key={id} onClick={handleClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={title} />
      {collapseOpen ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
    </ListItem>
  );

  return (
    <div>
      {drawerState ? (
        groupItem
      ) : (
        <Tooltip title={title} aria-label={title} placement="right">
          {groupItem}
        </Tooltip>
      )}
      <Collapse in={collapseOpen && open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items.map(i => (
            <LeftNavItem key={i.id} {...i} />
          ))}
        </List>
      </Collapse>
      <Popover
        open={!!popoverTarget}
        onClose={() => setPopoverTarget(undefined)}
        onClick={() => setPopoverTarget(undefined)}
        anchorEl={popoverTarget}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <List disablePadding>
          {items.map(i => (
            <LeftNavItem key={i.id} {...i} />
          ))}
        </List>
      </Popover>
    </div>
  );
};

export default LeftNavGroup;
