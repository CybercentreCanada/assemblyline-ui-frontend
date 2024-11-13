import { Checkbox, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import type { SelectedService, SelectedServiceCategory } from 'components/models/base/service';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanInput } from 'components/routes/settings/inputs/BooleanInput';
import { NumberInput } from 'components/routes/settings/inputs/NumberInput';
import { SelectInput } from 'components/routes/settings/inputs/SelectInput';
import { TextInput } from 'components/routes/settings/inputs/TextInput';

type Props = {
  loading?: boolean;
  disabled?: boolean;
};

export const Services = ({ loading = false, disabled = false }: Props) => {
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Field
      name="next.services"
      mode="array"
      children={props => {
        const categories = props.state.value as unknown as SelectedServiceCategory[];

        return categories.map((category, cat_id) => (
          <div key={`${category.name}-${cat_id}`} style={{ display: 'contents' }}>
            <form.Subscribe
              selector={state => state.values.next.services[cat_id].selected}
              children={selected => (
                <ListItem
                  id={category.name}
                  className="Anchor"
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={selected}
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
              children={props2 => {
                const services = props2.state.value as unknown as SelectedService[];

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
                          sx={{ marginTop: theme.spacing(1), borderBottom: `thin solid ${theme.palette.divider}` }}
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
                      selector={state => state.values.next.service_spec.findIndex(spec => spec.name === service.name)}
                      children={spec_id =>
                        spec_id < 0 ? null : (
                          <form.Field
                            name={`next.service_spec[${spec_id}].params`}
                            mode="array"
                            children={props3 => {
                              const params = props3.state.value;

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
};
