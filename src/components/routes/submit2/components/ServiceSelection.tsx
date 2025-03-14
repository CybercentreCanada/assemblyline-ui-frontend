import { Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import type { SelectedService, SelectedServiceCategory, ServiceParameter } from 'components/models/base/service';
import { useForm } from 'components/routes/submit2/submit.form';
import { Collapse } from 'components/visual/Collapse';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { ShowMore } from 'components/visual/ShowMore';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ServiceTreeItemSkelProps = {
  size: 'medium' | 'small';
};

const ServiceTreeItemSkel = ({ size = 'medium' }: ServiceTreeItemSkelProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', paddingBottom: '8px' }}>
      <Skeleton style={{ height: size === 'medium' ? '2.5rem' : '2rem', width: '1.5rem' }} />
      <Skeleton style={{ marginLeft: '1rem', height: size === 'medium' ? '2.5rem' : '2rem', width: '100%' }} />
    </div>
  );
};

type SkelItemsProps = {
  size: 'medium' | 'small';
  spacing: number | string;
};

const ServiceSkeleton = ({ size, spacing }: SkelItemsProps) => (
  <>
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'inline-block',
        pageBreakInside: 'avoid'
      }}
    >
      <ServiceTreeItemSkel size={size} />
      <div style={{ paddingLeft: spacing }}>
        <ServiceTreeItemSkel size={size} />
        <ServiceTreeItemSkel size={size} />
        <ServiceTreeItemSkel size={size} />
        <ServiceTreeItemSkel size={size} />
      </div>
    </div>
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'inline-block',
        pageBreakInside: 'avoid'
      }}
    >
      <ServiceTreeItemSkel size={size} />
      <div style={{ paddingLeft: spacing }}>
        <ServiceTreeItemSkel size={size} />
        <ServiceTreeItemSkel size={size} />
      </div>
    </div>
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'inline-block',
        pageBreakInside: 'avoid'
      }}
    >
      <ServiceTreeItemSkel size={size} />
      <div style={{ paddingLeft: spacing }}>
        <ServiceTreeItemSkel size={size} />
        <ServiceTreeItemSkel size={size} />
        <ServiceTreeItemSkel size={size} />
        <ServiceTreeItemSkel size={size} />
        <ServiceTreeItemSkel size={size} />
      </div>
    </div>
  </>
);

type ParamProps = {
  param: ServiceParameter;
  param_id: number;
  service: SelectedService;
  specId: number;
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
  customize?: boolean;
  filterServiceParams?: boolean;
};

const Param: React.FC<ParamProps> = ({
  param,
  param_id,
  service,
  specId,
  profile = null,
  loading = false,
  disabled = false,
  customize = false,
  filterServiceParams = false
}) => {
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.settings.profiles[profile].service_spec[specId].params[param_id].value]}
      children={([value]) => {
        switch (param.type) {
          case 'bool':
            return (
              <CheckboxInput
                id={`${service.category} ${service.name} ${param.name.replaceAll('_', ' ')}`}
                label={param.name.replaceAll('_', ' ')}
                labelProps={{ textTransform: 'capitalize' }}
                value={value as boolean}
                loading={loading}
                disabled={disabled || (!customize && !param.editable)}
                preventRender={filterServiceParams && !param.editable}
                disableGap
                reset={value !== param.default}
                onChange={() => {
                  form.setStore(s => {
                    s.settings.profiles[profile].service_spec[specId].params[param_id].value =
                      !s.settings.profiles[profile].service_spec[specId].params[param_id].value;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.settings.profiles[profile].service_spec[specId].params[param_id].value = param.default;
                    return s;
                  });
                }}
              />
            );
          case 'int':
            return (
              <NumberInput
                id={`${service.category} ${service.name} ${param.name.replaceAll('_', ' ')}`}
                label={param.name.replaceAll('_', ' ')}
                labelProps={{ textTransform: 'capitalize' }}
                value={value as number}
                loading={loading}
                disabled={disabled || (!customize && !param.editable)}
                preventRender={filterServiceParams && !param.editable}
                reset={value !== param.default}
                onChange={(event, v) => {
                  form.setStore(s => {
                    s.settings.profiles[profile].service_spec[specId].params[param_id].value = v;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.settings.profiles[profile].service_spec[specId].params[param_id].value = param.default;
                    return s;
                  });
                }}
              />
            );
          case 'str':
            return (
              <TextInput
                id={`${service.category} ${service.name} ${param.name.replaceAll('_', ' ')}`}
                label={param.name.replaceAll('_', ' ')}
                labelProps={{ textTransform: 'capitalize' }}
                value={value as string}
                loading={loading}
                disabled={disabled || (!customize && !param.editable)}
                preventRender={filterServiceParams && !param.editable}
                options={param.list}
                reset={value !== param.default}
                onChange={(event, v) => {
                  form.setStore(s => {
                    s.settings.profiles[profile].service_spec[specId].params[param_id].value = v;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.settings.profiles[profile].service_spec[specId].params[param_id].value = param.default;
                    return s;
                  });
                }}
              />
            );
          case 'list':
            return (
              <SelectInput
                id={`${service.category} ${service.name} ${param.name.replaceAll('_', ' ')}`}
                label={param.name.replaceAll('_', ' ')}
                labelProps={{ textTransform: 'capitalize' }}
                value={value as string}
                loading={loading}
                disabled={disabled || (!customize && !param.editable)}
                preventRender={filterServiceParams && !param.editable}
                options={param.list.map(key => ({ label: key.replaceAll('_', ' '), value: key })).sort()}
                reset={value !== param.default}
                onChange={(event, v) => {
                  form.setStore(s => {
                    s.settings.profiles[profile].service_spec[specId].params[param_id].value = v;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.settings.profiles[profile].service_spec[specId].params[param_id].value = param.default;
                    return s;
                  });
                }}
              />
            );
        }
      }}
    />
  );
};

