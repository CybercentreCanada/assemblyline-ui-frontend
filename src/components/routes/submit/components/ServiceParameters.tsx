import { Typography, useTheme } from '@mui/material';
import type { ProfileSettings } from 'components/routes/settings/settings.utils';
import type { SubmitStore } from 'components/routes/submit/submit.form';
import { useForm } from 'components/routes/submit/submit.form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { CollapseSection } from 'components/visual/Layouts/CollapseSection';
import { ShowMore } from 'components/visual/ShowMore';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type SpecParamList = {
  show: number[];
  hidden: number[];
};

type ParamProps = {
  param_id: number;
  spec_id: number;
  service: ProfileSettings['services'][number]['services'][number];
};

const Param: React.FC<ParamProps> = React.memo(({ param_id, spec_id, service }) => {
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => {
        const p = state.values.settings.service_spec[spec_id].params[param_id];
        return [
          p.type,
          p.name,
          p.value,
          p.default,
          p.editable,
          p?.list,
          state.values.state.disabled,
          state.values.state.customize
        ];
      }}
      children={props => {
        const type = props[0] as ProfileSettings['service_spec'][number]['params'][number]['type'];
        const name = props[1] as ProfileSettings['service_spec'][number]['params'][number]['name'];
        const value = props[2];
        const defaultValue = props[3];
        const editable = props[4] as ProfileSettings['service_spec'][number]['params'][number]['editable'];
        const list = props[5] as ProfileSettings['service_spec'][number]['params'][number]['list'];
        const disabled = props[6] as SubmitStore['state']['disabled'];
        const customize = props[7] as SubmitStore['state']['customize'];

        switch (type) {
          case 'bool':
            return (
              <CheckboxInput
                id={`${service.category} ${service.name} ${name.replaceAll('_', ' ')}`}
                label={name.replaceAll('_', ' ')}
                labelProps={{ textTransform: 'capitalize' }}
                value={value as boolean}
                disabled={disabled || (!customize && !editable)}
                preventRender={!editable}
                reset={value !== defaultValue}
                onChange={(e, v) =>
                  form.setFieldValue('settings.service_spec', s => {
                    s[spec_id].params[param_id].value = v;
                    return s;
                  })
                }
                onReset={() =>
                  form.setFieldValue('settings.service_spec', s => {
                    s[spec_id].params[param_id].value = defaultValue as boolean;
                    return s;
                  })
                }
              />
            );
          case 'int':
            return (
              <NumberInput
                id={`${service.category} ${service.name} ${name.replaceAll('_', ' ')}`}
                label={name.replaceAll('_', ' ')}
                labelProps={{ textTransform: 'capitalize' }}
                value={value as number}
                disabled={disabled || (!customize && !editable)}
                preventRender={!editable}
                reset={value !== defaultValue}
                rootProps={{ style: { padding: theme.spacing(1) } }}
                onChange={(e, v) =>
                  form.setFieldValue('settings.service_spec', s => {
                    s[spec_id].params[param_id].value = v;
                    return s;
                  })
                }
                onReset={() =>
                  form.setFieldValue('settings.service_spec', s => {
                    s[spec_id].params[param_id].value = defaultValue as number;
                    return s;
                  })
                }
              />
            );
          case 'str':
            return (
              <TextInput
                id={`${service.category} ${service.name} ${name.replaceAll('_', ' ')}`}
                label={name.replaceAll('_', ' ')}
                labelProps={{ textTransform: 'capitalize' }}
                value={value as string}
                disabled={disabled || (!customize && !editable)}
                preventRender={!editable}
                options={list}
                reset={value !== defaultValue}
                rootProps={{ style: { padding: theme.spacing(1) } }}
                onChange={(e, v) =>
                  form.setFieldValue('settings.service_spec', s => {
                    s[spec_id].params[param_id].value = v;
                    return s;
                  })
                }
                onReset={() =>
                  form.setFieldValue('settings.service_spec', s => {
                    s[spec_id].params[param_id].value = defaultValue as string;
                    return s;
                  })
                }
              />
            );
          case 'list':
            return (
              <SelectInput
                id={`${service.category} ${service.name} ${name.replaceAll('_', ' ')}`}
                label={name.replaceAll('_', ' ')}
                labelProps={{ textTransform: 'capitalize' }}
                value={value as string}
                disabled={disabled || (!customize && !editable)}
                preventRender={!editable}
                options={list.map(key => ({ primary: key.replaceAll('_', ' '), value: key })).sort()}
                reset={value !== defaultValue}
                rootProps={{ style: { padding: theme.spacing(1) } }}
                onChange={(e, v) =>
                  form.setFieldValue('settings.service_spec', s => {
                    s[spec_id].params[param_id].value = v as string;
                    return s;
                  })
                }
                onReset={() =>
                  form.setFieldValue('settings.service_spec', s => {
                    s[spec_id].params[param_id].value = defaultValue as string;
                    return s;
                  })
                }
              />
            );
        }
      }}
    />
  );
});

