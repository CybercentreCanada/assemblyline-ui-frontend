import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Typography, useTheme } from '@mui/material';
import type { ProfileSettings } from 'components/routes/settings/settings.utils';
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
          p.restricted,
          p?.list,
          state.values.state.disabled,
          state.values.state.customize,
          state.values.state.phase === 'editing'
        ] as const;
      }}
      children={([type, name, value, defaultValue, restricted, list, disabled, customize, isEditing]) => {
        switch (type) {
          case 'bool':
            return (
              <CheckboxInput
                id={`${service.category} ${service.name} ${name.replaceAll('_', ' ')}`}
                label={name.replaceAll('_', ' ')}
                labelProps={{ textTransform: 'capitalize' }}
                value={value as boolean}
                disabled={disabled || !isEditing || (!customize && restricted)}
                preventRender={!customize && restricted}
                reset={defaultValue !== null && value !== defaultValue}
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
                disabled={disabled || !isEditing || (!customize && restricted)}
                preventRender={!customize && restricted}
                reset={defaultValue !== null && value !== defaultValue}
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
                disabled={disabled || !isEditing || (!customize && restricted)}
                preventRender={!customize && restricted}
                options={list}
                reset={defaultValue !== null && value !== defaultValue}
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
                disabled={disabled || !isEditing || (!customize && restricted)}
                preventRender={!customize && restricted}
                options={list.map(key => ({ primary: key.replaceAll('_', ' '), value: key })).sort()}
                reset={defaultValue !== null && value !== defaultValue}
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
      !spec ? false : spec.params.some(p => !p.restricted || customize),
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
    (service_spec: ProfileSettings['service_spec'][number], customize: boolean): SpecParamList => {
      if (!service_spec?.params) return { show: [], hidden: [] };

      return service_spec.params.reduce(
        (prev, current, i) => {
          if (!customize && current.restricted) return prev;
          else if (current.hide) return { ...prev, hidden: [...prev.hidden, i] };
          else return { ...prev, show: [...prev.show, i] };
        },
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
          svr.restricted,
          svr.is_external,
          specID,
          spec,
          hasParams,
          state.values.state.disabled,
          state.values.state.customize,
          state.values.state.phase === 'editing'
        ] as const;
      }}
      children={([
        selected,
        defaultValue,
        restricted,
        external,
        specID,
        spec,
        hasParams,
        disabled,
        customize,
        isEditing
      ]) => (
        <CollapseSection
          header={({ open, setOpen }) => (
            <CheckboxInput
              id={service.name}
              label={service.name}
              disabled={disabled || !isEditing || (!customize && restricted)}
              endAdornment={!external ? null : <OpenInNewOutlinedIcon style={{ fontSize: 'small' }} />}
              expand={!hasParams ? null : open}
              preventRender={!customize && restricted && !selected}
              reset={defaultValue !== null && selected !== defaultValue}
              value={selected}
              onChange={!customize && restricted ? null : (e, v) => handleChange(v)}
              onExpand={() => setOpen(o => !o)}
              onReset={!customize && restricted ? null : () => handleChange(defaultValue)}
            />
          )}
          closed
          preventRender={!customize && restricted && !selected}
        >
          {!hasParams ? null : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '48px' }}>
                {(() => {
                  const params = calculateParams(spec, customize);

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
      )}
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
          cat.restricted,
          !list.every(i => i) && list.some(i => i),
          state.values.state.customize,
          state.values.state.disabled,
          state.values.state.phase === 'editing'
        ] as const;
      }}
      children={([selected, defaultValue, restricted, indeterminate, customize, disabled, isEditing]) => (
        <CollapseSection
          header={({ open, setOpen }) => (
            <CheckboxInput
              label={category.name}
              labelProps={{ color: 'textSecondary' }}
              disabled={disabled || !isEditing || (!customize && restricted)}
              divider
              expand={open}
              indeterminate={indeterminate}
              preventRender={!customize && restricted && !selected && !indeterminate}
              reset={defaultValue !== null && selected !== defaultValue}
              value={selected}
              onChange={!customize && restricted ? null : (e, v) => handleChange(v)}
              onExpand={() => setOpen(o => !o)}
              onReset={!customize && restricted ? null : () => handleChange(defaultValue)}
            />
          )}
          preventRender={!customize && restricted && !(selected || indeterminate)}
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
        selector={state => [state.values.settings.services] as const}
        children={([categories]) => (
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.25) }}>
            {categories?.map((category, cat_id) => <Category key={cat_id} cat_id={cat_id} category={category} />)}
          </div>
        )}
      />
    </div>
  );
});
