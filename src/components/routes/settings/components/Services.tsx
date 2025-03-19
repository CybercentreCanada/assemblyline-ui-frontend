import { useTheme } from '@mui/material';
import type { SettingsStore } from 'components/routes/settings/settings.form';
import { useForm } from 'components/routes/settings/settings.form';
import { PageSection } from 'components/visual/Layouts/PageSection';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import { NumberListInput } from 'components/visual/ListInputs/NumberListInput';
import { SelectListInput } from 'components/visual/ListInputs/SelectListInput';
import { TextListInput } from 'components/visual/ListInputs/TextListInput';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type ParameterProps = {
  customize: boolean;
  disabled: boolean;
  loading: boolean;
  param_id: number;
  selected?: boolean;
  spec_id: number;
};

const Parameter = React.memo(
  ({ customize = false, disabled = false, loading = false, param_id = null, spec_id = null }: ParameterProps) => {
    const form = useForm();

    const handleChange = useCallback(
      (value: SettingsStore['settings']['service_spec'][number]['params'][number]['value']) => {
        form.setFieldValue('settings.service_spec', service_spec => {
          service_spec[spec_id].params[param_id].value = value;
          return service_spec;
        });
      },
      [form, param_id, spec_id]
    );

    return (
      <form.Subscribe
        selector={state => {
          const param = state.values.settings.service_spec[spec_id].params[param_id];
          return [param.type, param.name, param.value, param.default, param.editable, param.list] as const;
        }}
        children={([type, name, value, defaultValue, editable, list]) => {
          switch (type) {
            case 'str':
              return (
                <TextListInput
                  id={`${spec_id}-${param_id}`}
                  primary={name.replaceAll('_', ' ')}
                  capitalize
                  disabled={disabled || !(customize || editable)}
                  loading={loading}
                  reset={defaultValue !== null && value !== defaultValue}
                  value={value as string}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleChange(defaultValue)}
                />
              );
            case 'int':
              return (
                <NumberListInput
                  id={`${spec_id}-${param_id}`}
                  primary={name.replaceAll('_', ' ')}
                  capitalize
                  disabled={disabled || !(customize || editable)}
                  loading={loading}
                  reset={defaultValue !== null && value !== defaultValue}
                  value={value as number}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleChange(defaultValue)}
                />
              );
            case 'bool':
              return (
                <BooleanListInput
                  id={`${spec_id}-${param_id}`}
                  primary={name.replaceAll('_', ' ')}
                  capitalize
                  disabled={disabled || !(customize || editable)}
                  loading={loading}
                  reset={defaultValue !== null && value !== defaultValue}
                  value={value as boolean}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleChange(defaultValue)}
                />
              );
            case 'list':
              return (
                <SelectListInput
                  id={`${spec_id}-${param_id}`}
                  primary={name.replaceAll('_', ' ')}
                  capitalize
                  disabled={disabled || !(customize || editable)}
                  loading={loading}
                  reset={defaultValue !== null && value !== defaultValue}
                  value={value as string}
                  options={list.map(item => ({ value: item, primary: item.replaceAll('_', ' ') }))}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleChange(defaultValue)}
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
  customize: boolean;
  disabled: boolean;
  loading: boolean;
  svr_id: number;
};

const Service = React.memo(
  ({ cat_id = null, customize = false, disabled = false, loading = false, svr_id = null }: ServiceProps) => {
    const theme = useTheme();
    const form = useForm();

    const handleChange = useCallback(
      (selected: boolean) => {
        form.setFieldValue('settings.services', categories => {
          if (selected) {
            categories[cat_id].services[svr_id].selected = true;
            categories[cat_id].selected = categories[cat_id].services.every(srv => srv.selected);
          } else {
            categories[cat_id].selected = false;
            categories[cat_id].services[svr_id].selected = false;
          }
          return categories;
        });
      },
      [cat_id, form, svr_id]
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.25), marginLeft: '42px' }}>
        <form.Subscribe
          selector={state => {
            const svr = state.values.settings.services[cat_id].services[svr_id];
            return [svr.name, svr.category, svr.description, svr.selected, svr.default, svr.editable] as const;
          }}
          children={([name, category, description, selected, defaultValue, editable]) => (
            <ListHeader
              id={`${category}-${name}`}
              primary={name}
              primaryProps={{ className: 'Anchor' }}
              secondary={description}
              checked={selected}
              anchor
              reset={defaultValue !== null && selected !== defaultValue}
              onChange={!customize && !editable ? null : (event, checked) => handleChange(!checked)}
              onReset={!customize && !editable ? null : () => handleChange(defaultValue)}
            />
          )}
        />

        <form.Subscribe
          key={`${cat_id}-${svr_id}`}
          selector={state =>
            [state.values.settings.services[cat_id].services[svr_id], state.values.settings.service_spec] as const
          }
          children={([svr, specs]) => {
            const specID = specs.findIndex(spec => spec.name === svr.name);

            return (
              specID >= 0 && (
                <List inset>
                  {specs[specID].params
                    .sort((p1, p2) => (customize ? 1 : (p2.editable ? 1 : 0) - (p1.editable ? 1 : 0)))
                    .map((param, param_id) => (
                      <Parameter
                        key={`${svr.name}-${param.name}`}
                        spec_id={specID}
                        param_id={param_id}
                        customize={customize}
                        disabled={disabled}
                        loading={loading}
                      />
                    ))}
                </List>
              )
            );
          }}
        />
      </div>
    );
  }
);

