import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Checkbox, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import type { SelectedService } from 'components/models/base/service';
import { useForm } from 'components/routes/settings/contexts/form';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  default: {
    marginLeft: '1px'
  },
  active: {
    borderLeft: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main
  }
}));

type Props = {
  loading?: boolean;
  disabled?: boolean;
  rootElement?: HTMLDivElement;
};

export const Navigation = ({ loading = false, disabled = false, rootElement = null }: Props) => {
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

  const isElementInViewport = useCallback(element => {
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

    rootElement.addEventListener('scroll', handler, false);
    return () => {
      rootElement.removeEventListener('scroll', handler, false);
    };
  }, [form, isElementInViewport, rootElement]);

  return (
    <List dense sx={{ '& ul': { padding: 0 } }}>
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
            <ListItemButton
              onClick={() => {
                const element = document.getElementById(`submissions`);
                element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ListItemText
                primary={t('submissions')}
                primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
              />
            </ListItemButton>
          </ListItem>
        )}
      />

      <form.Subscribe
        selector={state => [state.values.state.activeID === 'interface']}
        children={([active]) => (
          <ListItem className={clsx(active ? classes.active : classes.default)} disablePadding>
            <ListItemButton
              onClick={() => {
                const element = document.getElementById(`interface`);
                element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ListItemText
                primary={t('interface')}
                primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
              />
            </ListItemButton>
          </ListItem>
        )}
      />

      <form.Subscribe
        selector={state => [state.values.state.activeID === 'default_external_sources']}
        children={([active]) =>
          fileSources.length > 0 ? (
            <ListItem className={clsx(active ? classes.active : classes.default)} disablePadding>
              <ListItemButton
                onClick={() => {
                  const element = document.getElementById(`submissions.default_external_sources`);
                  element.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <ListItemText
                  primary={t('submissions.default_external_sources')}
                  primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
                />
              </ListItemButton>
            </ListItem>
          ) : null
        }
      />

      <form.Field
        name="next.services"
        mode="array"
        children={({ state: categories }) =>
          categories.value.map((category, cat_id) => (
            <div key={cat_id} style={{ display: 'contents' }}>
              <form.Subscribe
                selector={state => {
                  const selected = state.values.next.services[cat_id].selected;
                  const list = state.values.next.services[cat_id].services.map(svr => svr.selected);
                  return [
                    selected,
                    !list.every(i => i) && list.some(i => i),
                    state.values.state.activeID === category.name
                  ];
                }}
                children={([selected, indeterminate, active]) => (
                  <ListItem
                    key={cat_id}
                    className={clsx(active ? classes.active : classes.default)}
                    disablePadding
                    sx={{ marginTop: theme.spacing(1) }}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        inputProps={{ 'aria-labelledby': category.name }}
                        checked={selected}
                        indeterminate={indeterminate}
                        disabled={disabled}
                        onChange={() =>
                          form.setStore(s => {
                            if (selected) {
                              s.next.services[cat_id].selected = false;
                              s.next.services[cat_id].services = s.next.services[cat_id].services.map(srv => ({
                                ...srv,
                                selected: false
                              }));
                            } else {
                              s.next.services[cat_id].selected = true;
                              s.next.services[cat_id].services = s.next.services[cat_id].services.map(srv => ({
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
                    <ListItemButton
                      onClick={() => {
                        const element = document.getElementById(`${category.name}`);
                        element.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <ListItemText
                        primary={category.name}
                        primaryTypographyProps={{ color: active ? 'primary' : 'textSecondary' }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              />

              <form.Field
                name={`next.services[${cat_id}].services`}
                mode="array"
                children={props => {
                  const services = props.state.value as unknown as SelectedService[];
                  return services.map((service, svr_id) => (
                    <form.Subscribe
                      key={`${cat_id}-${svr_id}`}
                      selector={state => [
                        state.values.next.services[cat_id].services[svr_id].selected,
                        state.values.state.activeID === `${category.name} - ${service.name}`,
                        state.values.next.service_spec.some(spec => spec.name === service.name)
                      ]}
                      children={([selected, active, hasSpecs]) => {
                        return (
                          <ListItem
                            className={clsx(active ? classes.active : classes.default)}
                            disablePadding
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                inputProps={{ 'aria-labelledby': service.name }}
                                checked={selected}
                                disabled={disabled}
                                onChange={() =>
                                  form.setStore(s => {
                                    if (selected) {
                                      s.next.services[cat_id].selected = false;
                                      s.next.services[cat_id].services[svr_id].selected = false;
                                    } else {
                                      s.next.services[cat_id].services[svr_id].selected = true;
                                      s.next.services[cat_id].selected = s.next.services[cat_id].services.every(
                                        srv => srv.selected
                                      );
                                    }
                                    return s;
                                  })
                                }
                              />
                            }
                          >
                            <ListItemButton
                              onClick={() => {
                                const element = document.getElementById(`${category.name} - ${service.name}`);
                                element.scrollIntoView({ behavior: 'smooth' });
                              }}
                            >
                              <ListItemText
                                id={`${svr_id}`}
                                primary={
                                  <div style={{ display: 'flex' }}>
                                    {service.name}
                                    {hasSpecs && <ArrowRightIcon style={{ height: '20px' }} />}
                                  </div>
                                }
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
    </List>
  );
};
