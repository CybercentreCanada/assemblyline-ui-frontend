import { useTheme } from '@mui/material';
import type {
  SelectedService,
  SelectedServiceCategory,
  ServiceParameter,
  ServiceSpecification
} from 'components/models/base/service';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanInput } from 'components/routes/settings/inputs/BooleanInput';
import { InputContainer, InputContainerTitle, InputHeader, InputList } from 'components/routes/settings/inputs/Inputs';
import { NumberInput } from 'components/routes/settings/inputs/NumberInput';
import { SelectInput } from 'components/routes/settings/inputs/SelectInput';
import { TextInput } from 'components/routes/settings/inputs/TextInput';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ParameterProps = {
  spec: ServiceSpecification;
  spec_id: number;
  param: ServiceParameter;
  param_id: number;
  customize: boolean;
  disabled: boolean;
  hidden: boolean;
  profile: SettingsStore['state']['tab'];
  loading: boolean;
};

const Parameter = React.memo(
  ({
    spec = null,
    spec_id = null,
    param = null,
    param_id = null,
    customize = false,
    disabled = false,
    hidden = false,
    profile = 'interface',
    loading = false
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
                <TextInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  secondary={secondary}
                  capitalize
                  value={state.value as string}
                  defaultValue={param.default}
                  disabled={disabled || (!customize && !param.editable)}
                  loading={loading}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onReset={() => handleChange(param.default)}
                />
              );
            case 'int':
              return (
                <NumberInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  secondary={secondary}
                  capitalize
                  value={state.value as number}
                  defaultValue={param.default}
                  disabled={disabled || (!customize && !param.editable)}
                  loading={loading}
                  onBlur={handleBlur}
                  onChange={e => handleChange(parseInt(e.target.value))}
                  onReset={() => handleChange(param.default)}
                />
              );
            case 'bool':
              return (
                <BooleanInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  secondary={secondary}
                  capitalize
                  value={state.value as boolean}
                  defaultValue={param.default as boolean}
                  disabled={disabled || (!customize && !param.editable)}
                  loading={loading}
                  onBlur={handleBlur}
                  onClick={() => handleChange(!state.value)}
                  onReset={() => handleChange(param.default)}
                />
              );
            case 'list':
              return (
                <SelectInput
                  id={`${spec.name}-${param.name}`}
                  primary={primary}
                  secondary={secondary}
                  capitalize
                  value={state.value}
                  defaultValue={param.default}
                  disabled={disabled || (!customize && !param.editable)}
                  loading={loading}
                  options={param.list.map(item => ({
                    value: item,
                    label: item.replaceAll('_', ' ')
                  }))}
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
    const theme = useTheme();
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
            <InputContainer key={`${service.name}-${svr_id}`} style={{ rowGap: theme.spacing(0.5) }}>
              <InputContainerTitle
                id={`${service.category} - ${service.name}`}
                data-anchor={`${service.category} - ${service.name}`}
                button={customize}
                primaryProps={{
                  id: `${service.category} - ${service.name}`,
                  children: service.name,
                  className: 'Anchor'
                }}
                secondaryProps={{
                  children: service.description
                }}
                checkboxProps={{
                  checked: selected as boolean
                }}
                disabled={!selected}
                buttonProps={{
                  onChange: () => handleChange(selected as boolean)
                }}
              />

              {specID >= 0 && spec.params.filter(p => p.editable || customize || !hidden).length > 0 ? (
                <InputList sx={{ marginBottom: theme.spacing(1) }}>
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
                        hidden={hidden}
                        profile={profile}
                        loading={loading}
                      />
                    )
                  )}
                </InputList>
              ) : null}
            </InputContainer>
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
            <InputContainer key={`${category.name}-${cat_id}`} style={{ rowGap: theme.spacing(1) }}>
              <InputContainerTitle
                key={`${category.name}-${cat_id}`}
                id={category.name}
                data-anchor={category.name}
                button={customize}
                disabled={!selected && !indeterminate}
                underlined
                primaryProps={{
                  id: category.name,
                  children: category.name,
                  className: 'Anchor',
                  color: 'primary'
                }}
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
            </InputContainer>
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
    <InputContainer style={{ rowGap: theme.spacing(2) }}>
      <InputHeader primary={{ children: t('services') }} secondary={{ children: t('services.description') }} />

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
    </InputContainer>
  );
};
