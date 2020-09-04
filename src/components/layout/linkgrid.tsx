import { Box, Button, Typography, useTheme } from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';
import { LeftNavItemProps } from 'commons/components/layout/leftnav/LeftNavDrawer';
import { UserMenuElement } from 'commons/components/layout/topnav/UserProfile';
import React from 'react';
import { Link } from 'react-router-dom';

type LinkGridProps = {
  items: LeftNavItemProps[] | UserMenuElement[];
};

export default function LinkGrid<LinkGridProps>({ items }) {
  const theme = useTheme();
  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-around">
      {items.map((e, i) => {
        return (
          <Button key={i} component={Link} to={e.route}>
            <Box height="300px" width="300px" p={10} textAlign="center" color={theme.palette.action.active}>
              {e.icon ? (
                React.cloneElement(e.icon, { style: { fontSize: '8rem' } }, null)
              ) : (
                <LinkIcon style={{ fontSize: '8rem' }} />
              )}
              <Typography>{e.name || e.text}</Typography>
            </Box>
          </Button>
        );
      })}
    </Box>
  );
}