type ServiceProps = {
  cat_id: number;
  svr_id: number;
  service: ProfileSettings['services'][number]['services'][number];
};

const Service: React.FC<ServiceProps> = React.memo(({ cat_id, svr_id, service }) => {
  const form = useForm();

  const handleHasParams = useCallback(
    (spec: ProfileSettings['service_spec'][number], customize: boolean) =>
      !spec ? false : spec.params.some(p => p.editable || customize),
    []
  );

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
    (service_spec: ProfileSettings['service_spec'][number], selected: boolean, customize: boolean): SpecParamList => {
      if (!service_spec?.params) return { show: [], hidden: [] };

      return service_spec.params.reduce(
        (prev, current, i) =>
          (selected && current.editable) || customize
            ? { ...prev, show: [...prev.show, i] }
            : { ...prev, hidden: [...prev.hidden, i] },
        { show: [], hidden: [] } as SpecParamList
      );
    },
    []
  );

  return (
    <form.Subscribe
      selector={state => {
        const svr = state.values.settings.services[cat_id].services[svr_id];
        const specID = state.values.settings.service_spec.findIndex(spec => spec.name === service.name);
        const spec = specID >= 0 ? state.values.settings.service_spec[specID] : null;
        const hasParams = handleHasParams(spec, state.values.state.customize);
        return [
          svr.selected,
          svr.default,
          svr.editable,
          specID,
          spec,
          hasParams,
          state.values.state.disabled,
          state.values.state.customize
        ];
      }}
      children={props => {
        const selected = props[0] as ProfileSettings['services'][number]['selected'];
        const defaultValue = props[1] as ProfileSettings['services'][number]['default'];
        const editable = props[2] as ProfileSettings['services'][number]['editable'];
        const specID = props[3] as number;
        const spec = props[4] as ProfileSettings['service_spec'][number];
        const hasParams = props[5] as boolean;
        const disabled = props[6] as SubmitStore['state']['disabled'];
        const customize = props[7] as SubmitStore['state']['customize'];

        return (
          <CollapseSection
            header={({ open, setOpen }) => (
              <CheckboxInput
                label={service.name}
                disabled={disabled}
                expand={!hasParams ? null : open}
                readOnly={!customize && !editable}
                reset={defaultValue !== null && selected !== defaultValue}
                value={selected}
                onChange={!customize && !editable ? null : (e, v) => handleChange(v)}
                onExpand={() => setOpen(o => !o)}
                onReset={!customize && !editable ? null : () => handleChange(defaultValue)}
              />
            )}
            closed
            preventRender={!(customize || editable) && !selected}
          >
            {!hasParams ? null : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '48px' }}>
                  {(() => {
                    const params = calculateParams(spec, selected, customize);

                    return (
                      <>
                        {params.show.map(param_id => (
                          <Param
                            key={`${spec.params[param_id].name}-${param_id}`}
                            param_id={param_id}
                            service={service}
                            spec_id={specID}
                          />
                        ))}
                        <ShowMore variant="tiny" preventRender={!params.hidden.length}>
                          {params.hidden.map(param_id => (
                            <Param
                              key={`${spec.params[param_id].name}-${param_id}`}
                              param_id={param_id}
                              service={service}
                              spec_id={specID}
                            />
                          ))}
                        </ShowMore>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </CollapseSection>
        );
      }}
    />
  );
});

type CategoryProps = {
  cat_id: number;
  category: ProfileSettings['services'][number];
};

const Category = React.memo(({ cat_id, category }: CategoryProps) => {
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
        return [
          cat.selected,
          cat.default,
          cat.editable,
          !list.every(i => i) && list.some(i => i),
          state.values.state.customize,
          state.values.state.disabled
        ];
      }}
      children={([selected, defaultValue, editable, indeterminate, customize, disabled]) => (
        <CollapseSection
          header={({ open, setOpen }) => (
            <CheckboxInput
              label={category.name}
              labelProps={{ color: 'textSecondary' }}
              disabled={disabled}
              divider
              expand={open}
              indeterminate={indeterminate}
              readOnly={!customize && !editable}
              reset={defaultValue !== null && selected !== defaultValue}
              value={selected}
              onChange={!customize && !editable ? null : (e, v) => handleChange(v)}
              onExpand={() => setOpen(o => !o)}
              onReset={!customize && !editable ? null : () => handleChange(defaultValue)}
            />
          )}
          preventRender={!(customize || editable) && !(selected || indeterminate)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '38px' }}>
            {category.services.map((service, svr_id) => (
              <Service key={svr_id} cat_id={cat_id} svr_id={svr_id} service={service} />
            ))}
          </div>
        </CollapseSection>
      )}
    />
  );
});

export const ServiceParameters = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const form = useForm();

  return (
    <div>
      <Typography variant="h6">{t('options.services.title')}</Typography>
      <form.Subscribe
        selector={state => [state.values.settings.services]}
        children={([categories]) => (
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.25) }}>
            {categories?.map((category, cat_id) => (
              <Category key={cat_id} cat_id={cat_id} category={category} />
            ))}
          </div>
        )}
      />
    </div>
  );
});
