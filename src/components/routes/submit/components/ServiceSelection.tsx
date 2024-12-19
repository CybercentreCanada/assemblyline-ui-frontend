import { Collapse, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import type { SelectedService, SelectedServiceCategory } from 'components/models/base/service';
import { useForm } from 'components/routes/submit/contexts/form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
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

type ServiceProps = {
  cat_id: number;
  svr_id: number;
  service: SelectedService;
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
};

const Service: React.FC<ServiceProps> = ({
  cat_id,
  svr_id,
  service,
  profile = null,
  loading = false,
  disabled = false
}) => {
  const theme = useTheme();
  const form = useForm();

  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);

  const specId = useMemo(
    () => form.store.state.values.settings.profiles[profile].service_spec.findIndex(s => s.name === service.name),
    [form.store.state.values.settings.profiles, profile, service.name]
  );

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
    setRender(true);
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
            onChange={() => handleClick(selected)}
            expend={specId < 0 ? null : open}
            onExpend={handleExpand}
          />
        )}
      />

      <Collapse in={open}>
        {render && specId >= 0 && (
          <div style={{ marginLeft: theme.spacing(3) }}>
            {form.store.state.values.settings.profiles[profile].service_spec[specId].params.map((param, i) => (
              <form.Subscribe
                key={i}
                selector={state => [state.values.settings.profiles[profile].service_spec[specId].params[i].value]}
                children={([value]) => {
                  switch (param.type) {
                    case 'bool':
                      return (
                        <CheckboxInput
                          label={param.name.replaceAll('_', ' ')}
                          labelProps={{ textTransform: 'capitalize' }}
                          value={value as boolean}
                          disableGap
                          onChange={() => {
                            form.setStore(s => {
                              s.settings.profiles[profile].service_spec[specId].params[i].value =
                                !s.settings.profiles[profile].service_spec[specId].params[i].value;
                              return s;
                            });
                          }}
                        />
                      );
                    case 'int':
                      return (
                        <NumberInput
                          label={param.name.replaceAll('_', ' ')}
                          labelProps={{ textTransform: 'capitalize' }}
                          value={value as number}
                          onChange={(event, v) => {
                            form.setStore(s => {
                              s.settings.profiles[profile].service_spec[specId].params[i].value = v;
                              return s;
                            });
                          }}
                        />
                      );
                    case 'str':
                      return (
                        <TextInput
                          label={param.name.replaceAll('_', ' ')}
                          labelProps={{ textTransform: 'capitalize' }}
                          value={value as string}
                          options={param.list}
                          onChange={(event, v) => {
                            form.setStore(s => {
                              s.settings.profiles[profile].service_spec[specId].params[i].value = v;
                              return s;
                            });
                          }}
                        />
                      );
                    case 'list':
                      return (
                        <SelectInput
                          label={param.name.replaceAll('_', ' ')}
                          labelProps={{ textTransform: 'capitalize' }}
                          value={value as string}
                          items={param.list}
                          onChange={(event, v) => {
                            form.setStore(s => {
                              s.settings.profiles[profile].service_spec[specId].params[i].value = v;
                              return s;
                            });
                          }}
                        />
                      );
                  }
                }}
              />
            ))}
          </div>
        )}
      </Collapse>
    </>
  );
};

type CategoryProps = {
  cat_id: number;
  category: SelectedServiceCategory;
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
};

const Category = ({ cat_id, category, profile = null, loading = false, disabled = false }: CategoryProps) => {
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
            indeterminate={indeterminate}
            onChange={() => handleClick(selected)}
          />
        )}
      />

      <div style={{ marginLeft: theme.spacing(3) }}>
        {category.services.map((service, svr_id) => (
          <Service
            key={svr_id}
            cat_id={cat_id}
            svr_id={svr_id}
            service={service}
            profile={profile}
            loading={loading}
            disabled={disabled}
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
  size?: 'medium' | 'small';
};

const WrappedServiceSelection = ({ profile = null, loading = false, disabled = false, size = 'medium' }: Props) => {
  const { t } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <div style={{ paddingLeft: theme.spacing(2), textAlign: 'left', marginTop: theme.spacing(2) }}>
      <Typography variant="h6" gutterBottom>
        {t('options.service')}
      </Typography>

      {loading ? (
        <ServiceSkeleton size={size} spacing={theme.spacing(4)} />
      ) : (
        <form.Subscribe
          selector={state => [state.values?.settings?.profiles?.[profile]?.services]}
          children={([categories]) =>
            categories.map((category, cat_id) => (
              <Category
                key={cat_id}
                cat_id={cat_id}
                category={category}
                profile={profile}
                loading={loading}
                disabled={disabled}
              />
            ))
          }
        />
      )}
    </div>
  );
};

export const ServiceSelection = React.memo(WrappedServiceSelection);
