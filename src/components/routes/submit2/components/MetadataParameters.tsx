import { Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Metadata } from 'components/models/base/config';
import { useForm } from 'components/routes/submit2/submit.form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { DateInput } from 'components/visual/Inputs/DateInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { isURL } from 'helpers/utils';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type MetadataParamParam = {
  name: string;
  metadata: Metadata;
  loading?: boolean;
  disabled?: boolean;
};

const MetadataParam: React.FC<MetadataParamParam> = React.memo(
  ({ name, metadata, loading = false, disabled = false }) => {
    const { t } = useTranslation(['submit2', 'settings']);
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
      apiCall<string[]>({
        url: `/api/v4/search/facet/submission/metadata.${name}/`,
        onSuccess: api_data => setOptions(o => [...new Set([...o, ...Object.keys(api_data.api_response)])].sort()),
        onFailure: () => null
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metadata.validator_type, name, disabled]);

    return (
      <form.Subscribe
        selector={state => state.values?.metadata?.[name]}
        children={value => {
          switch (metadata.validator_type) {
            case 'boolean':
              return (
                <CheckboxInput
                  id={`metadata-${name.replace('_', ' ')}`}
                  label={name.replace('_', ' ')}
                  labelProps={{ textTransform: 'capitalize' }}
                  value={(value as boolean) || false}
                  loading={loading}
                  disabled={disabled}
                  reset={!!value}
                  disableGap
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleReset()}
                />
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
                  id={`metadata-${name.replace('_', ' ')}`}
                  label={`${name.replace('_', ' ')}  [ ${metadata.validator_type.toUpperCase()} ]`}
                  labelProps={{ textTransform: 'capitalize' }}
                  value={(value as string) || ''}
                  options={(metadata.validator_params.values as string[])
                    .map(key => ({ label: key.replaceAll('_', ' '), value: key }))
                    .sort()}
                  loading={loading}
                  disabled={disabled}
                  reset={!!value}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleReset()}
                />
              );
            case 'integer':
              return (
                <NumberInput
                  id={`metadata-${name.replace('_', ' ')}`}
                  label={`${name.replace('_', ' ')}  [ ${metadata.validator_type.toUpperCase()} ]`}
                  labelProps={{ textTransform: 'capitalize' }}
                  value={value as number}
                  min={metadata.validator_params.min}
                  max={metadata.validator_params.max}
                  loading={loading}
                  disabled={disabled}
                  reset={!!value}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleReset()}
                />
              );
            case 'regex':
              return (
                <TextInput
                  id={`metadata-${name.replace('_', ' ')}`}
                  label={`${name.replace('_', ' ')}  [ ${metadata.validator_type.toUpperCase()} ]`}
                  labelProps={{ textTransform: 'capitalize' }}
                  value={(value as string) || ''}
                  options={options}
                  loading={loading}
                  disabled={disabled}
                  reset={!!value}
                  error={v => handleValid(v)}
                  tooltip={metadata.validator_params?.validation_regex || null}
                  tooltipProps={{ placement: 'right' }}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleReset()}
                />
              );
            default:
              return (
                <TextInput
                  id={`metadata-${name.replace('_', ' ')}`}
                  label={`${name.replace('_', ' ')}  [ ${metadata.validator_type.toUpperCase()} ]`}
                  labelProps={{ textTransform: 'capitalize' }}
                  value={(value as string) || ''}
                  options={options}
                  loading={loading}
                  disabled={disabled}
                  reset={!!value}
                  error={v => handleValid(v)}
                  onChange={(event, v) => handleChange(v)}
                  onReset={() => handleReset()}
                />
              );
          }
        }}
      />
    );
  }
);

type Props = {
  loading?: boolean;
  disabled?: boolean;
};

const WrappedMetadataParameters = ({ loading = false, disabled = false }: Props) => {
  const { t } = useTranslation(['submit2', 'settings']);
  const theme = useTheme();
  const { configuration } = useALContext();

  return (
    <>
      {Object.keys(configuration?.submission?.metadata?.submit || {}).length === 0 ? null : (
        <div style={{ textAlign: 'left', marginTop: theme.spacing(2) }}>
          <Typography variant="h6" gutterBottom>
            {t('options.submission.metadata')}
          </Typography>

          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
            {Object.entries(configuration.submission.metadata.submit).map(([name, metadata]) => (
              <MetadataParam key={name} name={name} metadata={metadata} loading={loading} disabled={disabled} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export const MetadataParameters = React.memo(WrappedMetadataParameters);
