import { IconButton, Menu, MenuItem, Tooltip } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AlertCardActions = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const onClick = (event: React.MouseEvent) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  return (
    <>
      <Tooltip title={t('page.alerts.tooltip.actions')}>
        <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={onClick}>
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        keepMounted
        open={!!anchorEl}
        onClose={onClick}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <MenuItem onClick={onClick}>Submission</MenuItem>
        <MenuItem onClick={onClick}>Search SHA256</MenuItem>
        <MenuItem onClick={onClick}>Count Similar</MenuItem>
        <MenuItem onClick={onClick}>Related IDs</MenuItem>
        <MenuItem onClick={onClick}>Has Ownership</MenuItem>
        <MenuItem onClick={onClick}>Workflow Action</MenuItem>
      </Menu>
    </>
  );
};

export default AlertCardActions;
