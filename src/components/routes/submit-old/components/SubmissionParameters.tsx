import { List, ListItem, Paper, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useALContext from 'components/hooks/useALContext';
import type { UserSettings } from 'components/models/base/user_settings';
import { useForm } from 'components/routes/submit-old/form';
import { BooleanInput } from 'components/routes/submit-old/inputs/BooleanInput';
import { TextInput } from 'components/routes/submit-old/inputs/TextInput';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberInput } from '../inputs/NumberInput';
import { SliderInput } from '../inputs/SliderInput';

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

type ServiceAccordionProps = {
  settings?: UserSettings;
};

const WrappedSubmissionParameters = ({ settings }: ServiceAccordionProps) => {
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
          {t('options.submission')}
        </Typography>
      </ListItem>

      <form.Field
        field={store => store.settings.description.toPath()}
        children={({ state, handleBlur, handleChange }) => (
          <TextInput
            primary={t('options.submission.desc')}
            loading={!form.state.values.settings}
            defaultValue={state.value}
            onBlur={handleBlur}
            onChange={v => {
              console.log(v);
              handleChange(v);
            }}
          />
        )}
      />

      <SliderInput
        primary={t('options.submission.priority')}
        storePath={store => store.settings.priority.toPath()}
        min={500}
        max={1500}
        step={null}
        marks={[
          { label: t('options.submission.priority.low'), value: 500 },
          { label: t('options.submission.priority.medium'), value: 1000 },
          { label: t('options.submission.priority.high'), value: 1500 }
        ]}
      />

      <form.Field
        field={store => store.settings.generate_alert.toPath()}
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.generate_alert')}
            secondary={t('settings:submissions.generate_alert_desc')}
            value={state.value}
            loading={!form.state.values.settings}
            onBlur={handleBlur}
            onChange={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        field={store => store.settings.ignore_dynamic_recursion_prevention.toPath()}
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.dynamic_recursion')}
            secondary={t('settings:submissions.dynamic_recursion_desc')}
            value={state.value}
            loading={!form.state.values.settings}
            onBlur={handleBlur}
            onChange={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        field={store => store.settings.ignore_filtering.toPath()}
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.filtering')}
            secondary={t('settings:submissions.filtering_desc')}
            value={state.value}
            loading={!form.state.values.settings}
            onBlur={handleBlur}
            onChange={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        field={store => store.settings.ignore_cache.toPath()}
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.result_caching')}
            secondary={t('settings:submissions.result_caching_desc')}
            value={state.value}
            loading={!form.state.values.settings}
            onBlur={handleBlur}
            onChange={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        field={store => store.settings.deep_scan.toPath()}
        children={({ state, handleBlur, handleChange }) => (
          <BooleanInput
            primary={t('settings:submissions.deep_scan')}
            secondary={t('settings:submissions.deep_scan_desc')}
            value={state.value}
            loading={!form.state.values.settings}
            onBlur={handleBlur}
            onChange={() => handleChange(!state.value)}
          />
        )}
      />

      <form.Field
        field={store => store.settings.ttl.toPath()}
        children={({ state, handleBlur, handleChange }) => (
          <NumberInput
            primary={t('options.submission.ttl')}
            secondary={`(${
              configuration.submission.max_dtl !== 0
                ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                : t('options.submission.ttl.forever')
            })`}
            defaultValue={form.state.values.submissionProfile?.ttl}
            min={configuration.submission.max_dtl !== 0 ? 1 : 0}
            max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
            endAdornment={'days'}
            disabled={
              !currentUser.roles.includes('submission_customize') &&
              form.state.values.submissionProfile?.ttl !== undefined
            }
            value={state.value}
            onBlur={handleBlur}
            onChange={e => handleChange(e.target.value)}
          />
        )}
      />
    </List>
  );
};

export const SubmissionParameters = React.memo(WrappedSubmissionParameters);
