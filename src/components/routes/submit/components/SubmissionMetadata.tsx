import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { FormHelperText, ListItemText, Typography, useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Metadata, MetadataFieldTypeMap } from 'components/models/base/config';
import type { SubmitMetadata } from 'components/routes/submit/submit.form';
import { useForm } from 'components/routes/submit/submit.form';
import { isValidMetadata } from 'components/routes/submit/submit.utils';
import { Button } from 'components/visual/Buttons/Button';
import { IconButton } from 'components/visual/Buttons/IconButton';
import type { DateInputProps } from 'components/visual/Inputs/DateInput';
import { DateInput } from 'components/visual/Inputs/DateInput';
import type { NumberInputProps } from 'components/visual/Inputs/NumberInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import type { SelectInputProps } from 'components/visual/Inputs/SelectInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import type { SwitchInputProps } from 'components/visual/Inputs/SwitchInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import type { TextInputProps } from 'components/visual/Inputs/TextInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import type { Validator } from 'components/visual/Inputs/utils/inputs.validation';
import MonacoEditor from 'components/visual/MonacoEditor';
import { isURL } from 'helpers/utils';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATIC_VALIDATOR_TYPES_SET = new Set<MetadataFieldTypeMap>(['enum', 'boolean', 'integer', 'date']);

const safeString = (v: unknown): string => (v == null ? '' : String(v));

type MetadataParamProps = {
  name: string;
  metadata: Metadata;
  loading: boolean;
  disabled: boolean;
  editing: boolean;
};

