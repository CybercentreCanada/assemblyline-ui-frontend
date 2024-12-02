import { List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  default: {
    marginLeft: '1px'
  },
  active: {
    borderRight: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main
  }
}));

type Props = {
  rootElement?: HTMLDivElement;
  customize: boolean;
  disabled: boolean;
  hidden: boolean;
  loading: boolean;
  profile: SettingsStore['state']['tab'];
};

export const Tab = ({
  rootElement = null,
  customize = false,
  disabled = false,
  hidden = false,
  loading = false,
  profile = 'interface'
}: Props) => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const classes = useStyles();
  const form = useForm();

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
      <ListItem
        className={clsx(profile === 'interface' ? classes.active : classes.default)}
        disablePadding
        sx={{ marginTop: theme.spacing(1) }}
      >
        <ListItemButton component={Link} to={`/settings2/interface`}>
          <ListItemText primary={t('interface')} />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding sx={{ padding: `${theme.spacing(1)} ${theme.spacing(2)}` }}>
        <ListItemText primary={t('profiles')} primaryTypographyProps={{ color: 'textSecondary' }} />
      </ListItem>

      <form.Subscribe
        selector={state => Object.keys(state.values.next.profiles)}
        children={names => (
          <>
            {names.map((name, i) => (
              <ListItem
                key={`${name}-${i}`}
                className={clsx(profile === name ? classes.active : classes.default)}
                disablePadding
              >
                <ListItemButton component={Link} to={`/settings2/${name}`}>
                  <ListItemText
                    primary={t(`profile.${name}`)}
                    primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      />
    </List>
  );
};
