import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Typography, useTheme } from '@mui/material';
import type { ProfileSettings } from 'components/routes/settings/settings.utils';
import { useForm } from 'components/routes/submit/submit.form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import type { InputOptions, InputSlotProps, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
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
          p.list,
          state.values.state.disabled,
          state.values.state.customize,
          state.values.state.phase === 'editing'
        ] as const;
      }}
      children={([type, name, value, defaultValue, restricted, list, disabled, customize, isEditing]) => {
        const common = {
          id: `${service.category} ${service.name} ${name.replaceAll('_', ' ')}`,
          label: name.replaceAll('_', ' '),
          disabled: disabled || !isEditing || (!customize && restricted),
          preventRender: !customize && restricted,
          reset: defaultValue !== null && value !== defaultValue,
          onChange: (e, v) =>
            form.setFieldValue('settings.service_spec', s => {
              s[spec_id].params[param_id].value = v;
              return s;
            }),
          onReset: () =>
            form.setFieldValue('settings.service_spec', s => {
              s[spec_id].params[param_id].value = defaultValue;
              return s;
            }),
          slotProps: {
            root: { style: { padding: theme.spacing(1) } },
            formLabel: { style: { textTransform: 'capitalize' } }
          }
        } satisfies InputOptions & InputSlotProps & Omit<InputValueModel<any>, 'value'>;

        switch (type) {
          case 'bool':
            return <CheckboxInput {...common} value={Boolean(value)} defaultValue={Boolean(defaultValue)} />;

          case 'int':
            return <NumberInput {...common} value={value as number} defaultValue={defaultValue as number} />;

          case 'str':
            return (
              <TextInput {...common} value={value as string} defaultValue={defaultValue as string} options={list} />
            );

          case 'list':
            return (
              <SelectInput
                {...common}
                value={value as string}
                defaultValue={defaultValue as string}
                options={
                  Array.isArray(list)
                    ? list
                        .map((key: string) => ({ primary: key.replaceAll('_', ' '), value: key }))
                        .sort((a, b) => a.primary.localeCompare(b.primary))
                    : []
                }
                capitalize
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
    (spec: ProfileSettings['service_spec'][number] | null, customize: boolean) =>
      !spec ? false : spec.params.some(p => !p.restricted || customize),
    []
  );

  const handleChange = useCallback(
    (selected: boolean) => {
      form.setFieldValue('settings.services', categories => {
        const category = categories[cat_id];

        if (selected) {
          category.services[svr_id].selected = true;
          category.selected = category.services.every(srv => srv.selected);
        } else {
          category.selected = false;
          category.services[svr_id].selected = false;
        }
        return categories;
      });
    },
    [cat_id, svr_id, form]
  );

  const calculateParams = useCallback(
    (spec: ProfileSettings['service_spec'][number] | null, customize: boolean): SpecParamList => {
      if (!spec?.params) return { show: [], hidden: [] };

      const show: number[] = [];
      const hidden: number[] = [];

      spec.params.forEach((p, i) => {
        if (!customize && p.restricted) return;
        if (p.hide) hidden.push(i);
        else show.push(i);
      });

      return { show, hidden };
    },
    []
  );

  return (
    <form.Subscribe
      selector={state => {
        const category = state.values.settings.services[cat_id];
        const svr = category.services[svr_id];

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
          {hasParams && (
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '48px' }}>
              {(() => {
                const params = calculateParams(spec, customize);

                return (
                  <>
                    {params.show.map(param_id => (
                      <Param
                        key={`${spec.params[param_id].name}-${param_id}`}
                        param_id={param_id}
                        spec_id={specID}
                        service={service}
                      />
                    ))}

                    <ShowMore variant="tiny" preventRender={!params.hidden.length}>
                      {params.hidden.map(param_id => (
                        <Param
                          key={`${spec.params[param_id].name}-${param_id}`}
                          param_id={param_id}
                          spec_id={specID}
                          service={service}
                        />
                      ))}
                    </ShowMore>
                  </>
                );
              })()}
            </div>
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
        const cat = s.services[cat_id];
        cat.selected = selected;
        cat.services = cat.services.map(srv => ({ ...srv, selected }));
        return s;
      });
    },
    [form, cat_id]
  );

  return (
    <form.Subscribe
      selector={state => {
        const cat = state.values.settings.services[cat_id];
        const list = cat.services.map(svr => svr.selected);
        const indeterminate = !list.every(Boolean) && list.some(Boolean);

        return [
          cat.selected,
          cat.default,
          cat.restricted,
          indeterminate,
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
              slotProps={{ formLabel: { color: 'textSecondary' } }}
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
