import { Box, Button, Typography } from '@material-ui/core';
import useMyLayout from 'components/hooks/useMyLayout';
import React from 'react';
import { Link } from 'react-router-dom';

export default function Help() {
  const layout = useMyLayout();
  let helpMenuChildren = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'help') {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      helpMenuChildren = item.element['items'];
    }
  }

  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-around">
      {helpMenuChildren.map((e, i) => {
        return (
          <Button key={i} component={Link} to={e.route}>
            <Box height="300px" width="300px" p={10} textAlign="center">
              {e.icon
                ? React.cloneElement(e.icon, { style: { fontSize: '8rem' } }, null)
                : React.cloneElement(e.alt_icon, { style: { fontSize: '8rem' } }, null)}
              <Typography>{e.text}</Typography>
            </Box>
          </Button>
        );
      })}
    </Box>
  );
}