type CategoryProps = {
  cat_id: number;
  customize: boolean;
  disabled: boolean;
  loading: boolean;
};

const Category = React.memo(
  ({ cat_id = null, customize = false, disabled = false, loading = false }: CategoryProps) => {
    const theme = useTheme();
    const form = useForm();

    const handleChange = useCallback(
      (selected: boolean) => {
        form.setFieldValue('settings', s => {
          if (selected) {
            s.services[cat_id].selected = true;
            s.services[cat_id].services = s.services[cat_id].services.map(srv => ({
              ...srv,
              selected: true
            }));
          } else {
            s.services[cat_id].selected = false;
            s.services[cat_id].services = s.services[cat_id].services.map(srv => ({
              ...srv,
              selected: false
            }));
          }

          return s;
        });
      },
      [cat_id, form]
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.5) }}>
        <form.Subscribe
          selector={state => {
            const cat = state.values.settings.services[cat_id];
            const list = state.values.settings.services[cat_id].services.map(svr => svr.selected);
            return [
              cat.name,
              cat.selected,
              cat.default,
              cat.editable,
              !list.every(i => i) && list.some(i => i)
            ] as const;
          }}
          children={([name, selected, defaultValue, editable, indeterminate]) => (
            <ListHeader
              id={name}
              anchorProps={{ subheader: true }}
              primary={name}
              primaryProps={{ color: theme.palette.text.secondary }}
              checked={selected}
              indeterminate={indeterminate}
              divider
              anchor
              reset={defaultValue !== null && selected !== defaultValue}
              onChange={!customize && !editable ? null : (event, checked) => handleChange(!checked)}
              onReset={!customize && !editable ? null : () => handleChange(defaultValue)}
            />
          )}
        />

        <form.Subscribe
          selector={state => state.values.settings.services[cat_id].services}
          children={services =>
            services.map((service, svr_id) => (
              <Service
                key={`${service.name}-${svr_id}`}
                cat_id={cat_id}
                customize={customize}
                disabled={disabled}
                loading={loading}
                svr_id={svr_id}
              />
            ))
          }
        />
      </div>
    );
  }
);

export const ServicesSection = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state =>
        [state.values.state.customize, state.values.state.disabled, state.values.state.loading] as const
      }
      children={([customize, disabled, loading]) => (
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
          <PageSection
            id="services"
            primary={t('services')}
            secondary={t('services.description')}
            primaryProps={{ variant: 'h6' }}
            subheader
            anchor
          />

          <form.Subscribe
            selector={state => [state.values.settings.services] as const}
            children={([categories]) =>
              categories.map((category, cat_id) => (
                <Category
                  key={`${category.name}-${cat_id}`}
                  cat_id={cat_id}
                  customize={customize}
                  disabled={disabled}
                  loading={loading}
                />
              ))
            }
          />
        </div>
      )}
    />
  );
});