export const MetadataParam: React.FC<MetadataParamProps> = React.memo(
  ({ name, metadata, loading, disabled, editing }) => {
    const { t } = useTranslation(['submit', 'settings']);
    const theme = useTheme();
    const form = useForm();
    const { apiCall } = useMyAPI();

    const [options, setOptions] = useState<string[]>(
      [...new Set(Array.isArray(metadata?.suggestions) ? metadata.suggestions : [])].sort()
    );

    const validatorType = useMemo<MetadataFieldTypeMap>(
      () => (metadata?.validator_type ?? 'string') as MetadataFieldTypeMap,
      [metadata?.validator_type]
    );

    const validatorParams = useMemo<Record<string, unknown>>(
      () => metadata?.validator_params ?? {},
      [metadata?.validator_params]
    );

    const compiledRegex = useMemo<RegExp>(() => {
      if (validatorType !== 'regex') return null;
      const pattern = safeString(validatorParams.validation_regex);
      if (!pattern) return null;
      try {
        return new RegExp(pattern);
      } catch {
        return null;
      }
    }, [validatorParams, validatorType]);

    const handleValidate = useCallback<Validator<unknown, unknown>>(
      value => {
        if (!value) return metadata.required ? { status: 'error', message: t('required') } : null;
        const strValue = safeString(value);
        if (validatorType === 'uri') return isURL(strValue) ? null : { status: 'error', message: t('invalid_url') };
        if (validatorType === 'regex') {
          if (!compiledRegex) return { status: 'error', message: t('invalid_regex') };
          return compiledRegex.test(strValue) ? null : { status: 'error', message: t('invalid_regex') };
        }
        return null;
      },
      [metadata.required, t, validatorType, compiledRegex]
    );

    const handleChange = useCallback(
      (value: unknown) => {
        form.setFieldValue('metadata.data', m => {
          const prev = m ?? {};
          return value == null || value === '' ? _.omit(prev, name) : { ...prev, [name]: value };
        });
      },
      [form, name]
    );

    const handleReset = useCallback(() => {
      form.setFieldValue('metadata.data', m => _.omit(m ?? {}, name));
    }, [form, name]);

    useEffect(() => {
      if (disabled) return;
      if (STATIC_VALIDATOR_TYPES_SET.has(validatorType)) return;
      let mounted = true;
      apiCall<string[]>({
        url: `/api/v4/search/facet/submission/metadata.${name}/`,
        onSuccess: apiData => {
          if (!mounted) return;
          const apiResponse = apiData?.api_response ?? {};
          const keys = Object.keys(apiResponse);
          if (!keys.length) return;
          setOptions(prev => {
            const merged = [...new Set([...prev, ...keys])].sort();
            return merged;
          });
        },
        onFailure: () => null
      });
      return () => {
        mounted = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled, name, validatorType]);

    const baseProps = useMemo<unknown>(
      () =>
        ({
          id: `metadata-${name.replaceAll('_', ' ')}`,
          label: `${name.replaceAll('_', ' ')}  [ ${validatorType.toUpperCase()} ]`,
          labelProps: { textTransform: 'capitalize' as const },
          disabled: disabled || !editing,
          loading,
          width: '60%',
          rootProps: { style: { margin: theme.spacing(1) } },
          onChange: (e, v) => handleChange(v),
          onReset: () => handleReset()
        }) as const,
      [disabled, editing, handleChange, handleReset, loading, name, theme, validatorType]
    );

    return (
      <form.Subscribe selector={state => state.values?.metadata?.data?.[name]}>
        {value => {
          const val = value ?? metadata.default;
          switch (validatorType) {
            case 'boolean':
              return <SwitchInput {...(baseProps as SwitchInputProps)} value={Boolean(val)} reset={Boolean(val)} />;
            case 'date':
              return <DateInput {...(baseProps as DateInputProps)} value={safeString(val)} reset={!!val} />;
            case 'enum': {
              return (
                <SelectInput
                  {...(baseProps as SelectInputProps<{ primary: string; value: string }[]>)}
                  value={safeString(val)}
                  options={((validatorParams?.values as string[]) ?? [])
                    .map(v => ({ primary: v.replaceAll('_', ' '), value: v }))
                    .sort((a, b) => a.primary.localeCompare(b.primary))}
                  reset={!!val}
                  capitalize
                />
              );
            }
            case 'integer':
              return (
                <NumberInput
                  {...(baseProps as NumberInputProps)}
                  value={typeof val === 'number' ? val : null}
                  min={Number(validatorParams?.min ?? 0)}
                  max={Number(validatorParams?.max ?? Number.MAX_SAFE_INTEGER)}
                  reset={!!val}
                />
              );
            case 'regex':
              return (
                <TextInput
                  {...(baseProps as TextInputProps)}
                  value={safeString(val)}
                  options={options}
                  reset={!!val}
                  validate={handleValidate}
                  tooltip={safeString(validatorParams?.validation_regex)}
                  tooltipProps={{ placement: 'right' }}
                />
              );
            default:
              return (
                <TextInput
                  {...(baseProps as TextInputProps)}
                  value={safeString(val)}
                  options={options}
                  reset={!!val}
                  validate={handleValidate}
                />
              );
          }
        }}
      </form.Subscribe>
    );
  }
);

const ExtraMetadata = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  const submitKeys = useMemo(
    () => configuration.submission.metadata.submit,
    [configuration.submission.metadata.submit]
  );

  const handleApply = useCallback(() => {
    try {
      form.setFieldValue('metadata', m => {
        const parsed = JSON.parse(m.edit ?? '{}') as SubmitMetadata['data'];
        return { edit: null, data: { ...(m.data ?? {}), ...parsed } };
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }, [form]);

  const handleClear = useCallback(() => {
    form.setFieldValue('metadata.data', m =>
      Object.fromEntries(Object.entries(m ?? {}).filter(([k]) => k in submitKeys))
    );
  }, [form, submitKeys]);

  return (
    <>
      <form.Subscribe
        selector={state =>
          [
            state.values.state.disabled,
            state.values.state.customize,
            state.values.state.phase === 'editing',
            state.values.metadata.edit
          ] as const
        }
      >
        {([disabled, customize, isEditing, edit]) => {
          const open = !!edit && !disabled && customize && isEditing;
          const error = open ? isValidMetadata(edit, configuration) : null;
          return (
            <Dialog open={open} maxWidth="lg" fullWidth onClose={() => form.setFieldValue('metadata.edit', null)}>
              <DialogTitle>
                <ListItemText primary={t('metadata.editor.title')} />
              </DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: 'min(600px, 80vh)' }}>
                <MonacoEditor
                  language="json"
                  value={edit ?? ''}
                  error={Boolean(error)}
                  options={{ wordWrap: 'on' }}
                  onChange={v => form.setFieldValue('metadata.edit', v)}
                />
                {error && <FormHelperText sx={{ color: theme.palette.error.main }}>{error}</FormHelperText>}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => form.setFieldValue('metadata.edit', null)}>{t('metadata.cancel.title')}</Button>
                <Button disabled={!!error} variant="contained" onClick={handleApply}>
                  {t('metadata.apply.title')}
                </Button>
              </DialogActions>
            </Dialog>
          );
        }}
      </form.Subscribe>

      <form.Subscribe
        selector={state =>
          [
            state.values.state.disabled,
            state.values.state.customize,
            state.values.state.phase === 'editing',
            state.values.metadata.data
          ] as const
        }
      >
        {([disabled, customize, isEditing, data]) => {
          const entries = Object.entries(data ?? {});
          const extra = entries.filter(([k]) => !(k in submitKeys));
          if (!extra.length) return null;
          return (
            <div style={{ margin: theme.spacing(1) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
                <Typography color="textSecondary" variant="body2" sx={{ flex: 1 }}>
                  {t('metadata.extra.label')}
                </Typography>
                <IconButton
                  tooltip={t('metadata.edit.tooltip')}
                  disabled={disabled || !isEditing}
                  preventRender={!customize}
                  size="small"
                  onClick={() =>
                    form.setFieldValue('metadata.edit', JSON.stringify(Object.fromEntries(extra), null, 2))
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  tooltip={t('metadata.clear.tooltip')}
                  disabled={disabled || !isEditing}
                  size="small"
                  onClick={handleClear}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </div>
              <div
                style={{
                  padding: theme.spacing(1),
                  display: 'grid',
                  gridTemplateColumns: 'minmax(auto, 100px) 1fr',
                  gap: theme.spacing(0.5)
                }}
              >
                {extra.map(([k, v]) => (
                  <React.Fragment key={k}>
                    <Typography
                      color="textSecondary"
                      variant="body2"
                      textTransform="capitalize"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {k.replaceAll('_', ' ')}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {safeString(v)}
                    </Typography>
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        }}
      </form.Subscribe>
    </>
  );
});

export const SubmissionMetadata = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration } = useALContext();
  const form = useForm();

  const entries = useMemo(
    () => Object.entries(configuration.submission.metadata.submit),
    [configuration.submission.metadata.submit]
  );

  if (!entries.length) return null;

  return (
    <div>
      <Typography variant="h6">{t('metadata.title')}</Typography>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <form.Subscribe selector={state => [state.values.state.phase, state.values.state.disabled] as const}>
          {([phase, disabled]) =>
            entries.map(([name, metadata]) => (
              <MetadataParam
                key={name}
                name={name}
                metadata={metadata}
                loading={phase === 'loading'}
                disabled={disabled}
                editing={phase === 'editing'}
              />
            ))
          }
        </form.Subscribe>
        <ExtraMetadata />
      </div>
    </div>
  );
});
