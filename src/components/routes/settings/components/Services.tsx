import { useTheme } from '@mui/material';
import type {
  SelectedService,
  SelectedServiceCategory,
  ServiceParameter,
  ServiceSpecification
} from 'components/models/base/service';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanListInput } from 'components/visual/List/inputs/BooleanListInput';
import { NumberListInput } from 'components/visual/List/inputs/NumberListInput';
import { SelectListInput } from 'components/visual/List/inputs/SelectListInput';
import { TextListInput } from 'components/visual/List/inputs/TextListInput';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ParameterProps = {
  spec: ServiceSpecification;
  spec_id: number;
  param: ServiceParameter;
  param_id: number;
  customize: boolean;
  disabled: boolean;
  profile: SettingsStore['state']['tab'];
  loading: boolean;
  selected: boolean;
  hidden: boolean;
};

const Parameter = React.memo(
  ({
    spec = null,
    spec_id = null,
    param = null,
    param_id = null,
    customize = false,
    disabled = false,
    profile = 'interface',
    loading = false,
    selected = false,
    hidden = false
  }: ParameterProps) => {
    const form = useForm();

    const name = useMemo<string>(
      () => `next.profiles[${profile}].service_spec[${spec_id}].params[${param_id}].value`,
      [param_id, profile, spec_id]
    );

    return (
      <form.Field
        key={`${param.name}-${param_id}`}
        name={name as 'next.profiles.default.service_spec[0].params[0].value'}
        children={({ state, handleChange, handleBlur }) => {
          const primary = param.name.replaceAll('_', ' ');
          // const secondary = `[${param.type}]`;
          const secondary = null;

          switch (param.type) {
            case 'str':
              return (
                <TextListInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  secondary={secondary}
                  capitalize
                  value={state.value as string}
                  loading={loading}
                  hidden={hidden}
                  disabled={disabled || (!customize && (!selected || !param.editable))}
                  showReset={param.default !== null && state.value !== param.default}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onReset={() => handleChange(param.default)}
                />
              );
            case 'int':
              return (
                <NumberListInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  secondary={secondary}
                  capitalize
                  value={state.value as number}
                  loading={loading}
                  hidden={hidden}
                  disabled={disabled || (!customize && (!selected || !param.editable))}
                  showReset={param.default !== null && state.value !== param.default}
                  onBlur={handleBlur}
                  onChange={e => handleChange(parseInt(e.target.value))}
                  onReset={() => handleChange(param.default)}
                />
              );
            case 'bool':
              return (
                <BooleanListInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  secondary={secondary}
                  capitalize
                  value={state.value as boolean}
                  loading={loading}
                  hidden={hidden}
                  disabled={disabled || (!customize && (!selected || !param.editable))}
                  showReset={param.default !== null && state.value !== param.default}
                  onBlur={handleBlur}
                  onClick={() => handleChange(!state.value)}
                  onReset={() => handleChange(param.default)}
                />
              );
            case 'list':
              return (
                <SelectListInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  secondary={secondary}
                  capitalize
                  value={state.value}
                  loading={loading}
                  hidden={hidden}
                  disabled={disabled || (!customize && (!selected || !param.editable))}
                  showReset={param.default !== null && state.value !== param.default}
                  options={param.list.map(item => ({
                    value: item,
                    label: item.replaceAll('_', ' ')
                  }))}
                  onBlur={handleBlur}
                  onChange={event => handleChange(event.target.value as string)}
                  onReset={() => handleChange(param.default)}
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
  hidden: boolean;
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
    hidden = false,
    profile = 'interface',
    loading = false
  }: ServiceProps) => {
    const form = useForm();

    const handleChange = useCallback(
      (selected: boolean) => {
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
        });
      },
      [cat_id, form, profile, svr_id]
    );

    return (
      <form.Subscribe
        key={`${cat_id}-${svr_id}`}
        selector={state => [
          state.values.next.profiles[profile].services[cat_id].services[svr_id].selected,
          state.values.next.profiles[profile].service_spec.findIndex(spec => spec.name === service.name)
        ]}
        children={([selected, spec_id]) => {
          const specID = spec_id as number;
          const spec = specID >= 0 ? form.state.values.next.profiles[profile].service_spec[specID] : null;

          return !customize && hidden && !selected ? null : (
            <List
              key={`${service.name}-${svr_id}`}
              id={`${service.category} - ${service.name}`}
              data-anchor={`${service.category} - ${service.name}`}
              primaryProps={{
                id: `${service.category} - ${service.name}`,
                children: service.name,
                className: 'Anchor'
              }}
              secondaryProps={{ children: service.description }}
              checkboxProps={{ checked: selected as boolean }}
              buttonProps={{ onChange: () => handleChange(selected as boolean) }}
              checkboxPadding
              button={customize}
              disabled={!selected}
            >
              {spec.params.map((param, param_id) =>
                !param.editable && !customize && hidden ? null : (
                  <Parameter
                    key={`${param.name}-${param_id}`}
                    spec={spec}
                    spec_id={specID}
                    param={param}
                    param_id={param_id}
                    customize={customize}
                    disabled={disabled}
                    profile={profile}
                    loading={loading}
                    hidden={hidden}
                    selected={selected as boolean}
                  />
                )
              )}
            </List>
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
  loading: boolean;
};

const Category = React.memo(
  ({
    cat_id = null,
    category = null,
    customize = false,
    disabled = false,
    hidden = false,
    profile = 'interface',
    loading = false
  }: CategoryProps) => {
    const theme = useTheme();
    const form = useForm();

    const handleChange = useCallback(
      (selected: boolean) => {
        form.setStore(s => {
          if (selected) {
            s.next.profiles[profile].services[cat_id].selected = false;
            s.next.profiles[profile].services[cat_id].services = s.next.profiles[profile].services[cat_id].services.map(
              srv => ({
                ...srv,
                selected: false
              })
            );
          } else {
            s.next.profiles[profile].services[cat_id].selected = true;
            s.next.profiles[profile].services[cat_id].services = s.next.profiles[profile].services[cat_id].services.map(
              srv => ({
                ...srv,
                selected: true
              })
            );
          }

          return s;
        });
      },
      [cat_id, form, profile]
    );

    return (
      <form.Subscribe
        selector={state => {
          const selected = state.values.next.profiles[profile].services[cat_id].selected;
          const list = state.values.next.profiles[profile].services[cat_id].services.map(svr => svr.selected);
          return [selected, !list.every(i => i) && list.some(i => i)];
        }}
        children={([selected, indeterminate]) =>
          !customize && hidden && !(selected || indeterminate) ? null : (
            <div
              key={`${category.name}-${cat_id}`}
              style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}
            >
              <ListHeader
                key={`${category.name}-${cat_id}`}
                id={category.name}
                data-anchor={category.name}
                primaryProps={{ id: category.name, children: category.name, className: 'Anchor', color: 'primary' }}
                button={customize}
                disabled={!selected && !indeterminate}
                underlined
                checkboxProps={{
                  checked: selected,
                  indeterminate: indeterminate
                }}
                buttonProps={{
                  onChange: () => handleChange(selected)
                }}
              />

              {category.services.map((service, svr_id) => (
                <Service
                  key={`${cat_id}-${svr_id}`}
                  service={service}
                  svr_id={svr_id}
                  cat_id={cat_id}
                  customize={customize}
                  disabled={disabled}
                  hidden={hidden}
                  profile={profile}
                  loading={loading}
                />
              ))}
            </div>
          )
        }
      />
    );
  }
);

type Props = {
  customize: boolean;
  disabled: boolean;
  hidden: boolean;
  loading: boolean;
  profile: SettingsStore['state']['tab'];
};

export const ServicesSection = ({
  customize = false,
  disabled = false,
  hidden = false,
  loading = false,
  profile = 'interface'
}: Props) => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
      <ListHeader
        primaryProps={{ children: t('services'), id: 'services', className: 'Anchor', variant: 'h6' }}
        secondaryProps={{ children: t('services.description') }}
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
              loading={loading}
            />
          ))
        }
      />
    </div>
  );
};
