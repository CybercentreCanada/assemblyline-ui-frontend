import { Box, Button, Typography } from '@material-ui/core';
import useMyLayout from 'components/hooks/useMyLayout';
import React from 'react';
import { Link } from 'react-router-dom';

export default function Admin() {
  const layout = useMyLayout();

  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-around">
      {layout.topnav.adminMenu.map((e, i) => {
        return (
          <Button key={i} component={Link} to={e.route}>
            <Box height="300px" width="300px" p={10} textAlign="center">
              {React.cloneElement(e.icon, { style: { fontSize: '8rem' } }, null)}
              <Typography>{e.name}</Typography>
            </Box>
          </Button>
        );
      })}
    </Box>
  );
}
