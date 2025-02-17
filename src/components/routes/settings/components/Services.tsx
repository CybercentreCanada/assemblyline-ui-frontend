import { useTheme } from '@mui/material';
import type {
  SelectedService,
  SelectedServiceCategory,
  ServiceParameter,
  ServiceSpecification
} from 'components/models/base/service';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { PageSection } from 'components/visual/Layouts/PageSection';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import { NumberListInput } from 'components/visual/ListInputs/NumberListInput';
import { SelectListInput } from 'components/visual/ListInputs/SelectListInput';
import { TextListInput } from 'components/visual/ListInputs/TextListInput';
import { ShowMore } from 'components/visual/ShowMore';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type ParameterProps = {
  customize: boolean;
  disabled: boolean;
  loading: boolean;
  param_id: number;
  param: ServiceParameter;
  profile: SettingsStore['state']['tab'];
  selected: boolean;
  spec_id: number;
  spec: ServiceSpecification;
};

const Parameter = React.memo(
  ({
    customize = false,
    disabled = false,
    loading = false,
    param = null,
    param_id = null,
    profile = 'interface',
    selected = false,
    spec = null,
    spec_id = null
  }: ParameterProps) => {
    const form = useForm();
    const paramDisabled: boolean = disabled || !selected || !(customize || param.editable);

    return (
      <form.Subscribe
        key={`${param.name}-${param_id}`}
        selector={state => state.values.next.submission_profiles[profile].service_spec[spec_id].params[param_id].value}
        children={state => {
          const primary = param.name.replaceAll('_', ' ');
          switch (param.type) {
            case 'str':
              return (
                <TextListInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  capitalize
                  disabled={paramDisabled}
                  loading={loading}
                  reset={param.default !== null && state !== param.default}
                  value={state as string}
                  onChange={(event, value) => {
                    form.setStore(s => {
                      s.next.submission_profiles[profile].service_spec[spec_id].params[param_id].value = value;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.next.submission_profiles[profile].service_spec[spec_id].params[param_id].value = param.default;
                      return s;
                    });
                  }}
                />
              );
            case 'int':
              return (
                <NumberListInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  capitalize
                  disabled={paramDisabled}
                  loading={loading}
                  reset={param.default !== null && state !== param.default}
                  value={state as number}
                  onChange={(event, value) => {
                    form.setStore(s => {
                      s.next.submission_profiles[profile].service_spec[spec_id].params[param_id].value = value;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.next.submission_profiles[profile].service_spec[spec_id].params[param_id].value = param.default;
                      return s;
                    });
                  }}
                />
              );
            case 'bool':
              return (
                <BooleanListInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  capitalize
                  disabled={paramDisabled}
                  loading={loading}
                  reset={param.default !== null && state !== param.default}
                  value={state as boolean}
                  onChange={(event, value) => {
                    form.setStore(s => {
                      s.next.submission_profiles[profile].service_spec[spec_id].params[param_id].value = value;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.next.submission_profiles[profile].service_spec[spec_id].params[param_id].value = param.default;
                      return s;
                    });
                  }}
                />
              );
            case 'list':
              return (
                <SelectListInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  capitalize
                  disabled={paramDisabled}
                  loading={loading}
                  reset={param.default !== null && state !== param.default}
                  value={state as string}
                  options={param.list.map(item => ({
                    value: item,
                    label: item.replaceAll('_', ' ')
                  }))}
                  onChange={(event, value) => {
                    form.setStore(s => {
                      s.next.submission_profiles[profile].service_spec[spec_id].params[param_id].value = value;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.next.submission_profiles[profile].service_spec[spec_id].params[param_id].value = param.default;
                      return s;
                    });
                  }}
                />
              );
          }
        }}
      />
    );
  }
);

type ServiceProps = {
  cat_id: number;
  svr_id: number;
  service: SelectedService;
  customize: boolean;
  disabled: boolean;
  profile: SettingsStore['state']['tab'];
  loading: boolean;
};

