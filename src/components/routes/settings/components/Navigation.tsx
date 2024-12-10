import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Checkbox, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import type { SelectedService, SelectedServiceCategory } from 'components/models/base/service';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import type { MouseEvent } from 'react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  active: {
    borderLeft: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main
  }
}));

type ServiceProps = {
  cat_id: number;
  svr_id: number;
  service: SelectedService;
  customize: boolean;
  disabled: boolean;
  hidden: boolean;
  profile: SettingsStore['state']['tab'];
  onScroll: (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, id: string) => void;
};

const Service: React.FC<ServiceProps> = React.memo(
  ({
    cat_id = null,
    svr_id = null,
    service = null,
    customize = false,
    disabled = false,
    hidden = false,
    profile = 'interface',
    onScroll = () => null
  }: ServiceProps) => {
    const theme = useTheme();
    const classes = useStyles();
    const form = useForm();

    return (
      <form.Subscribe
        selector={state => [
          state.values.next.profiles[profile].services[cat_id].services[svr_id].selected,
          state.values.state.activeID === `${service.category} - ${service.name}`,
          state.values.next.profiles[profile].service_spec.some(spec => spec.name === service.name)
        ]}
        children={([selected, active, hasSpecs]) => {
          const hideService = hidden && !selected;

          return hideService ? null : (
            <ListItem
              className={clsx(active && classes.active)}
              disablePadding
              disabled={!selected}
              secondaryAction={
                <Checkbox
                  edge="end"
                  inputProps={{ id: `navigation: ${service.category}-${service.name}` }}
                  checked={selected}
                  disabled={disabled || !customize}
                  onChange={() =>
                    form.setStore(s => {
                      if (selected) {
                        s.next.profiles[profile].services[cat_id].selected = false;
                        s.next.profiles[profile].services[cat_id].services[svr_id].selected = false;
                      } else {
                        s.next.profiles[profile].services[cat_id].services[svr_id].selected = true;
                        s.next.profiles[profile].services[cat_id].selected = s.next.profiles[profile].services[
                          cat_id
                        ].services.every(srv => srv.selected);
                      }
                      return s;
                    })
                  }
                />
              }
            >
              <ListItemButton onClick={e => onScroll(e, `${service.category} - ${service.name}`)}>
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
                    htmlFor: `navigation: ${service.category}-${service.name}`,
                    sx: { '&:hover': { cursor: 'pointer' } }
                  }}
                  style={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
                />
              </ListItemButton>
            </ListItem>
          );
        }}
      />
    );
  }
);

type CategoryProps = {
  cat_id: number;
  category: SelectedServiceCategory;
  customize: boolean;
  disabled: boolean;
  hidden: boolean;
  profile: SettingsStore['state']['tab'];
  onScroll: (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, id: string) => void;
};

const Category: React.FC<CategoryProps> = React.memo(
  ({
    cat_id = null,
    category = null,
    customize = false,
    disabled = false,
    hidden = false,
    profile = 'interface',
    onScroll = () => null
  }: CategoryProps) => {
    const theme = useTheme();
    const classes = useStyles();
    const form = useForm();

    return (
      <>
        <form.Subscribe
          selector={state => {
            const selected = state.values.next.profiles[profile].services[cat_id].selected;
            const list = state.values.next.profiles[profile].services[cat_id].services.map(svr => svr.selected);
            return [selected, !list.every(i => i) && list.some(i => i), state.values.state.activeID === category.name];
          }}
          children={([selected, indeterminate, active]) => {
            const value = selected;
            const hideCategory = hidden && !value;

            return hideCategory ? null : (
              <ListItem
                key={cat_id}
                className={clsx(active && classes.active)}
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
                    onChange={() => {
                      form.setStore(s => {
                        if (selected) {
                          s.next.profiles[profile].services[cat_id].selected = false;
                          s.next.profiles[profile].services[cat_id].services.forEach((svr, i) => {
                            s.next.profiles[profile].services[cat_id].services[i].selected = false;
                          });
                        } else {
                          s.next.profiles[profile].services[cat_id].selected = true;
                          s.next.profiles[profile].services[cat_id].services.forEach((svr, i) => {
                            s.next.profiles[profile].services[cat_id].services[i].selected = true;
                          });
                        }

                        return s;
                      });
                    }}
                  />
                }
              >
                <ListItemButton onClick={e => onScroll(e, category.name)}>
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

        <form.Subscribe
          selector={state => state.values.next.profiles[profile].services[cat_id].services}
          children={services =>
            services.map((service, svr_id) => (
              <Service
                key={`${cat_id}-${svr_id}`}
                service={service}
                cat_id={cat_id}
                svr_id={svr_id}
                customize={customize}
                disabled={disabled}
                hidden={hidden}
                profile={profile}
                onScroll={onScroll}
              />
            ))
          }
        />
      </>
    );
  }
);

type Props = {
  customize: boolean;
  disabled: boolean;
  hidden: boolean;
  loading: boolean;
  profile: SettingsStore['state']['tab'];
  onScroll: (event: React.SyntheticEvent, id: string) => void;
};

export const Navigation = ({
  customize = false,
  disabled = false,
  hidden = false,
  loading = false,
  profile = 'interface',
  onScroll = () => null
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

  return !profile || loading ? null : (
    <List dense sx={{ '& ul': { padding: 0 } }}>
      {profile === 'interface' ? null : (
        <>
          <ListItem disablePadding sx={{ marginTop: theme.spacing(1) }}>
            <ListItemButton onClick={e => onScroll(e, 'header')}>
              <ListItemText
                primary={t('content')}
                primaryTypographyProps={{ color: 'textSecondary', textTransform: 'uppercase' }}
              />
            </ListItemButton>
          </ListItem>
          <form.Subscribe
            selector={state => [state.values.state.activeID === 'submissions']}
            children={([active]) => (
              <ListItem className={clsx(active && classes.active)} disablePadding>
                <ListItemButton onClick={e => onScroll(e, 'submissions')}>
                  <ListItemText primary={t('submissions')} />
                </ListItemButton>
              </ListItem>
            )}
          />
          <form.Subscribe
            selector={state => [state.values.state.activeID === 'default_external_sources']}
            children={([active]) =>
              fileSources.length > 0 ? (
                <ListItem className={clsx(active && classes.active)} disablePadding>
                  <ListItemButton onClick={e => onScroll(e, `submissions.default_external_sources`)}>
                    <ListItemText
                      primary={t('submissions.default_external_sources')}
                      primaryTypographyProps={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
                    />
                  </ListItemButton>
                </ListItem>
              ) : null
            }
          />

          <form.Subscribe
            selector={state => state.values.next.profiles[profile].services}
            children={categories =>
              categories.map((category, cat_id) => (
                <Category
                  key={`${category.name}-${cat_id}`}
                  category={category}
                  cat_id={cat_id}
                  customize={customize}
                  disabled={disabled}
                  hidden={hidden}
                  profile={profile}
                  onScroll={onScroll}
                />
              ))
            }
          />
        </>
      )}
    </List>
  );
};
