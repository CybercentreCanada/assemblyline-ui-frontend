import { Stack, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Metadata } from 'components/models/base/config';
import { useForm } from 'components/routes/submit/contexts/form';
import { SelectInput } from 'components/routes/submit/inputs/SelectInput';
import { TextInput } from 'components/routes/submit/inputs/TextInput';
import { matchURL } from 'helpers/utils';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  no_pad: {
    padding: 0
  },
  meta_key: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  item: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  tweaked_tabs: {
    [theme.breakpoints.only('xs')]: {
      '& [role=tab]': {
        minWidth: '90px'
      }
    }
  }
}));

const isValid = (input: string, field_cfg: Metadata) => {
  if (!input) {
    // No input provided or is unset at the moment
    // Validity depends on whether or not the field is required
    return !field_cfg.required;
  }

  if (field_cfg.validator_type === 'boolean' || field_cfg.validator_type === 'enum') {
    // Limited selection so should always be valid
    return true;
  }

  if (field_cfg.validator_type === 'uri' && matchURL(input)) {
    return true;
  } else if (
    field_cfg.validator_type !== 'uri' &&
    input.match(new RegExp(field_cfg.validator_params.validation_regex))
  ) {
    return true;
  }
  return false;
};

type MetadataParamParam = {
  name: string;
  metadata: Metadata;
  disabled?: boolean;
};

const MetadataParam: React.FC<MetadataParamParam> = React.memo(({ name, metadata, disabled = false }) => {
  const form = useForm();
  const { apiCall } = useMyAPI();

  const [options, setOptions] = useState([...metadata.suggestions]);

  const handleChange = useCallback(
    (value: unknown) => {
      form.setStore(s => ({
        ...s,
        submissionMetadata: !value
          ? _.omit(s?.submissionMetadata || {}, name)
          : { ...(s?.submissionMetadata || {}), [name]: value }
      }));
    },
    [form, name]
  );

  const handleReset = useCallback(() => {
    form.setStore(s => ({
      ...s,
      submissionMetadata: _.omit(s?.submissionMetadata || {}, name)
    }));
  }, [form, name]);

  useEffect(() => {
    if (disabled || metadata.validator_type in ['enum', 'boolean', 'integer', 'date']) return;

    apiCall({
      url: `/api/v4/search/facet/submission/metadata.${name}/`,
      onSuccess: api_data => setOptions(o => [...o, ...Object.keys(api_data.api_response)])
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.validator_type, name, disabled]);

  return (
    <form.Subscribe
      selector={state => [state.values.submissionMetadata[name], metadata]}
      children={([value, meta]) => {
        switch (meta.validator_type) {
          case 'keyword':
            return (
              <TextInput
                label={`${name.replace('_', ' ')} [ ${meta.validator_type.toUpperCase()} ]`}
                value={value}
                options={options}
                onChange={v => handleChange(v)}
                onReset={() => handleReset()}
              />
            );
          case 'enum':
            return (
              <SelectInput
                label={`${name.replace('_', ' ')} [ ${meta.validator_type.toUpperCase()} ]`}
                value={value}
                items={meta.validator_params.values}
                onChange={e => handleChange(e.target.value)}
                onReset={() => handleReset()}
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
