import { ExpandMore } from '@mui/icons-material';
import {
  Checkbox,
  Collapse,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import useALContext from 'components/hooks/useALContext';
import type { Submission } from 'components/models/base/config';
import type { SelectedService, SelectedServiceCategory, ServiceParameter } from 'components/models/base/service';
import { useForm } from 'components/routes/submit/contexts/form';
import { BooleanInput } from 'components/routes/submit/inputs/BooleanInput';
import { NumberInput } from 'components/routes/submit/inputs/NumberInput';
import { SelectInput } from 'components/routes/submit/inputs/SelectInput';
import { TextInput } from 'components/routes/submit/inputs/TextInput';
import React, { useCallback, useState } from 'react';
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
  const theme = useTheme();
  const form = useForm();
  const { user: currentUser, configuration } = useALContext();

  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);

  const getParamIndices = useCallback(
    (specs: { name: string; params: ServiceParameter[] }[], profileKey: keyof Submission['profiles']): number[] => {
      const index = specs.findIndex(s => s.name === service.name);
      if (index < 0) return [];

      const profile = configuration.submission.profiles[profileKey];
      if (!profile) return specs[index].params.map((p, i) => i);

      const edits = profile.editable_params[service.name];
      if (!edits) return [];

      return specs[index].params.reduce((prev, p, i) => (edits.includes(p.name) ? [...prev, i] : prev), [] as number[]);
    },
    [configuration.submission.profiles, service.name]
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
    <form.Subscribe
      selector={state => [
        state.values.settings.service_spec.findIndex(s => s.name === service.name),
        getParamIndices(state.values.settings.service_spec, state.values.profile)
      ]}
      children={props => {
        const specIndex = props[0] as number;
        const paramIndices = props[1] as number[];

        return (
          <>
            <form.Subscribe
              selector={state => state.values.settings.services[cat_id].services[svr_id].selected}
              children={selected => (
                <Tooltip title={service.description} placement="right">
                  <ListItemButton sx={{ padding: '0px 12px' }} onClick={() => handleClick(selected)}>
                    <ListItemIcon sx={{ minWidth: 0 }}>
                      <Checkbox
                        checked={selected}
                        disabled={!currentUser.roles.includes('submission_customize')}
                        edge="start"
                        size="small"
                      />
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

                    {paramIndices.length > 0 && (
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
                </Tooltip>
              )}
            />

            <Collapse in={open}>
              {render && paramIndices.length > 0 && (
                <div style={{ marginLeft: theme.spacing(3) }}>
                  {paramIndices.map(index => (
                    <form.Field
                      key={index}
                      name={`settings.service_spec[${specIndex}].params[${index}].value` as any}
                      children={({ state, handleBlur, handleChange }) => {
                        const param = form.store.state.values.settings.service_spec[specIndex].params[index];
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
      }}
    />
  );
};

type CategoryProps = {
  cat_id: number;
  category: SelectedServiceCategory;
};

const Category = ({ cat_id, category }: CategoryProps) => {
  const theme = useTheme();
  const form = useForm();
  const { user: currentUser, configuration } = useALContext();

  const showService = useCallback(
    (service: SelectedService, profileKey: keyof Submission['profiles']): boolean => {
      const profile = configuration.submission.profiles[profileKey];
      if (!profile) return currentUser.roles.includes('submission_customize');
      return (
        profile.services.selected.some(svr => svr === service.name || svr === service.category) &&
        !profile.services.excluded.some(svr => svr === service.name || svr === service.category)
      );
    },
    [configuration.submission.profiles, currentUser.roles]
  );

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
      <form.Subscribe
        selector={state => {
          const selected = state.values.settings.services[cat_id].selected;
          const list = state.values.settings.services[cat_id].services.map(svr => svr.selected);
          return [selected, !list.every(i => i) && list.some(i => i)];
        }}
        children={([selected, indeterminate]) => (
          <ListItem disablePadding dense>
            <ListItemButton sx={{ padding: '0px 12px' }} onClick={() => handleClick(selected)}>
              <ListItemIcon sx={{ minWidth: 0 }}>
                <Checkbox
                  checked={selected}
                  indeterminate={indeterminate}
                  disabled={!currentUser.roles.includes('submission_customize')}
                  edge="start"
                  size="small"
                />
              </ListItemIcon>
              <ListItemText primary={category.name} primaryTypographyProps={{}} />
            </ListItemButton>
          </ListItem>
        )}
      />

      <form.Subscribe
        selector={state => [state.values.settings.services[cat_id].services, state.values.profile]}
        children={props => {
          const services = props[0] as SelectedService[];
          const key = props[1] as keyof Submission['profiles'];

          return (
            <div style={{ marginLeft: theme.spacing(3) }}>
              {services.map((service, svr_id) =>
                !showService(service, key) ? null : (
                  <Service key={svr_id} cat_id={cat_id} svr_id={svr_id} service={service} />
                )
              )}
            </div>
          );
        }}
      />
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
  const { user: currentUser, configuration } = useALContext();

  const showCategory = useCallback(
    (category: SelectedServiceCategory, profileKey: keyof Submission['profiles']): boolean => {
      const profile = configuration.submission.profiles[profileKey];
      if (!profile) return currentUser.roles.includes('submission_customize');
      return (
        profile.services.selected.some(svr => svr === category.name) &&
        !profile.services.excluded.some(svr => svr === category.name)
      );
    },
    [configuration.submission.profiles, currentUser.roles]
  );

  return (
    <div style={{ paddingLeft: theme.spacing(2), textAlign: 'left', marginTop: theme.spacing(2) }}>
      <Typography variant="h6" gutterBottom>
        {t('options.service')}
      </Typography>

      <form.Subscribe
        selector={state => [state.values.submit.isFetchingSettings, state.values.profile]}
        children={props => {
          const fetching = props[0] as boolean;
          const key = props[1] as keyof Submission['profiles'];

          return fetching ? (
            <ServiceSkeleton size={size} spacing={theme.spacing(4)} />
          ) : (
            <form.Field
              name="settings.services"
              mode="array"
              children={({ state }) =>
                state.value.map((category, cat_id) =>
                  !showCategory(category, key) ? null : <Category key={cat_id} cat_id={cat_id} category={category} />
                )
              }
            />
          );
        }}
      />
    </div>
  );
};

export const ServiceSelection = React.memo(WrappedServiceSelection);
