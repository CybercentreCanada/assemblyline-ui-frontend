import { alpha, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { getProfileNames } from 'components/routes/settings/utils/utils';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type Props = {
  rootElement?: HTMLDivElement;
  loading: boolean;
  profile: SettingsStore['state']['tab'];
};

export const Tab = ({ rootElement = null, loading = false, profile = 'interface' }: Props) => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { user: currentUser } = useALContext();

  const isElementInViewport = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, []);

  useEffect(() => {
    if (!rootElement) return;

    const handler = () => {
      const elements = rootElement.getElementsByClassName('Anchor');

      for (let i = 0; i < elements.length; i++) {
        if (isElementInViewport(elements.item(i))) {
          form.setStore(s => {
            s.state.activeID = elements.item(i).id;
            return s;
          });
          break;
        }
      }
    };

    handler();

    rootElement.addEventListener('scroll', handler, false);
    return () => {
      rootElement.removeEventListener('scroll', handler, false);
    };
  }, [form, isElementInViewport, rootElement]);

  return !profile || loading ? null : (
    <List dense sx={{ '& ul': { padding: 0 } }}>
      <ListItem disablePadding sx={{ marginTop: theme.spacing(1) }}>
        <ListItemButton
          component={Link}
          to={`/settings/interface`}
          sx={{
            paddingRight: 0,
            borderRadius: '0 18px 18px  0',
            ...(profile === 'interface'
              ? { color: theme.palette.primary.main, backgroundColor: alpha(theme.palette.primary.main, 0.1) }
              : { marginLeft: '1px' })
          }}
        >
          <ListItemText primary={t('interface')} />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding sx={{ padding: `${theme.spacing(1)} ${theme.spacing(2)}` }}>
        <ListItemText primary={t('profiles')} primaryTypographyProps={{ color: 'textSecondary' }} />
      </ListItem>

      <form.Subscribe
        selector={state => getProfileNames(state.values.next, currentUser)}
        children={names =>
          names.map((name, i) => (
            <ListItem key={`${name}-${i}`} disablePadding>
              <ListItemButton
                component={Link}
                to={`/settings/${name}`}
                sx={{
                  paddingRight: 0,
                  borderRadius: '0 18px 18px  0',
                  ...(profile === name
                    ? { color: theme.palette.primary.main, backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                    : { marginLeft: '1px' })
                }}
              >
                <ListItemText
                  primary={t(`profile.${name}`)}
                  primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
                />
              </ListItemButton>
            </ListItem>
          ))
        }
      />
    </List>
  );
};
