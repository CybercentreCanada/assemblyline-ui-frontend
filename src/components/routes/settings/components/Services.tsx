import { Checkbox, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import type { Submission } from 'components/models/base/config';
import type { SelectedService, SelectedServiceCategory } from 'components/models/base/service';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanInput } from 'components/routes/settings/inputs/BooleanInput';
import { NumberInput } from 'components/routes/settings/inputs/NumberInput';
import { SelectInput } from 'components/routes/settings/inputs/SelectInput';
import { TextInput } from 'components/routes/settings/inputs/TextInput';

export const ServicesSection = () => {
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.profile,
        state.values.state.hidden
      ]}
      children={props => {
        const loading = props[0] as boolean;
        const disabled = props[1] as boolean;
        const profile = props[2] as keyof Submission['profiles'];
        const hidden = props[3] as boolean;

        return loading ? null : (
          <form.Field
            name="next.services"
            mode="array"
            children={props2 => {
              const categories = props2.state.value as unknown as SelectedServiceCategory[];

              return categories.map((category, cat_id) => (
                <div key={`${category.name}-${cat_id}`} style={{ display: 'contents' }}>
                  <form.Subscribe
                    selector={state => {
                      const selected = state.values.next.services[cat_id].selected;
                      const list = state.values.next.services[cat_id].services.map(svr => svr.selected);
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
                                s.next.services[cat_id].selected = !selected;
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
                              s.next.services[cat_id].selected = !selected;
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
                    name={`next.services[${cat_id}].services`}
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
                            selector={state => state.values.next.services[cat_id].services[svr_id].selected}
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
                                        s.next.services[cat_id].services[svr_id].selected = !selected;
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
                                      s.next.services[cat_id].services[svr_id].selected = !selected;
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
                              state.values.next.service_spec.findIndex(spec => spec.name === service.name)
                            }
                            children={spec_id =>
                              spec_id < 0 ? null : (
                                <form.Field
                                  name={`next.service_spec[${spec_id}].params`}
                                  mode="array"
                                  children={props4 => {
                                    const params = props4.state.value;

                                    return params.map((param, param_id) => (
                                      <form.Field
                                        key={`${param.name}-${param_id}`}
                                        name={`next.service_spec[${spec_id}].params[${param_id}].value` as any}
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
                                                  value={state.value}
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
                                                  value={state.value}
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
                                                  value={state.value}
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
                                                  onChange={event => handleChange(event.target.value)}
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