type ServiceProps = {
  cat_id: number;
  svr_id: number;
  service: SelectedService;
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
  customize?: boolean;
  filterServiceParams?: boolean;
};

const Service: React.FC<ServiceProps> = ({
  cat_id,
  svr_id,
  service,
  profile = null,
  loading = false,
  disabled = false,
  customize = false,
  filterServiceParams = false
}) => {
  const theme = useTheme();
  const form = useForm();

  const [open, setOpen] = useState<boolean>(false);

  const specId = useMemo<number>(
    () => form.store.state.values.settings.profiles[profile].service_spec.findIndex(s => s.name === service.name),
    [form.store.state.values.settings.profiles, profile, service.name]
  );

  const params = useMemo<{ show: [ServiceParameter, number][]; hidden: [ServiceParameter, number][] }>(() => {
    if (specId < 0) return null;
    const p = form.store.state.values.settings.profiles[profile].service_spec[specId].params;
    return p.reduce(
      (prev, current, i) =>
        current.hide
          ? { ...prev, hidden: [...prev.hidden, [current, i]] }
          : { ...prev, show: [...prev.show, [current, i]] },
      { show: [], hidden: [] } as { show: [ServiceParameter, number][]; hidden: [ServiceParameter, number][] }
    );
  }, [form.store.state.values.settings.profiles, profile, specId]);

  const showCollapse = useMemo<boolean>(() => {
    if (specId < 0) return false;
    else if (customize) return true;
    // If the user isn't able to customize service parameters, we check if there is at least one parameter that is customizable before showing the collapse
    return form.store.state.values.settings.profiles[profile].service_spec[specId].params.some(p => p.editable);
  }, [form.store.state.values.settings.profiles, profile, specId, customize]);

  const handleClick = useCallback(
    (value: boolean) => {
      form.setStore(s => {
        if (value) {
          s.settings.profiles[profile].services[cat_id].selected = false;
          s.settings.profiles[profile].services[cat_id].services[svr_id].selected = false;
        } else {
          s.settings.profiles[profile].services[cat_id].services[svr_id].selected = true;
          s.settings.profiles[profile].services[cat_id].selected = s.settings.profiles[profile].services[
            cat_id
          ].services.every(srv => srv.selected);
        }

        return s;
      });
    },
    [cat_id, form, profile, svr_id]
  );

  const handleExpand = useCallback<React.MouseEventHandler<HTMLButtonElement>>(event => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(o => !o);
  }, []);

  return (
    <>
      <form.Subscribe
        selector={state => [state.values.settings.profiles[profile].services[cat_id].services[svr_id].selected]}
        children={([selected]) => (
          <CheckboxInput
            label={service.name}
            value={selected}
            disableGap
            preventDisabledColor
            preventRender={customize ? false : (filterServiceParams && !params) || !showCollapse || !selected}
            disabled={disabled || !customize}
            onChange={() => handleClick(selected)}
            expend={specId < 0 || !showCollapse ? null : open}
            onExpend={handleExpand}
          />
        )}
      />

      {specId >= 0 && showCollapse && (
        <Collapse in={open}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: theme.spacing(1),
              marginLeft: theme.spacing(3),
              padding: `${theme.spacing(1)} 0`
            }}
          >
            {params.show.map(([param, i]) => (
              <Param
                key={i}
                param={param}
                param_id={i}
                service={service}
                specId={specId}
                profile={profile}
                loading={loading}
                disabled={disabled}
                customize={customize}
                filterServiceParams={!customize && filterServiceParams}
              />
            ))}

            {params.hidden.length > 0 && (
              <ShowMore variant="tiny">
                {params.hidden.map(([param, i]) => (
                  <Param
                    key={i}
                    param={param}
                    param_id={i}
                    service={service}
                    specId={specId}
                    profile={profile}
                    loading={loading}
                    disabled={disabled}
                    customize={customize}
                    filterServiceParams={filterServiceParams}
                  />
                ))}
              </ShowMore>
            )}
          </div>
        </Collapse>
      )}
    </>
  );
};

