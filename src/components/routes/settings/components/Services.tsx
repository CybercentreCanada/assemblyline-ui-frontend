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

type SpecParam = ProfileSettings['service_spec'][number]['params'][number];

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
          const param = state.values.next.service_spec[spec_id].params[param_id];
          return [param.type, param.name, param.default, param.editable, param.list];
        }}
        children={([type, name, defaultValue, editable, list]) => {
          const field = `next.service_spec[${spec_id}].params[${param_id}].value` as const;
          const paramDisabled: boolean = disabled || !selected || !(customize || editable);

          return (
            <form.Subscribe
              key={param_id}
              selector={state => state.values.next.service_spec[spec_id].params[param_id].value}
              children={value => {
                switch (type) {
                  case 'str':
                    return (
                      <TextListInput
                        id={`${spec_id}-${param_id}`}
                        primary={(name as string).replaceAll('_', ' ')}
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
                        primary={(name as string).replaceAll('_', ' ')}
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
                        primary={(name as string).replaceAll('_', ' ')}
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
                        primary={(name as string).replaceAll('_', ' ')}
                        capitalize
                        disabled={paramDisabled}
                        loading={loading}
                        reset={defaultValue !== null && value !== defaultValue}
                        value={value as string}
                        options={(list as string[]).map(item => ({ value: item, primary: item.replaceAll('_', ' ') }))}
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
        form.setStore(s => {
          if (selected) {
            s.next.services[cat_id].selected = false;
            s.next.services[cat_id].services[svr_id].selected = false;
          } else {
            s.next.services[cat_id].services[svr_id].selected = true;
            s.next.services[cat_id].selected = s.next.services[cat_id].services.every(srv => srv.selected);
          }
          return s;
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
          const selected = state.values.next.services[cat_id].services[svr_id].selected;
          const specID = state.values.next.service_spec.findIndex(spec => spec.name === service.name);
          const spec = specID >= 0 ? state.values.next.service_spec[specID] : null;
          const params = JSON.stringify(calculateParams(spec, selected));
          return [selected, specID, spec, params];
        }}
        children={([selected, specID, spec, p]) => {
          const params = JSON.parse(p as string) as SpecParamList;

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
                checked={selected as boolean}
                anchor
                sx={{ ...(!selected && { opacity: 0.38 }) }}
                onChange={!customize ? null : (event, checked) => handleChange(checked)}
              />

              {params && (
                <List inset>
                  {params.show.map(param_id => (
                    // For restricted users, they should only see what they can edit until they select the "Show more" button
                    <Parameter
                      key={`${(spec as ProfileSettings['service_spec'][number]).params[param_id].name}-${param_id}`}
                      customize={customize}
                      disabled={disabled}
                      loading={loading}
                      param_id={param_id}
                      selected={selected as boolean}
                      spec_id={specID as number}
                    />
                  ))}
                  {!customize && params.hidden.length > 0 && (
                    <ShowMore
                      variant="long"
                      sx={{ width: '100%' }}
                      children={params.hidden.map(param_id => (
                        // For restricted users, they should only see what they can edit until they select the "Show more" button
                        <Parameter
                          key={`${(spec as ProfileSettings['service_spec'][number]).params[param_id].name}-${param_id}`}
                          customize={customize}
                          disabled={disabled}
                          loading={loading}
                          param_id={param_id}
                          selected={selected as boolean}
                          spec_id={specID as number}
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
        form.setFieldValue('next', s => {
          if (selected) {
            s.services[cat_id].selected = false;
            s.services[cat_id].services = s.services[cat_id].services.map(srv => ({
              ...srv,
              selected: false
            }));
          } else {
            s.services[cat_id].selected = true;
            s.services[cat_id].services = s.services[cat_id].services.map(srv => ({
              ...srv,
              selected: true
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
          const selected = state.values.next.services[cat_id].selected;
          const list = state.values.next.services[cat_id].services.map(svr => svr.selected);
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
              primaryProps={{ color: theme.palette.text.secondary }}
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
      selector={state => [state.values.state.customize, state.values.state.disabled, state.values.state.loading]}
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
            selector={state => state.values.next.services}
            children={categories =>
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
