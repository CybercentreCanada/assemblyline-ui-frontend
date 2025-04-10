import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { FormHelperText, ListItemText, Typography, useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Metadata } from 'components/models/base/config';
import type { SubmitMetadata } from 'components/routes/submit/submit.form';
import { useForm } from 'components/routes/submit/submit.form';
import { isValidMetadata } from 'components/routes/submit/submit.utils';
import { Button } from 'components/visual/Buttons/Button';
import { IconButton } from 'components/visual/Buttons/IconButton';
import { DateInput } from 'components/visual/Inputs/DateInput';
import type { NumberInputProps } from 'components/visual/Inputs/NumberInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import type { SelectInputProps } from 'components/visual/Inputs/SelectInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import type { SwitchInputProps } from 'components/visual/Inputs/SwitchInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import type { TextInputProps } from 'components/visual/Inputs/TextInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import MonacoEditor from 'components/visual/MonacoEditor';
import { isURL } from 'helpers/utils';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type MetadataParamParam = {
  name: string;
  metadata: Metadata;
  loading: boolean;
  disabled: boolean;
  editing: boolean;
};

export const MetadataParam: React.FC<MetadataParamParam> = React.memo(
  ({ name, metadata, loading = false, disabled = false, editing = false }) => {
    const { t } = useTranslation(['submit', 'settings']);
    const theme = useTheme();
    const form = useForm();
    const { apiCall } = useMyAPI();

    const [options, setOptions] = useState([...new Set(metadata.suggestions)].sort());

    const handleValid = useCallback(
      (value: unknown): string => {
        if (!value) return metadata.required ? t('required') : null;

        if (metadata.validator_type === 'uri' && !isURL((value || '') as string)) return t('invalid_url');

        if (
          metadata.validator_type === 'regex' &&
          !((value || '') as string).match(new RegExp(metadata.validator_params.validation_regex as string))
        )
          return t('invalid_regex');

        return null;
      },
      [metadata.required, metadata.validator_params.validation_regex, metadata.validator_type, t]
    );

    const handleChange = useCallback(
      (value: unknown) => {
        form.setFieldValue(`metadata.data`, m => (!value ? _.omit(m || {}, name) : { ...m, [name]: value }));
      },
      [form, name]
    );

    const handleReset = useCallback(() => {
      form.setFieldValue(`metadata.data`, m => _.omit(m || {}, name));
    }, [form, name]);

    useEffect(() => {
      if (disabled || metadata.validator_type in ['enum', 'boolean', 'integer', 'date']) return;
      apiCall<string[]>({
        url: `/api/v4/search/facet/submission/metadata.${name}/`,
        onSuccess: api_data => setOptions(o => [...new Set([...o, ...Object.keys(api_data.api_response)])].sort()),
        onFailure: () => null
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metadata.validator_type, name, disabled]);

    const props = useMemo<unknown>(
      () => ({
        id: `metadata-${name.replace('_', ' ')}`,
        label: `${name.replace('_', ' ')}  [ ${metadata.validator_type.toUpperCase()} ]`,
        labelProps: { textTransform: 'capitalize' },
        disabled: disabled || !editing,
        loading: loading,
        width: '60%',
        rootProps: { style: { margin: theme.spacing(1) } },
        onChange: (e, v) => handleChange(v),
        onReset: () => handleReset()
      }),
      [disabled, handleChange, handleReset, loading, metadata.validator_type, name, theme, editing]
    );

    return (
      <form.Subscribe
        selector={state => state.values?.metadata?.data?.[name]}
        children={value => {
          switch (metadata.validator_type) {
            case 'boolean':
              return (
                <SwitchInput {...(props as SwitchInputProps)} value={(value as boolean) || false} reset={!!value} />
              );
            case 'date':
              return (
                <DateInput
                  id={`metadata-${name.replace('_', ' ')}`}
                  label={`${name.replace('_', ' ')}  [ ${metadata.validator_type.toUpperCase()} ]`}
                  labelProps={{ textTransform: 'capitalize' }}
                  value={value as string}
                  loading={loading}
                  disabled={disabled}
                  reset={!!value}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleReset()}
                />
              );
            case 'enum':
              return (
                <SelectInput
                  {...(props as SelectInputProps)}
                  value={(value as string) || ''}
                  options={(metadata.validator_params.values as string[])
                    .map(v => ({ primary: v.replaceAll('_', ' '), value: v }))
                    .sort()}
                  reset={!!value}
                />
              );
            case 'integer':
              return (
                <NumberInput
                  {...(props as NumberInputProps)}
                  value={value as number}
                  min={metadata?.validator_params?.min as number}
                  max={metadata?.validator_params?.max as number}
                  reset={!!value}
                />
              );
            case 'regex':
              return (
                <TextInput
                  {...(props as TextInputProps)}
                  value={(value as string) || ''}
                  options={options}
                  reset={!!value}
                  error={v => handleValid(v)}
                  tooltip={(metadata?.validator_params?.validation_regex || null) as string}
                  tooltipProps={{ placement: 'right' }}
                />
              );
            default:
              return (
                <TextInput
                  {...(props as TextInputProps)}
                  value={(value as string) || ''}
                  options={options}
                  reset={!!value}
                  error={v => handleValid(v)}
                />
              );
          }
        }}
      />
    );
  }
);

const ExtraMetadata = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  const handleApply = useCallback(() => {
    try {
      form.setFieldValue('metadata', m => {
        const data = JSON.parse(m.edit) as SubmitMetadata['data'];
        return { edit: null, data: { ...data, ...m.data } };
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [form]);

  const handleClear = useCallback(() => {
    form.setFieldValue('metadata.data', m =>
      Object.fromEntries(Object.entries(m).filter(([key]) => key in configuration.submission.metadata.submit))
    );
  }, [configuration.submission.metadata.submit, form]);

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
        children={([disabled, customize, isEditing, data]) => {
          const error = isValidMetadata(data, configuration);

          return (
            <Dialog
              open={!(data === null || disabled || !customize || !isEditing)}
              maxWidth="lg"
              fullWidth
              onClose={() => form.setFieldValue('metadata.edit', null)}
            >
              <DialogTitle>
                <ListItemText primary={t('metadata.editor.title')} />
              </DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: 'min(600px, 80vh)' }}>
                <MonacoEditor
                  language="json"
                  value={data}
                  error={!!error}
                  options={{ wordWrap: 'on' }}
                  onChange={v => form.setFieldValue('metadata.edit', v)}
                />
                {error && (
                  <FormHelperText variant="outlined" sx={{ color: theme.palette.error.main }}>
                    {error}
                  </FormHelperText>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => form.setFieldValue('metadata.edit', null)}> {t('metadata.cancel.title')}</Button>
                <Button disabled={!!error} variant="contained" onClick={handleApply}>
                  {t('metadata.apply.title')}
                </Button>
              </DialogActions>
            </Dialog>
          );
        }}
      />

      <form.Subscribe
        selector={state =>
          [
            state.values.state.disabled,
            state.values.state.customize,
            state.values.state.phase === 'editing',
            state.values.metadata.data
          ] as const
        }
        children={([disabled, customize, isEditing, data]) => {
          const metadata = Object.entries(data).filter(
            ([key]) => !(key in configuration.submission.metadata.submit)
          ) as [string, string][];

          return !metadata.length ? null : (
            <div style={{ margin: theme.spacing(1) }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: theme.spacing(1) }}>
                <Typography color={'textSecondary'} variant="body2" sx={{ flex: 1 }}>
                  {t('metadata.extra.label')}
                </Typography>

                <IconButton
                  label={t('metadata.edit.tooltip')}
                  disabled={disabled || !isEditing}
                  preventRender={!customize}
                  size="small"
                  onClick={() =>
                    form.setFieldValue('metadata.edit', JSON.stringify(Object.fromEntries(metadata), undefined, 2))
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  label={t('metadata.clear.tooltip')}
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
                  gap: theme.spacing(0.25)
                }}
              >
                {metadata.map(([k, v]) => (
                  <div key={`${k}-${v}`} style={{ display: 'contents' }}>
                    <Typography
                      color="textSecondary"
                      variant="body2"
                      textTransform="capitalize"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {k.replaceAll('_', ' ')}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {v}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          );
        }}
      />
    </>
  );
});

export const SubmissionMetadata = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <div>
      <Typography variant="h6">{t('metadata.title')}</Typography>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <form.Subscribe
          selector={state => [state.values.state.phase, state.values.state.disabled] as const}
          children={([phase, disabled]) =>
            Object.entries(configuration.submission.metadata.submit).map(([name, metadata]) => (
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
        />

        <ExtraMetadata />
      </div>
    </div>
  );
});
