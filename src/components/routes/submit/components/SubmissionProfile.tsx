import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { Submission } from 'components/models/base/config';
import { useForm } from 'components/routes/submit/contexts/form';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const WrappedSubmissionProfile = () => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();

  const form = useForm();

  const handleChange = useCallback(
    (profileKey: keyof Submission['profiles']) => {
      form.setStore(s => {
        s.state.profile = profileKey;

        const profile = configuration.submission.profiles[profileKey];
        if (!profile) {
          s.settings.profiles[profileKey].services.forEach((cat, i) => {
            s.settings.profiles[profileKey].services[i].selected = true;
            cat.services.forEach((svr, j) => {
              s.settings.profiles[profileKey].services[i].services[j].selected = true;
            });
          });
        } else {
          s.settings.profiles[profileKey].services.forEach((cat, i) => {
            s.settings.profiles[profileKey].services[i].selected =
              profile.services.selected.includes(cat.name) && !profile.services.excluded.includes(cat.name);
            cat.services.forEach((svr, j) => {
              s.settings.profiles[profileKey].services[i].services[j].selected =
                (profile.services.selected.includes(svr.name) || profile.services.selected.includes(svr.category)) &&
                !(profile.services.excluded.includes(svr.name) || profile.services.excluded.includes(svr.category));
            });
          });
        }
        return s;
      });
    },
    [configuration.submission.profiles, form]
  );

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.isFetchingSettings,
        state.values.state.profile,
        Object.keys(state.values.settings.profiles)
      ]}
      children={([fetching, profile, profileKeys]) => (
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
            value={profile}
            items={(profileKeys as string[]).sort()}
            loading={fetching as boolean}
            displayEmpty={false}
            onChange={(e, v) => handleChange(v)}
          />
        </div>
      )}
    />
  );
};

export const SubmissionProfile = React.memo(WrappedSubmissionProfile);
