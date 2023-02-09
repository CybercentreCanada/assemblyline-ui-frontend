import LinkIcon from '@mui/icons-material/Link';
import { Button, useTheme } from '@mui/material';
import { AppLeftNavItem } from 'commons/components/app/AppConfigs';
import { t } from 'i18next';
import React from 'react';
import { Link } from 'react-router-dom';

type LinkGridProps = {
  items: AppLeftNavItem[];
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
            <span style={{ fontSize: 'medium' }}>{e.text || t(e.i18nKey)}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}
