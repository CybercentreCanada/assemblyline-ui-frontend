import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AlertActionsMenu = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const onClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  return (
    <>
      <Tooltip title={t('tooltip.actions')}>
        <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={onClick} size="large">
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
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

export default AlertActionsMenu;
