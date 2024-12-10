import { useTheme } from '@mui/material';
import type { SelectedService } from 'components/models/base/service';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanInput } from 'components/routes/settings/inputs/BooleanInput';
import { InputContainer, InputContainerTitle, InputHeader, InputList } from 'components/routes/settings/inputs/Inputs';
import { NumberInput } from 'components/routes/settings/inputs/NumberInput';
import { SelectInput } from 'components/routes/settings/inputs/SelectInput';
import { TextInput } from 'components/routes/settings/inputs/TextInput';
import { useTranslation } from 'react-i18next';

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
    <InputContainer hidden={hidden} style={{ rowGap: theme.spacing(1) }}>
      <InputHeader primary={{ children: t('services') }} secondary={{ children: t('services.description') }} />

      <form.Field
        name={`next.profiles.${profile}.services`}
        mode="array"
        children={categories =>
          categories.state.value.map((category, cat_id) => (
            <InputContainer key={`${category.name}-${cat_id}`} style={{ rowGap: theme.spacing(0.5) }}>
              <form.Subscribe
                selector={state => {
                  const selected = state.values.next.profiles[profile].services[cat_id].selected;
                  const list = state.values.next.profiles[profile].services[cat_id].services.map(svr => svr.selected);
                  return [selected, !list.every(i => i) && list.some(i => i)];
                }}
                children={([selected, indeterminate]) => (
                  <InputContainerTitle
                    key={`${category.name}-${cat_id}`}
                    id={category.name}
                    data-anchor={category.name}
                    primary={{
                      children: category.name,
                      color: 'primary',
                      id: category.name,
                      className: 'Anchor'
                    }}
                    checked={selected}
                    indeterminate={indeterminate}
                    disabled={!selected && !indeterminate}
                    underlined
                    buttonProps={{
                      onChange: () => {
                        form.setStore(s => {
                          if (selected) {
                            s.next.profiles[profile].services[cat_id].selected = false;
                            s.next.profiles[profile].services[cat_id].services = s.next.profiles[profile].services[
                              cat_id
                            ].services.map(srv => ({
                              ...srv,
                              selected: false
                            }));
                          } else {
                            s.next.profiles[profile].services[cat_id].selected = true;
                            s.next.profiles[profile].services[cat_id].services = s.next.profiles[profile].services[
                              cat_id
                            ].services.map(srv => ({
                              ...srv,
                              selected: true
                            }));
                          }

                          return s;
                        });
                      }
                    }}
                  />
                )}
              />

              <form.Field
                name={
                  `next.profiles.${profile}.services[${cat_id}].services` as 'next.profiles.default.services[0].services'
                }
                mode="array"
                children={services => {
                  const svrs = services.state.value as SelectedService[];
                  return svrs.map((service, svr_id) => (
                    <InputContainer key={`${service.name}-${svr_id}`} style={{ rowGap: theme.spacing(0.5) }}>
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
                            <InputContainerTitle
                              id={`${category.name} - ${service.name}`}
                              data-anchor={`${category.name} - ${service.name}`}
                              primary={{
                                children: service.name,
                                id: `${category.name} - ${service.name}`,
                                className: 'Anchor'
                              }}
                              secondary={{ children: service.description }}
                              checked={selected}
                              disabled={!selected}
                              buttonProps={{
                                onChange: () => {
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
                                  });
                                }
                              }}
                            />
                          );
                        }}
                      />

                      <form.Subscribe
                        selector={state =>
                          state.values.next.profiles[profile].service_spec.findIndex(spec => spec.name === service.name)
                        }
                        children={spec_id =>
                          spec_id < 0 ? null : (
                            <InputList sx={{ marginBottom: theme.spacing(1) }}>
                              <form.Field
                                name={
                                  `next.profiles[${profile}].service_spec[${spec_id}].params` as 'next.profiles.default.service_spec[0].params'
                                }
                                mode="array"
                                children={props4 => {
                                  const params = props4.state.value;

                                  return params.map((param, param_id) => (
                                    <form.Field
                                      key={`${param.name}-${param_id}`}
                                      name={
                                        `next.profiles[${profile}].service_spec[${spec_id}].params[${param_id}].value` as 'next.profiles.default.service_spec[0].params[0].value'
                                      }
                                      children={({ state, handleChange, handleBlur }) => {
                                        const primary = param.name.replaceAll('_', ' ');
                                        // const secondary = `[${param.type}]`;
                                        const secondary = null;

                                        switch (param.type) {
                                          case 'str':
                                            return (
                                              <TextInput
                                                id={`${category.name}-${service.name}-${primary}`}
                                                primary={primary}
                                                secondary={secondary}
                                                capitalize
                                                value={state.value as string}
                                                defaultValue={param.default}
                                                disabled={disabled}
                                                loading={loading}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                onReset={() => handleChange(param.default)}
                                              />
                                            );
                                          case 'int':
                                            return (
                                              <NumberInput
                                                id={`${category.name}-${service.name}-${primary}`}
                                                primary={primary}
                                                secondary={secondary}
                                                capitalize
                                                value={state.value as number}
                                                defaultValue={param.default}
                                                disabled={disabled}
                                                loading={loading}
                                                onBlur={handleBlur}
                                                onChange={e => handleChange(parseInt(e.target.value))}
                                                onReset={() => handleChange(param.default)}
                                              />
                                            );
                                          case 'bool':
                                            return (
                                              <BooleanInput
                                                id={`${category.name}-${service.name}-${primary}`}
                                                primary={primary}
                                                secondary={secondary}
                                                capitalize
                                                value={state.value as boolean}
                                                defaultValue={param.default as boolean}
                                                disabled={disabled}
                                                loading={loading}
                                                onBlur={handleBlur}
                                                onClick={() => handleChange(!state.value)}
                                                onReset={() => handleChange(param.default)}
                                              />
                                            );
                                          case 'list':
                                            return (
                                              <SelectInput
                                                id={`${category.name}-${service.name}-${primary}`}
                                                primary={primary}
                                                secondary={secondary}
                                                capitalize
                                                value={state.value}
                                                defaultValue={param.default}
                                                disabled={disabled}
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
                                  ));
                                }}
                              />
                            </InputList>
                          )
                        }
                      />
                    </InputContainer>
                  ));
                }}
              />
            </InputContainer>
          ))
        }
      />
    </InputContainer>
  );
};
