import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Checkbox, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import type { SelectedService } from 'components/models/base/service';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  default: {},
  active: {
    borderLeft: `1px solid ${theme.palette.primary.main}`,
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

export const Navigation = ({
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
  const { configuration } = useALContext();

  const fileSources = useMemo<string[]>(
    () =>
      Object.values(configuration?.submission?.file_sources || {})
        .flatMap(file => file?.sources)
        .filter((value, index, array) => value && array.indexOf(value) === index)
        .sort(),
    [configuration]
  );

  const isElementInViewport = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, []);

  const handleScroll = useCallback((event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, id: string) => {
    event.stopPropagation();
    event.preventDefault();
    const element = document.getElementById(id);
    element.style.scrollMarginTop = '62px';
    element.scrollIntoView({ behavior: 'smooth' });
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
      {profile === 'interface' ? null : (
        <>
          <ListItem disablePadding sx={{ marginTop: theme.spacing(1) }}>
            <ListItemButton
              onClick={() => {
                rootElement.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ListItemText
                primary={t('content')}
                primaryTypographyProps={{ color: 'textSecondary', textTransform: 'uppercase' }}
              />
            </ListItemButton>
          </ListItem>
          <form.Subscribe
            selector={state => [state.values.state.activeID === 'submissions']}
            children={([active]) => (
              <ListItem className={clsx(active ? classes.active : classes.default)} disablePadding>
                <ListItemButton onClick={e => handleScroll(e, 'submissions')}>
                  <ListItemText primary={t('submissions')} />
                </ListItemButton>
              </ListItem>
            )}
          />
          <form.Subscribe
            selector={state => [state.values.state.activeID === 'default_external_sources']}
            children={([active]) =>
              fileSources.length > 0 ? (
                <ListItem className={clsx(active ? classes.active : classes.default)} disablePadding>
                  <ListItemButton onClick={e => handleScroll(e, `submissions.default_external_sources`)}>
                    <ListItemText
                      primary={t('submissions.default_external_sources')}
                      primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
                    />
                  </ListItemButton>
                </ListItem>
              ) : null
            }
          />
          {loading ? null : (
            <form.Field
              name={`next.profiles[${profile}].services` as 'next.profiles.default.services'}
              mode="array"
              children={({ state: categories }) =>
                categories.value.map((category, cat_id) => (
                  <div key={cat_id} style={{ display: 'contents' }}>
                    <form.Subscribe
                      selector={state => {
                        const selected = state.values.next.profiles[profile].services[cat_id].selected;
                        const list = state.values.next.profiles[profile].services[cat_id].services.map(
                          svr => svr.selected
                        );
                        return [
                          selected,
                          !list.every(i => i) && list.some(i => i),
                          state.values.state.activeID === category.name
                        ];
                      }}
                      children={([selected, indeterminate, active]) => {
                        const value = selected;
                        const hideCategory = hidden && !value;

                        return hideCategory ? null : (
                          <ListItem
                            key={cat_id}
                            className={clsx(active ? classes.active : classes.default)}
                            disablePadding
                            disabled={!value && !indeterminate}
                            sx={{ marginTop: theme.spacing(1) }}
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                inputProps={{ id: `navigation: ${category.name}` }}
                                checked={value}
                                indeterminate={indeterminate}
                                disabled={disabled || !customize}
                                onChange={() =>
                                  form.setStore(s => {
                                    if (selected) {
                                      s.next.profiles[profile].services[cat_id].selected = false;
                                      s.next.profiles[profile].services[cat_id].services = s.next.profiles[
                                        profile
                                      ].services[cat_id].services.map(srv => ({
                                        ...srv,
                                        selected: false
                                      }));
                                    } else {
                                      s.next.profiles[profile].services[cat_id].selected = true;
                                      s.next.profiles[profile].services[cat_id].services = s.next.profiles[
                                        profile
                                      ].services[cat_id].services.map(srv => ({
                                        ...srv,
                                        selected: true
                                      }));
                                    }

                                    return s;
                                  })
                                }
                              />
                            }
                          >
                            <ListItemButton onClick={e => handleScroll(e, category.name)}>
                              <ListItemText
                                primary={category.name}
                                primaryTypographyProps={{
                                  color: active ? 'primary' : 'textSecondary',
                                  component: 'label',
                                  htmlFor: `navigation: ${category.name}`,
                                  sx: { '&:hover': { cursor: 'pointer' } }
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      }}
                    />

                    <form.Field
                      name={
                        `next.profiles[${profile}].services[${cat_id}].services` as 'next.profiles.default.services[0].services'
                      }
                      mode="array"
                      children={props2 => {
                        const services = props2.state.value as unknown as SelectedService[];

                        return services.map((service, svr_id) => (
                          <form.Subscribe
                            key={`${cat_id}-${svr_id}`}
                            selector={state => [
                              state.values.next.profiles[profile].services[cat_id].services[svr_id].selected,
                              state.values.state.activeID === `${category.name} - ${service.name}`,
                              state.values.next.profiles[profile].service_spec.some(spec => spec.name === service.name)
                            ]}
                            children={([selected, active, hasSpecs]) => {
                              const hideService = hidden && !selected;

                              return hideService ? null : (
                                <ListItem
                                  className={clsx(active ? classes.active : classes.default)}
                                  disablePadding
                                  disabled={!selected}
                                  secondaryAction={
                                    <Checkbox
                                      edge="end"
                                      inputProps={{ id: `navigation: ${category.name}-${service.name}` }}
                                      checked={selected}
                                      disabled={disabled || !customize}
                                      onChange={() =>
                                        form.setStore(s => {
                                          if (selected) {
                                            s.next.profiles[profile].services[cat_id].selected = false;
                                            s.next.profiles[profile].services[cat_id].services[svr_id].selected = false;
                                          } else {
                                            s.next.profiles[profile].services[cat_id].services[svr_id].selected = true;
                                            s.next.profiles[profile].services[cat_id].selected = s.next.profiles[
                                              profile
                                            ].services[cat_id].services.every(srv => srv.selected);
                                          }
                                          return s;
                                        })
                                      }
                                    />
                                  }
                                >
                                  <ListItemButton onClick={e => handleScroll(e, `${category.name} - ${service.name}`)}>
                                    <ListItemText
                                      id={`${svr_id}`}
                                      primary={
                                        <div style={{ display: 'flex' }}>
                                          {service.name}
                                          {hasSpecs && <ArrowRightIcon style={{ height: '20px' }} />}
                                        </div>
                                      }
                                      primaryTypographyProps={{
                                        component: 'label',
                                        htmlFor: `navigation: ${category.name}-${service.name}`,
                                        sx: { '&:hover': { cursor: 'pointer' } }
                                      }}
                                      style={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              );
                            }}
                          />
                        ));
                      }}
                    />
                  </div>
                ))
              }
            />
          )}
        </>
      )}
    </List>
  );
};