const Service = React.memo(
  ({
    cat_id = null,
    svr_id = null,
    service = null,
    customize = false,
    disabled = false,
    profile = 'interface',
    loading = false
  }: ServiceProps) => {
    const theme = useTheme();
    const form = useForm();

    const handleChange = useCallback(
      (selected: boolean) => {
        form.setStore(s => {
          if (selected) {
            s.next.submission_profiles[profile].services[cat_id].selected = false;
            s.next.submission_profiles[profile].services[cat_id].services[svr_id].selected = false;
          } else {
            s.next.submission_profiles[profile].services[cat_id].services[svr_id].selected = true;
            s.next.submission_profiles[profile].services[cat_id].selected = s.next.submission_profiles[
              profile
            ].services[cat_id].services.every(srv => srv.selected);
          }
          return s;
        });
      },
      [cat_id, form, profile, svr_id]
    );

    const calculateParams = useCallback(
      (service_spec: ServiceSpecification, selected: boolean) => {
        if (!service_spec?.params)
          return { show: [], hidden: [] } as {
            show: [ServiceParameter, number][];
            hidden: [ServiceParameter, number][];
          };
        return service_spec.params.reduce(
          (prev, current, i) =>
            (selected && current.editable) || customize
              ? { ...prev, show: [...prev.show, [current, i]] }
              : { ...prev, hidden: [...prev.hidden, [current, i]] },
          { show: [], hidden: [] } as { show: [ServiceParameter, number][]; hidden: [ServiceParameter, number][] }
        );
      },
      [customize]
    );

    return (
      <form.Subscribe
        key={`${cat_id}-${svr_id}`}
        selector={state => [
          state.values.next.submission_profiles[profile].services[cat_id].services[svr_id].selected,
          state.values.next.submission_profiles[profile].service_spec.findIndex(spec => spec.name === service.name)
        ]}
        children={([selected, spec_id]) => {
          const specID = spec_id as number;
          const spec = specID >= 0 ? form.state.values.next.submission_profiles[profile].service_spec[specID] : null;

          const params = calculateParams(spec, selected as boolean) as {
            show: [ServiceParameter, number][];
            hidden: [ServiceParameter, number][];
          };

          return (
            <div
              key={`${service.name}-${svr_id}`}
              style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.25) }}
            >
              <ListHeader
                id={`${service.category}-${service.name}`}
                primary={service.name}
                primaryProps={{ className: 'Anchor' }}
                secondary={service.description}
                checked={selected as boolean}
                anchor
                sx={{ ...(!selected && { opacity: 0.38 }) }}
                onChange={!customize ? null : (event, checked) => handleChange(checked)}
              />

              {params && (
                <List inset>
                  {params.show.map(([param, param_id]) => (
                    // For restricted users, they should only see what they can edit until they select the "Show more" button
                    <Parameter
                      key={`${param.name}-${param_id}`}
                      customize={customize}
                      disabled={disabled}
                      loading={loading}
                      param_id={param_id}
                      param={param}
                      profile={profile}
                      selected={selected as boolean}
                      spec_id={specID}
                      spec={spec}
                    />
                  ))}
                  {!customize && params.hidden.length > 0 && (
                    <ShowMore
                      variant="long"
                      sx={{ width: '100%' }}
                      children={params.hidden.map(([param, param_id]) => (
                        // For restricted users, they should only see what they can edit until they select the "Show more" button
                        <Parameter
                          key={`${param.name}-${param_id}`}
                          customize={customize}
                          disabled={disabled}
                          loading={loading}
                          param_id={param_id}
                          param={param}
                          profile={profile}
                          selected={selected as boolean}
                          spec_id={specID}
                          spec={spec}
                        />
                      ))}
                    />
                  )}
                </List>
              )}
            </div>
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
  profile: SettingsStore['state']['tab'];
  loading: boolean;
};

const Category = React.memo(
  ({
    cat_id = null,
    category = null,
    customize = false,
    disabled = false,
    profile = 'interface',
    loading = false
  }: CategoryProps) => {
    const theme = useTheme();
    const form = useForm();

    const handleChange = useCallback(
      (selected: boolean) => {
        form.setStore(s => {
          if (selected) {
            s.next.submission_profiles[profile].services[cat_id].selected = false;
            s.next.submission_profiles[profile].services[cat_id].services = s.next.submission_profiles[
              profile
            ].services[cat_id].services.map(srv => ({
              ...srv,
              selected: false
            }));
          } else {
            s.next.submission_profiles[profile].services[cat_id].selected = true;
            s.next.submission_profiles[profile].services[cat_id].services = s.next.submission_profiles[
              profile
            ].services[cat_id].services.map(srv => ({
              ...srv,
              selected: true
            }));
          }

          return s;
        });
      },
      [cat_id, form, profile]
    );

    return (
      <form.Subscribe
        selector={state => {
          const selected = state.values.next.submission_profiles[profile].services[cat_id].selected;
          const list = state.values.next.submission_profiles[profile].services[cat_id].services.map(
            svr => svr.selected
          );
          return [selected, !list.every(i => i) && list.some(i => i)];
        }}
        children={([selected, indeterminate]) => (
          <div
            key={`${category.name}-${cat_id}`}
            style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}
          >
            <ListHeader
              id={category.name}
              anchorProps={{ subheader: true }}
              primary={category.name}
              checked={selected}
              indeterminate={indeterminate}
              divider
              anchor
              sx={{ ...(!selected && !indeterminate && { opacity: 0.38 }) }}
              onChange={!customize ? null : (event, checked) => handleChange(checked)}
            />

            {category.services.map((service, svr_id) => (
              <Service
                key={`${cat_id}-${svr_id}`}
                cat_id={cat_id}
                customize={customize}
                disabled={disabled}
                loading={loading}
                profile={profile}
                service={service}
                svr_id={svr_id}
              />
            ))}
          </div>
        )}
      />
    );
  }
);

export const ServicesSection = () => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.customize,
        state.values.state.disabled,
        state.values.state.loading,
        state.values.state.tab
      ]}
      children={props => {
        const customize = props[0] as boolean;
        const disabled = props[1] as boolean;
        const loading = props[2] as boolean;
        const profile = props[3] as SettingsStore['state']['tab'];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <PageSection
              id="services"
              primary={t('services')}
              secondary={t('services.description')}
              primaryProps={{ variant: 'h6' }}
              subheader
              anchor
            />

            <form.Subscribe
              selector={state => state.values.next.submission_profiles[profile].services}
              children={categories =>
                categories.map((category, cat_id) => (
                  <Category
                    key={`${category.name}-${cat_id}`}
                    cat_id={cat_id}
                    category={category}
                    customize={customize}
                    disabled={disabled}
                    loading={loading}
                    profile={profile}
                  />
                ))
              }
            />
          </div>
        );
      }}
    />
  );
};
