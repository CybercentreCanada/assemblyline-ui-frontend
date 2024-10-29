import { List, ListItem, Paper, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { Metadata } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import { useForm } from 'components/routes/submit/form';
import { matchURL } from 'helpers/utils';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EnumInput } from '../inputs/EnumInput';
import { TextInput } from '../inputs/TextInput';

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

  const [options, setOptions] = useState([]);

  console.log(name, metadata);

  const handleChange = useCallback(
    (value: any) => {
      form.setStore(s => ({
        ...s,
        submissionMetadata:
          value === undefined || value === null || value === ''
            ? _.omit(s?.submissionMetadata || {}, name)
            : { ...(s?.submissionMetadata || {}), [name]: value }
      }));
    },
    [form, name]
  );

  useEffect(() => {
    if (disabled || metadata.validator_type in ['enum', 'boolean', 'integer', 'date']) return;

    apiCall({
      url: `/api/v4/search/facet/submission/metadata.${name}/`,
      onSuccess: api_data => setOptions(Object.keys(api_data.api_response))
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.validator_type, name, disabled]);

  return (
    <form.Field
      field={() => `$.submissionMetadata.${name}`}
      children={({ state, handleBlur }) => {
        switch (metadata.validator_type) {
          case 'keyword':
            return (
              <TextInput
                primary={name.replace('_', ' ')}
                secondary={`[${metadata.validator_type}]`}
                defaultValue={state.value}
                options={options}
                onBlur={handleBlur}
                onChange={v => handleChange(v)}
              />
            );
          case 'enum':
            return (
              <EnumInput
                primary={name.replace('_', ' ')}
                secondary={`[${metadata.validator_type}]`}
                value={state.value}
                items={metadata.validator_params.values}
                onBlur={handleBlur}
                onChange={e => handleChange(e.target.value)}
              />
            );
        }
      }}
    />
  );
});

type ServiceAccordionProps = {
  settings?: UserSettings;
};

const WrappedSubmissionMetadata = ({ settings }: ServiceAccordionProps) => {
  const { t, i18n } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const classes = useStyles();
  const form = useForm();
  const { user: currentUser, c12nDef, configuration } = useALContext();

  console.log(settings);

  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  return (
    <>
      {Object.keys(configuration?.submission?.metadata?.submit || {}).length === 0 ? null : (
        <List
          component={Paper}
          dense
          sx={{
            '&>:not(:last-child)': {
              borderBottom: `thin solid ${theme.palette.divider}`
            }
          }}
        >
          <ListItem>
            <Typography variant="h6" gutterBottom>
              {t('options.submission.metadata')}
            </Typography>
          </ListItem>

          {Object.entries(configuration.submission.metadata.submit).map(
            ([field_name, field_cfg], i) => (
              <MetadataParam key={field_name} name={field_name} metadata={field_cfg} />
            )

            // {
            //   console.log(field_name, field_cfg);

            //   switch (field_cfg.validator_type) {
            //     case 'keyword':
            //       return (
            //         <TextInput
            //           primary={t('options.submission.desc')}
            //           storePath={store => store.settings.description.toPath()}
            //         />
            //       );
            //   }

            //   return (
            //     <div key={i} style={{ padding: `${sp1} ${sp2}` }}>
            //       <form.Field
            //         key={i}
            //         field={() => `$.submissionMetadata.${field_name}`}
            //         children={({ state, handleBlur, handleChange }) => (
            //           <MetadataInputField
            //             key={field_name}
            //             name={field_name}
            //             configuration={field_cfg}
            //             value={state.value}
            //             onChange={v => {
            //               form.setStore(s => {
            //                 const cleanMetadata = s.submissionMetadata;
            //                 if (v === undefined || v === null || v === '') {
            //                   // Remove field from metadata if value is null
            //                   delete cleanMetadata[field_name];
            //                 } else {
            //                   // Otherwise add/overwrite value
            //                   cleanMetadata[field_name] = v;
            //                 }

            //                 return { ...s, submissionMetadata: { ...cleanMetadata } };
            //               });
            //             }}
            //             onReset={() => {
            //               form.setStore(s => {
            //                 const cleanMetadata = s.submissionMetadata;
            //                 delete cleanMetadata[field_name];
            //                 return { ...s, submissionMetadata: { ...cleanMetadata } };
            //               });
            //             }}
            //           />
            //         )}
            //       />
            //     </div>
            //   );
            // }
          )}
        </List>
      )}
    </>
  );
};

export const SubmissionMetadata = React.memo(WrappedSubmissionMetadata);
