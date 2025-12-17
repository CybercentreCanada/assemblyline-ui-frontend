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
  spec_id: number;
};

const Parameter = React.memo(({ customize, disabled, loading, param_id, spec_id }: ParameterProps) => {
  const form = useForm();

  const handleChange = useCallback(
    (value: SettingsStore['settings']['service_spec'][number]['params'][number]['value']) => {
      form.setFieldValue('settings.service_spec', service_spec => {
        const spec = service_spec?.[spec_id];
        if (!spec) return service_spec;
        spec.params[param_id].value = value;
        return service_spec;
      });
    },
    [form, param_id, spec_id]
  );

  return (
    <form.Subscribe
      selector={state => {
        const param = state.values.settings.service_spec[spec_id].params[param_id];
        return [param.type, param.name, param.value, param.default, param.restricted, param.list] as const;
      }}
      children={([type, name, value, defaultValue, restricted, list]) => {
        switch (type) {
          case 'str':
            return (
              <TextListInput
                id={`${spec_id}-${param_id}`}
                primary={name.replaceAll('_', ' ')}
                capitalize
                disabled={disabled || (!customize && restricted)}
                loading={loading}
                reset={defaultValue !== null && value !== defaultValue}
                value={value as string}
                defaultValue={defaultValue as string}
                onChange={(event, v) => handleChange(v)}
              />
            );

          case 'int':
            return (
              <NumberListInput
                id={`${spec_id}-${param_id}`}
                primary={name.replaceAll('_', ' ')}
                capitalize
                disabled={disabled || (!customize && restricted)}
                loading={loading}
                reset={defaultValue !== null && value !== defaultValue}
                value={value as number}
                defaultValue={defaultValue as number}
                onChange={(event, v) => handleChange(v)}
                onBlur={() => {
                  if (value === null) {
                    form.setFieldValue('settings.service_spec', service_spec => {
                      const spec = service_spec?.[spec_id];
                      if (!spec) return service_spec;
                      spec.params[param_id].value = defaultValue;
                      return service_spec;
                    });
                  }
                }}
              />
            );

          case 'bool':
            return (
              <BooleanListInput
                id={`${spec_id}-${param_id}`}
                primary={name.replaceAll('_', ' ')}
                capitalize
                disabled={disabled || (!customize && restricted)}
                loading={loading}
                reset={defaultValue !== null && value !== defaultValue}
                value={value as boolean}
                defaultValue={defaultValue as boolean}
                onChange={(event, v) => handleChange(v)}
              />
            );

          case 'list':
            return (
              <SelectListInput
                id={`${spec_id}-${param_id}`}
                primary={name.replaceAll('_', ' ')}
                capitalize
                disabled={disabled || (!customize && restricted)}
                loading={loading}
                reset={defaultValue !== null && value !== defaultValue}
                value={value as string}
                defaultValue={defaultValue as string}
                options={(Array.isArray(list) ? list : []).map(item => ({
                  value: item,
                  primary: item.replaceAll('_', ' ')
                }))}
                onChange={(event, v) => handleChange(v)}
              />
            );

          default:
            return null;
        }
      }}
    />
  );
});
Parameter.displayName = 'Parameter';

type ServiceProps = {
  cat_id: number;
  svr_id: number;
  customize: boolean;
  disabled: boolean;
  loading: boolean;
};

const Service = React.memo(({ cat_id, svr_id, customize, disabled, loading }: ServiceProps) => {
  const theme = useTheme();
  const form = useForm();

  const handleChange = useCallback(
    (selected: boolean) => {
      form.setFieldValue('settings.services', categories => {
        const category = categories?.[cat_id];
        if (!category) return categories;
        const service = category.services?.[svr_id];
        if (!service) return categories;

        service.selected = selected;
        category.selected = category.services.every(s => s.selected);
        return categories;
      });
    },
    [form, cat_id, svr_id]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.25), marginLeft: 42 }}>
      <form.Subscribe
        selector={state => {
          const svr = state.values.settings.services?.[cat_id]?.services?.[svr_id];
          return [svr?.name, svr?.category, svr?.description, svr?.selected, svr?.default, svr?.restricted] as const;
        }}
        children={([name, category, description, selected, defaultValue, restricted]) => (
          <ListHeader
            id={`${category}-${name}`}
            primary={name}
            primaryProps={{ className: 'Anchor' }}
            secondary={description}
            checked={selected}
            anchor
            reset={defaultValue !== null && selected !== defaultValue}
            onChange={!customize && restricted ? undefined : () => handleChange(!selected)}
            onReset={!customize && restricted ? undefined : () => handleChange(defaultValue)}
          />
        )}
      />

      <form.Subscribe
        selector={state => {
          const svr = state.values.settings.services?.[cat_id]?.services?.[svr_id];
          const specs = state.values.settings.service_spec;

          return svr ? { svr, specs } : undefined;
        }}
        children={obj => {
          if (!obj) return null;
          const { svr, specs } = obj;
          if (!svr || !specs) return null;

          const specID = specs.findIndex(spec => spec.name === svr.name);
          if (specID < 0) return null;

          const sortedParams = specs[specID].params
            .map((param, param_id) => [param, param_id] as const)
            .sort(([p1], [p2]) => (customize ? 1 : (p2.restricted ? 0 : 1) - (p1.restricted ? 0 : 1)));

          return (
            <List inset>
              {sortedParams.map(([param, param_id]) => (
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
          );
        }}
      />
    </div>
  );
});
Service.displayName = 'Service';

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
          const category = s?.services?.[cat_id];
          if (!category) return s;

          category.selected = selected;
          category.services = category.services.map(srv => ({ ...srv, selected }));
          return s;
        });
      },
      [form, cat_id]
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.5) }}>
        <form.Subscribe
          selector={state => {
            const cat = state.values.settings.services?.[cat_id];
            const list = state.values.settings.services?.[cat_id]?.services?.map(svr => svr?.selected);
            return [
              cat.name,
              cat.selected,
              cat.default,
              cat.restricted,
              !list.every(i => i) && list.some(i => i)
            ] as const;
          }}
          children={([name, selected, defaultValue, restricted, indeterminate]) => (
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
              onChange={!customize && restricted ? undefined : () => handleChange(!selected)}
              onReset={!customize && restricted ? undefined : () => handleChange(defaultValue)}
            />
          )}
        />

        <form.Subscribe
          selector={state => state.values.settings.services?.[cat_id]?.services}
          children={services =>
            (Array.isArray(services) ? services : []).map((service, svr_id) => (
              <Service
                key={`${service.name}-${svr_id}`}
                cat_id={cat_id}
                svr_id={svr_id}
                customize={customize}
                disabled={disabled}
                loading={loading}
              />
            ))
          }
        />
      </div>
    );
  }
);
Category.displayName = 'Category';

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
            selector={state => state.values.settings?.services}
            children={categories =>
              (Array.isArray(categories) ? categories : []).map((category, cat_id) => (
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
ServicesSection.displayName = 'ServicesSection';
