import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { Submission } from 'components/models/base/config';
import { getProfileNames } from 'components/routes/settings/utils/utils';
import { useForm } from 'components/routes/submit/contexts/form';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  profile?: string;
  loading?: boolean;
  disabled?: boolean;
  customize?: boolean;
};

const WrappedSubmissionProfile = ({ loading = false, disabled = false }: Props) => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration, settings } = useALContext();

  const form = useForm();

  const handleChange = useCallback(
    (profileKey: keyof Submission['profiles']) => {
      form.setStore(s => {
        // Update selected profile
        s.state.profile = profileKey;

        // Update settings with profile settings
        Object.entries(s.settings.profiles[s.state.profile]).forEach(
          ([k, v]) => (s.settings = { ...s.settings, [k]: 'value' in v ? v.value : v })
        );

        return s;
      });
    },
    [form]
  );

  return (
    <form.Subscribe
      selector={state => [state.values.state.profile, getProfileNames(settings)]}
      children={([profile, profileKeys]) => (
        <div
          style={{
            textAlign: 'left',
            marginTop: theme.spacing(2),
            paddingLeft: theme.spacing(2),
            marginBottom: theme.spacing(1)
          }}
        >
          <SelectInput
            id={`submission profile name`}
            label={t('options.submission.profile_name')}
            labelProps={{ color: 'textPrimary', variant: 'h6', gutterBottom: true }}
            value={profile as string}
            options={(profileKeys as string[])
              .map(key => ({
                label: key === 'default' ? t('profile.default') : configuration.submission.profiles[key]?.display_name,
                value: key
              }))
              .sort()}
            loading={loading}
            disabled={disabled}
            displayEmpty={false}
            onChange={(e, v) => handleChange(v)}
          />
        </div>
      )}
    />
  );
};

export const SubmissionProfile = React.memo(WrappedSubmissionProfile);