type CategoryProps = {
  cat_id: number;
  category: SelectedServiceCategory;
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
  customize?: boolean;
  filterServiceParams?: boolean;
};

const Category = ({
  cat_id,
  category,
  profile = null,
  loading = false,
  disabled = false,
  customize = false,
  filterServiceParams = false
}: CategoryProps) => {
  const theme = useTheme();
  const form = useForm();

  const handleClick = useCallback(
    (value: boolean) => {
      form.setStore(s => {
        if (value) {
          s.settings.profiles[profile].services[cat_id].selected = false;
          s.settings.profiles[profile].services[cat_id].services = s.settings.profiles[profile].services[
            cat_id
          ].services.map(srv => ({
            ...srv,
            selected: false
          }));
        } else {
          s.settings.profiles[profile].services[cat_id].selected = true;
          s.settings.profiles[profile].services[cat_id].services = s.settings.profiles[profile].services[
            cat_id
          ].services.map(srv => ({
            ...srv,
            selected: true
          }));
        }

        return s;
      });
    },
    [cat_id, form, profile]
  );

  return (
    <>
      <form.Subscribe
        selector={state => {
          const selected = state.values.settings.profiles[profile].services[cat_id].selected;
          const list = state.values.settings.profiles[profile].services[cat_id].services.map(svr => svr.selected);
          return [selected, !list.every(i => i) && list.some(i => i)];
        }}
        children={([selected, indeterminate]) => (
          <CheckboxInput
            label={category.name}
            value={selected}
            disableGap
            preventDisabledColor
            indeterminate={indeterminate}
            disabled={disabled || !customize}
            onChange={() => handleClick(selected)}
          />
        )}
      />

      <div
        style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.25), marginLeft: theme.spacing(3) }}
      >
        {category.services.map((service, svr_id) => (
          <Service
            key={svr_id}
            cat_id={cat_id}
            svr_id={svr_id}
            service={service}
            profile={profile}
            loading={loading}
            disabled={disabled}
            customize={customize}
            filterServiceParams={filterServiceParams}
          />
        ))}
      </div>
    </>
  );
};

type Props = {
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
  customize?: boolean;
  size?: 'medium' | 'small';
  filterServiceParams?: boolean;
};

const WrappedServiceSelection = ({
  profile = null,
  loading = false,
  disabled = false,
  customize = false,
  size = 'medium',
  filterServiceParams = false
}: Props) => {
  const { t } = useTranslation(['submit2', 'settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <div style={{ textAlign: 'left', marginTop: theme.spacing(2) }}>
      <Typography variant="h6" gutterBottom>
        {t('options.service')}
      </Typography>

      {loading ? (
        <ServiceSkeleton size={size} spacing={theme.spacing(4)} />
      ) : (
        <form.Subscribe
          selector={state => [loading ? null : state.values.settings.profiles[profile].services]}
          children={([categories]) => (
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.25) }}>
              {categories?.map((category, cat_id) => (
                <Category
                  key={cat_id}
                  cat_id={cat_id}
                  category={category}
                  profile={profile}
                  loading={loading}
                  disabled={disabled}
                  customize={customize}
                  filterServiceParams={filterServiceParams}
                />
              ))}
            </div>
          )}
        />
      )}
    </div>
  );
};

export const ServiceSelection = React.memo(WrappedServiceSelection);
