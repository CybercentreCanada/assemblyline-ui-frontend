import { Button, useTheme } from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';
import React from 'react';
import { Link } from 'react-router-dom';

type LinkGridProps = {
  items: {
    route: string;
    icon?: React.ReactElement<any>;
    name?: string;
    text?: string;
  }[];
};

export default function LinkGrid({ items }: LinkGridProps) {
  const theme = useTheme();
  const color = theme.palette.action.active;
  const padding = theme.spacing(10);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      {items.map((e, i) => (
        <Button key={i} component={Link} to={e.route}>
          <div style={{ height: '300px', width: '300px', padding, textAlign: 'center', color }}>
            {e.icon ? (
              React.cloneElement(e.icon, { style: { fontSize: '8rem' } }, null)
            ) : (
              <LinkIcon style={{ fontSize: '8rem' }} />
            )}
            <span style={{ fontSize: 'medium' }}>{e.name || e.text}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}
