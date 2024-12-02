import { Checkbox, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import type { SelectedService, SelectedServiceCategory } from 'components/models/base/service';
import { SettingsStore, useForm } from 'components/routes/settings/contexts/form';
import { BooleanInput } from 'components/routes/settings/inputs/BooleanInput';
import { InputContainer, InputContainerTitle, InputHeader, InputList } from 'components/routes/settings/inputs/Inputs';
import { NumberInput } from 'components/routes/settings/inputs/NumberInput';
import { SelectInput } from 'components/routes/settings/inputs/SelectInput';
import { TextInput } from 'components/routes/settings/inputs/TextInput';
import type { SubmitSettings } from 'components/routes/settings/utils/utils';
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
                    id={`${category.name}-${cat_id}`}
                    primary={{ children: category.name, color: 'primary', id: category.name, className: 'Anchor' }}
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

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.profile,
        state.values.state.hidden,
        state.values.state.customize
      ]}
      children={props => {
        const loading = props[0] as boolean;
        const disabled = props[1] as boolean;
        const profile = props[2] as keyof SubmitSettings['profiles'];
        const hidden = props[3] as boolean;
        const customize = props[4] as boolean;

        return loading ? null : (
          <form.Field
            name={`next.profiles.[${profile}].services`}
            mode="array"
            children={props2 => {
              const categories = props2.state.value as SelectedServiceCategory[];

              return categories.map((category, cat_id) => (
                <div key={`${category.name}-${cat_id}`} style={{ display: 'contents' }}>
                  <form.Subscribe
                    selector={state => {
                      const selected = state.values.next.profiles[profile].services[cat_id].selected;
                      const list = state.values.next.profiles[profile].services[cat_id].services.map(
                        svr => svr.selected
                      );
                      return [selected, !list.every(i => i) && list.some(i => i)];
                    }}
                    children={([selected, indeterminate]) => (
                      <ListItem
                        id={category.name}
                        className="Anchor"
                        secondaryAction={
                          <Checkbox
                            edge="end"
                            checked={selected}
                            indeterminate={indeterminate}
                            disabled={disabled}
                            onChange={() => {
                              form.setStore(s => {
                                s.next.profiles[profile].services[cat_id].selected = !selected;
                                return s;
                              });
                            }}
                          />
                        }
                        disablePadding
                        dense
                        sx={{ marginTop: theme.spacing(1), borderBottom: `thin solid ${theme.palette.divider}` }}
                      >
                        <ListItemButton
                          onClick={() => {
                            form.setStore(s => {
                              s.next.profiles[profile].services[cat_id].selected = !selected;
                              return s;
                            });
                          }}
                        >
                          <ListItemText primary={category.name} primaryTypographyProps={{ variant: 'h5' }} />
                        </ListItemButton>
                      </ListItem>
                    )}
                  />

                  <form.Field
                    name={
                      `next.profiles[${profile}].services[${cat_id}].services` as 'next.profiles.default.services[0].services'
                    }
                    mode="array"
                    children={props3 => {
                      const services = props3.state.value as unknown as SelectedService[];

                      return services.map((service, svr_id) => (
                        <List
                          key={`${service.name}-${svr_id}`}
                          disablePadding
                          sx={{
                            bgcolor: 'background.paper',
                            '&>:not(:last-child)': {
                              borderBottom: `thin solid ${theme.palette.divider}`
                            }
                          }}
                        >
                          <form.Subscribe
                            selector={state =>
                              state.values.next.profiles[profile].services[cat_id].services[svr_id].selected
                            }
                            children={selected => (
                              <ListItem
                                id={`${category.name} - ${service.name}`}
                                className="Anchor"
                                secondaryAction={
                                  <Checkbox
                                    edge="end"
                                    checked={selected}
                                    disabled={disabled}
                                    onChange={() => {
                                      form.setStore(s => {
                                        s.next.profiles[profile].services[cat_id].services[svr_id].selected = !selected;
                                        return s;
                                      });
                                    }}
                                  />
                                }
                                disablePadding
                                dense
                                sx={{
                                  marginTop: theme.spacing(1),
                                  borderBottom: `thin solid ${theme.palette.divider}`
                                }}
                              >
                                <ListItemButton
                                  onClick={() => {
                                    form.setStore(s => {
                                      s.next.profiles[profile].services[cat_id].services[svr_id].selected = !selected;
                                      return s;
                                    });
                                  }}
                                >
                                  <ListItemText
                                    primary={service.name}
                                    secondary={service.description}
                                    primaryTypographyProps={{ variant: 'h6' }}
                                  />
                                </ListItemButton>
                              </ListItem>
                            )}
                          />

                          <form.Subscribe
                            selector={state =>
                              state.values.next.profiles[profile].service_spec.findIndex(
                                spec => spec.name === service.name
                              )
                            }
                            children={spec_id =>
                              spec_id < 0 ? null : (
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
                                                  primary={primary}
                                                  secondary={secondary}
                                                  primaryProps={{ color: 'textSecondary' }}
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
                                                  primary={primary}
                                                  secondary={secondary}
                                                  primaryProps={{ color: 'textSecondary' }}
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
                                                  primary={primary}
                                                  secondary={secondary}
                                                  primaryProps={{ color: 'textSecondary' }}
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
                                                  primary={primary}
                                                  secondary={secondary}
                                                  primaryProps={{ color: 'textSecondary' }}
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
                              )
                            }
                          />
                        </List>
                      ));
                    }}
                  />
                </div>
              ));
            }}
          />
        );
      }}
    />
  );
};
