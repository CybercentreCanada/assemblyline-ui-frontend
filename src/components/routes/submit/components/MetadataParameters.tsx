import { Stack, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Metadata } from 'components/models/base/config';
import { useForm } from 'components/routes/submit/contexts/form';
import { BooleanInput } from 'components/routes/submit/inputs/BooleanInput';
import { DateInput } from 'components/routes/submit/inputs/DateInput';
import { NumberInput } from 'components/routes/submit/inputs/NumberInput';
import { SelectInput } from 'components/routes/submit/inputs/SelectInput';
import { TextInput } from 'components/routes/submit/inputs/TextInput';
import { matchURL } from 'helpers/utils';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type MetadataParamParam = {
  name: string;
  metadata: Metadata;
  disabled?: boolean;
};

const MetadataParam: React.FC<MetadataParamParam> = React.memo(({ name, metadata, disabled = false }) => {
  const { t } = useTranslation(['submit', 'settings']);
  const form = useForm();
  const { apiCall } = useMyAPI();

  const [options, setOptions] = useState([...metadata.suggestions]);

  const handleValid = useCallback(
    (value: unknown): string => {
      if (!value) return metadata.required ? t('required') : null;

      if (metadata.validator_type === 'uri' && !matchURL((value || '') as string)) return t('invalid_url');

      if (
        metadata.validator_type === 'regex' &&
        !((value || '') as string).match(new RegExp(metadata.validator_params.validation_regex))
      )
        return t('invalid_regex');

      return null;
    },
    [metadata.required, metadata.validator_params.validation_regex, metadata.validator_type, t]
  );

  const handleChange = useCallback(
    (value: unknown) => {
      form.setStore(s => {
        s.metadata = !value ? _.omit(s?.metadata || {}, name) : { ...(s?.metadata || {}), [name]: value };
        return s;
      });
    },
    [form, name]
  );

  const handleReset = useCallback(() => {
    form.setStore(s => {
      s.metadata = _.omit(s?.metadata || {}, name);
      return s;
    });
  }, [form, name]);

  useEffect(() => {
    if (disabled || metadata.validator_type in ['enum', 'boolean', 'integer', 'date']) return;
    apiCall({
      url: `/api/v4/search/facet/submission/metadata.${name}/`,
      onSuccess: api_data => setOptions(o => [...o, ...Object.keys(api_data.api_response)]),
      onFailure: () => null
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.validator_type, name, disabled]);

  return (
    <form.Field
      name={`metadata.${name}`}
      validators={{ onChange: ({ value }) => handleValid(value) }}
      children={({ state, handleBlur }) => {
        switch (metadata.validator_type) {
          case 'boolean':
            return (
              <BooleanInput
                label={name.replace('_', ' ')}
                value={state.value || false}
                onClick={() => handleChange(!!!state.value)}
                onReset={() => handleReset()}
                onBlur={handleBlur}
              />
            );
          case 'date':
            return (
              <DateInput
                label={`${name} [ ${metadata.validator_type.toUpperCase()} ]`}
                date={state.value}
                setDate={value => handleChange(value)}
                onReset={() => handleReset()}
              />
            );
          case 'enum':
            return (
              <SelectInput
                label={`${name} [ ${metadata.validator_type.toUpperCase()} ]`}
                value={state.value || ''}
                items={metadata.validator_params.values}
                onChange={e => handleChange(e.target.value)}
                onReset={() => handleReset()}
                onBlur={handleBlur}
              />
            );
          case 'integer':
            return (
              <NumberInput
                label={`${name} [ ${metadata.validator_type.toUpperCase()} ]`}
                value={state.value}
                min={metadata.validator_params.min}
                max={metadata.validator_params.max}
                onChange={event => handleChange(parseInt(event.target.value))}
                onReset={() => handleReset()}
                onBlur={handleBlur}
              />
            );
          case 'regex':
            return (
              <TextInput
                label={`${name} [ ${metadata.validator_type.toUpperCase()} ]`}
                value={state.value || ''}
                options={options}
                disabled={disabled}
                errors={state.meta.errors}
                tooltipProps={{
                  title: metadata.validator_params?.validation_regex || null,
                  placement: 'right'
                }}
                onChange={v => handleChange(v)}
                onReset={() => handleReset()}
                onBlur={handleBlur}
              />
            );
          default:
            return (
              <TextInput
                label={`${name} [ ${metadata.validator_type.toUpperCase()} ]`}
                value={state.value || ''}
                options={options}
                disabled={disabled}
                errors={state.meta.errors}
                onChange={v => handleChange(v)}
                onReset={() => handleReset()}
                onBlur={handleBlur}
              />
            );
        }
      }}
    />
  );
});

const WrappedMetadataParameters = () => {
  const { t } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const { configuration } = useALContext();

  return (
    <>
      {Object.keys(configuration?.submission?.metadata?.submit || {}).length === 0 ? null : (
        <div style={{ textAlign: 'left', marginTop: theme.spacing(2) }}>
          <Typography variant="h6" gutterBottom>
            {t('options.submission.metadata')}
          </Typography>

          <Stack spacing={1}>
            {Object.entries(configuration.submission.metadata.submit).map(([name, metadata]) => (
              <MetadataParam key={name} name={name} metadata={metadata} />
            ))}
          </Stack>
        </div>
      )}
    </>
  );
};

export const MetadataParameters = React.memo(WrappedMetadataParameters);
