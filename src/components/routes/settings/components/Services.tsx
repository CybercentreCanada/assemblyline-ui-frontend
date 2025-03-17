import { useTheme } from '@mui/material';
import { useForm } from 'components/routes/settings/settings.form';
import type { ProfileSettings } from 'components/routes/settings/settings.utils';
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

type SpecParamList = {
  show: number[];
  hidden: number[];
};

type ParameterProps = {
  customize: boolean;
  disabled: boolean;
  loading: boolean;
  param_id: number;
  selected: boolean;
  spec_id: number;
};

const Parameter = React.memo(
  ({
    customize = false,
    disabled = false,
    loading = false,
    param_id = null,
    selected = false,
    spec_id = null
  }: ParameterProps) => {
    const form = useForm();

    return (
      <form.Subscribe
        key={param_id}
        selector={state => {
          const param = state.values.settings.service_spec[spec_id].params[param_id];
          return [param.type, param.name, param.default, param.editable, param.list] as const;
        }}
        children={([type, name, defaultValue, editable, list]) => {
          const field = `settings.service_spec[${spec_id}].params[${param_id}].value` as const;
          const paramDisabled: boolean = disabled || !selected || !(customize || editable);

          return (
            <form.Subscribe
              key={param_id}
              selector={state => [state.values.settings.service_spec[spec_id].params[param_id].value] as const}
              children={([value]) => {
                switch (type) {
                  case 'str':
                    return (
                      <TextListInput
                        id={`${spec_id}-${param_id}`}
                        primary={name.replaceAll('_', ' ')}
                        capitalize
                        disabled={paramDisabled}
                        loading={loading}
                        reset={defaultValue !== null && value !== defaultValue}
                        value={value as string}
                        onChange={(event, v) => form.setFieldValue(field, v)}
                        onReset={() => form.setFieldValue(field, defaultValue as string)}
                      />
                    );
                  case 'int':
                    return (
                      <NumberListInput
                        id={`${spec_id}-${param_id}`}
                        primary={name.replaceAll('_', ' ')}
                        capitalize
                        disabled={paramDisabled}
                        loading={loading}
                        reset={defaultValue !== null && value !== defaultValue}
                        value={value as number}
                        onChange={(event, v) => form.setFieldValue(field, v)}
                        onReset={() => form.setFieldValue(field, defaultValue as number)}
                      />
                    );
                  case 'bool':
                    return (
                      <BooleanListInput
                        id={`${spec_id}-${param_id}`}
                        primary={name.replaceAll('_', ' ')}
                        capitalize
                        disabled={paramDisabled}
                        loading={loading}
                        reset={defaultValue !== null && value !== defaultValue}
                        value={value as boolean}
                        onChange={(event, v) => form.setFieldValue(field, v)}
                        onReset={() => form.setFieldValue(field, defaultValue as boolean)}
                      />
                    );
                  case 'list':
                    return (
                      <SelectListInput
                        id={`${spec_id}-${param_id}`}
                        primary={name.replaceAll('_', ' ')}
                        capitalize
                        disabled={paramDisabled}
                        loading={loading}
                        reset={defaultValue !== null && value !== defaultValue}
                        value={value as string}
                        options={list.map(item => ({ value: item, primary: item.replaceAll('_', ' ') }))}
                        onChange={(event, v) => form.setFieldValue(field, v)}
                        onReset={() => form.setFieldValue(field, defaultValue as string)}
                      />
                    );
                }
              }}
            />
          );
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
  service: ProfileSettings['services'][number]['services'][number];
  svr_id: number;
};

const Service = React.memo(
  ({
    cat_id = null,
    customize = false,
    disabled = false,
    loading = false,
    service = null,
    svr_id = null
  }: ServiceProps) => {
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

    const calculateParams = useCallback(
      (service_spec: ProfileSettings['service_spec'][number], selected: boolean): SpecParamList => {
        if (!service_spec?.params) return { show: [], hidden: [] };

        return service_spec.params.reduce(
          (prev, current, i) =>
            (selected && current.editable) || customize
              ? { ...prev, show: [...prev.show, i] }
              : { ...prev, hidden: [...prev.hidden, i] },
          { show: [], hidden: [] } as SpecParamList
        );
      },
      [customize]
    );

    return (
      <form.Subscribe
        key={`${cat_id}-${svr_id}`}
        selector={state => {
          const svr = state.values.settings.services[cat_id].services[svr_id];
          const specID = state.values.settings.service_spec.findIndex(spec => spec.name === service.name);
          const spec = specID >= 0 ? state.values.settings.service_spec[specID] : null;
          const params = JSON.stringify(calculateParams(spec, svr.selected));
          return [svr.selected, svr.default, svr.editable, specID, spec, params] as const;
        }}
        children={([selected, defaultValue, editable, specID, spec, p]) => {
          const params = JSON.parse(p) as SpecParamList;

          return (
            <div
              key={`${service.name}-${svr_id}`}
              style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.25), marginLeft: '42px' }}
            >
              <ListHeader
                id={`${service.category}-${service.name}`}
                primary={service.name}
                primaryProps={{ className: 'Anchor' }}
                secondary={service.description}
                checked={selected}
                anchor
                reset={defaultValue !== null && selected !== defaultValue}
                onChange={!customize && !editable ? null : (event, checked) => handleChange(!checked)}
                onReset={!customize && !editable ? null : () => handleChange(defaultValue)}
              />

              {params && (
                <List inset>
                  {params.show.map(param_id => (
                    // For restricted users, they should only see what they can edit until they select the "Show more" button
                    <Parameter
                      key={`${spec.params[param_id].name}-${param_id}`}
                      customize={customize}
                      disabled={disabled}
                      loading={loading}
                      param_id={param_id}
                      selected={selected}
                      spec_id={specID}
                    />
                  ))}
                  {!customize && params.hidden.length > 0 && (
                    <ShowMore
                      variant="long"
                      sx={{ width: '100%' }}
                      children={params.hidden.map(param_id => (
                        // For restricted users, they should only see what they can edit until they select the "Show more" button
                        <Parameter
                          key={`${spec.params[param_id].name}-${param_id}`}
                          customize={customize}
                          disabled={disabled}
                          loading={loading}
                          param_id={param_id}
                          selected={selected}
                          spec_id={specID}
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
  category: ProfileSettings['services'][number];
  customize: boolean;
  disabled: boolean;
  loading: boolean;
};

const Category = React.memo(
  ({ cat_id = null, category = null, customize = false, disabled = false, loading = false }: CategoryProps) => {
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
      <form.Subscribe
        selector={state => {
          const cat = state.values.settings.services[cat_id];
          const list = state.values.settings.services[cat_id].services.map(svr => svr.selected);
          return [cat.selected, cat.default, cat.editable, !list.every(i => i) && list.some(i => i)] as const;
        }}
        children={([selected, defaultValue, editable, indeterminate]) => (
          <div
            key={`${category.name}-${cat_id}`}
            style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}
          >
            <ListHeader
              id={category.name}
              anchorProps={{ subheader: true }}
              primary={category.name}
              primaryProps={{ color: theme.palette.text.secondary }}
              checked={selected}
              indeterminate={indeterminate}
              divider
              anchor
              reset={defaultValue !== null && selected !== defaultValue}
              onChange={!customize && !editable ? null : (event, checked) => handleChange(!checked)}
              onReset={!customize && !editable ? null : () => handleChange(defaultValue)}
            />

            {category.services.map((service, svr_id) => (
              <Service
                key={`${cat_id}-${svr_id}`}
                cat_id={cat_id}
                customize={customize}
                disabled={disabled}
                loading={loading}
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
            selector={state => [state.values.settings.services] as const}
            children={([categories]) =>
              categories.map((category, cat_id) => (
                <Category
                  key={`${category.name}-${cat_id}`}
                  cat_id={cat_id}
                  category={category}
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
