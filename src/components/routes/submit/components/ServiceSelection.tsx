import { ExpandMore } from '@mui/icons-material';
import {
  Checkbox,
  Collapse,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { SelectedService, SelectedServiceCategory } from 'components/models/base/service';
import { useForm } from 'components/routes/submit/contexts/form';
import { BooleanInput } from 'components/routes/submit/inputs/BooleanInput';
import { NumberInput } from 'components/routes/submit/inputs/NumberInput';
import { SelectInput } from 'components/routes/submit/inputs/SelectInput';
import { TextInput } from 'components/routes/submit/inputs/TextInput';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineExternalLink } from 'react-icons/hi';

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
};

const Service: React.FC<ServiceProps> = ({ cat_id, svr_id, service }) => {
  const { t } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();

  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);

  const specId = useMemo(
    () => form.store.state.values.settings.service_spec.findIndex(s => s.name === service.name),
    [form.store.state.values.settings.service_spec, service.name]
  );

  const handleClick = useCallback(
    (value: boolean) => {
      form.setStore(s => {
        if (value) {
          s.settings.services[cat_id].selected = false;
          s.settings.services[cat_id].services[svr_id].selected = false;
        } else {
          s.settings.services[cat_id].services[svr_id].selected = true;
          s.settings.services[cat_id].selected = s.settings.services[cat_id].services.every(srv => srv.selected);
        }

        return s;
      });
    },
    [cat_id, form, svr_id]
  );

  const handleExpand = useCallback<React.MouseEventHandler<HTMLButtonElement>>(event => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(o => !o);
    setRender(true);
  }, []);

  return (
    <>
      <form.Field
        name={`settings.services[${cat_id}].services[${svr_id}].selected`}
        children={({ state, handleBlur, handleChange }) => (
          <ListItemButton sx={{ padding: '0px 12px' }} onClick={() => handleClick(state.value)}>
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Checkbox checked={state.value} edge="start" size="small" />
            </ListItemIcon>
            <ListItemText
              style={{ marginRight: theme.spacing(2) }}
              primaryTypographyProps={{
                variant: 'body2',
                whiteSpace: 'nowrap',
                textTransform: 'capitalize',
                display: 'flex',
                columnGap: theme.spacing(1)
              }}
              primary={
                <>
                  {service.name}
                  {service.is_external && <HiOutlineExternalLink fontSize="large" />}
                </>
              }
            />

            {specId >= 0 && (
              <ListItemIcon sx={{ minWidth: 0 }}>
                <IconButton onClick={handleExpand}>
                  <ExpandMore
                    sx={{
                      transition: theme.transitions.create('transform', {
                        duration: theme.transitions.duration.shortest
                      }),
                      transform: 'rotate(0deg)',
                      ...(open && { transform: 'rotate(180deg)' })
                    }}
                  />
                </IconButton>
              </ListItemIcon>
            )}
          </ListItemButton>
        )}
      />

      <Collapse in={open}>
        {render && specId >= 0 && (
          <div style={{ marginLeft: theme.spacing(3) }}>
            {form.store.state.values.settings.service_spec[specId].params.map((param, i) => (
              <form.Field
                key={i}
                name={`settings.service_spec[${specId}].params[${i}].value` as any}
                children={({ state, handleBlur, handleChange }) => {
                  switch (param.type) {
                    case 'bool':
                      return (
                        <BooleanInput
                          label={param.name}
                          value={state.value}
                          onClick={() => handleChange(!state.value)}
                          onBlur={handleBlur}
                        />
                      );
                    case 'int':
                      return (
                        <NumberInput
                          label={param.name}
                          value={state.value}
                          onChange={event => handleChange(parseInt(event.target.value))}
                          onBlur={handleBlur}
                        />
                      );
                    case 'str':
                      return (
                        <TextInput
                          label={param.name}
                          value={state.value}
                          options={param.list}
                          onChange={v => handleChange(v)}
                          onBlur={handleBlur}
                        />
                      );
                    case 'list':
                      return (
                        <SelectInput
                          label={param.name}
                          value={state.value}
                          items={param.list}
                          onChange={e => handleChange(e.target.value)}
                          onBlur={handleBlur}
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
};

const Category = ({ cat_id, category }: CategoryProps) => {
  const { t } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();

  const handleClick = useCallback(
    (value: boolean) => {
      form.setStore(s => {
        if (value) {
          s.settings.services[cat_id].selected = false;
          s.settings.services[cat_id].services = s.settings.services[cat_id].services.map(srv => ({
            ...srv,
            selected: false
          }));
        } else {
          s.settings.services[cat_id].selected = true;
          s.settings.services[cat_id].services = s.settings.services[cat_id].services.map(srv => ({
            ...srv,
            selected: true
          }));
        }

        return s;
      });
    },
    [cat_id, form]
  );

  return (
    <>
      <form.Field
        name={`settings.services[${cat_id}].selected`}
        children={({ state, handleBlur, handleChange }) => (
          <ListItem disablePadding dense>
            <ListItemButton sx={{ padding: '0px 12px' }} onClick={() => handleClick(state.value)}>
              <ListItemIcon sx={{ minWidth: 0 }}>
                <Checkbox checked={state.value} edge="start" size="small" />
              </ListItemIcon>
              <ListItemText primary={category.name} primaryTypographyProps={{}} />
            </ListItemButton>
          </ListItem>
        )}
      />

      <div style={{ marginLeft: theme.spacing(3) }}>
        {category.services.map((service, svr_id) => (
          <Service key={svr_id} cat_id={cat_id} svr_id={svr_id} service={service} />
        ))}
      </div>
    </>
  );
};

type Props = {
  size?: 'medium' | 'small';
};

const WrappedServiceSelection = ({ size = 'medium' }: Props) => {
  const { t } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <div style={{ paddingLeft: theme.spacing(2), textAlign: 'left', marginTop: theme.spacing(2) }}>
      <Typography variant="h6" gutterBottom>
        {t('options.service')}
      </Typography>

      {!form.store.state.values.settings ? (
        <ServiceSkeleton size={size} spacing={theme.spacing(4)} />
      ) : (
        form.store.state.values.settings?.services.map((category, cat_id) => (
          <Category key={cat_id} cat_id={cat_id} category={category} />
        ))
      )}
    </div>
  );
};

export const ServiceSelection = React.memo(WrappedServiceSelection);
