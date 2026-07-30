import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { Button, useTheme } from '@mui/material';
import { useAppLeftNavMenu } from 'app/layout.left-nav';
import { AppLink } from 'core/router';
import { createAppRoute } from 'core/routes';
import React, { memo, useMemo } from 'react';
import { PageCenter } from 'ui/pages/PageCenter';

export const HelpPage = memo(() => {
  const theme = useTheme();
  const leftNav = useAppLeftNavMenu();

  const items = useMemo(() => {
    const section = leftNav.find(item => item.id === 'help');
    return (section?.items ?? []).filter(item => !item.preventRender);
  }, [leftNav]);

  return (
    <PageCenter margin={4} width="100%">
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {items.map((item, i) => (
          <Button
            key={i}
            component={AppLink as React.ElementType}
            nav={item.nav}
            navDeps={item.navDeps}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            <div
              style={{
                height: '300px',
                width: '300px',
                padding: theme.spacing(10),
                textAlign: 'center'
              }}
            >
              {item.icon ? (
                React.cloneElement(item.icon, { style: { color: theme.palette.text.primary, fontSize: '8rem' } }, null)
              ) : (
                <LinkIcon style={{ fontSize: '8rem' }} />
              )}
              <span style={{ fontSize: 'medium' }}>{item.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </PageCenter>
  );
});

export const HelpRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'drawer.help'
  },
  icon: {
    primary: <HelpOutlineOutlinedIcon />
  },
  component: HelpPage,
  path: '/help',
  ancestor: null
});
