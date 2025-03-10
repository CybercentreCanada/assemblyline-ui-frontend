import { FormHelperText, Paper, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Metadata } from 'components/models/base/config';
import { useForm } from 'components/routes/submit2/submit.form';
import { isValidJSON } from 'components/routes/submit2/submit.utils';
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
  loading?: boolean;
  disabled?: boolean;
};

export const MetadataParam: React.FC<MetadataParamParam> = React.memo(
  ({ name, metadata, loading = false, disabled = false }) => {
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
        form.setFieldValue(`metadata.config`, m => (!value ? _.omit(m || {}, name) : { ...m, [name]: value }));
      },
      [form, name]
    );

    const handleReset = useCallback(() => {
      form.setFieldValue(`metadata.config`, m => _.omit(m || {}, name));
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
        disabled: disabled,
        loading: loading,
        width: '60%',
        rootProps: { style: { margin: theme.spacing(1) } },
        onChange: (e, v) => handleChange(v),
        onReset: () => handleReset()
      }),
      [disabled, handleChange, handleReset, loading, metadata.validator_type, name, theme]
    );

    return (
      <form.Subscribe
        selector={state => state.values?.metadata?.config?.[name]}
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
                    .map(key => ({ primary: key.replaceAll('_', ' '), value: key }))
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

export const SubmissionMetadata = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <div>
      <Typography variant="h6">{t('options.metadata.title')}</Typography>
      <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
        {Object.entries(configuration.submission.metadata.submit).map(([name, metadata]) => (
          <MetadataParam key={name} name={name} metadata={metadata} />
        ))}

        <form.Subscribe
          selector={state => [
            state.values.state.disabled,
            state.values.metadata.extra,
            isValidJSON(state.values.metadata.extra)
          ]}
          children={([disabled, data, error]) => (
            <div
              style={{
                minHeight: `${8 * 19 + 20}px`,
                display: 'flex',
                flexDirection: 'column',
                margin: theme.spacing(1)
              }}
            >
              <Typography color={error ? 'error' : 'textSecondary'} variant="body2">
                {t('options.metadata.extra.label')}
              </Typography>
              <MonacoEditor
                language="json"
                value={data as string}
                error={!!error}
                options={{ readOnly: disabled as boolean }}
                onChange={v => form.setFieldValue('metadata.extra', v)}
              />
              {error && (
                <FormHelperText variant="outlined" sx={{ color: theme.palette.error.main }}>
                  {error}
                </FormHelperText>
              )}
            </div>
          )}
        />
      </Paper>
    </div>
  );
});
