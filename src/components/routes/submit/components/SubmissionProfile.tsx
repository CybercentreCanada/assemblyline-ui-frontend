import type { SelectChangeEvent } from '@mui/material';
import { MenuItem, Select, Skeleton, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { Submission } from 'components/models/base/config';
import { useForm } from 'components/routes/submit/contexts/form';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const WrappedSubmissionProfile = () => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();

  const form = useForm();

  const handleChange = useCallback(
    (event: SelectChangeEvent<keyof Submission['profiles']>) => {
      form.setStore(s => {
        const profileKey = event.target.value;
        s.profile = profileKey;

        const profile = configuration.submission.profiles[profileKey];
        if (!profile) {
          s.settings.services.forEach((cat, i) => {
            s.settings.services[i].selected = true;
            cat.services.forEach((svr, j) => {
              s.settings.services[i].services[j].selected = true;
            });
          });
        } else {
          s.settings.services.forEach((cat, i) => {
            s.settings.services[i].selected =
              profile.services.selected.includes(cat.name) && !profile.services.excluded.includes(cat.name);
            cat.services.forEach((svr, j) => {
              s.settings.services[i].services[j].selected =
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
        state.values.submit.isFetchingSettings,
        configuration.submission.profiles,
        state.values.profile
      ]}
      children={([fetching, profiles, profile]) => (
        <div style={{ textAlign: 'left', marginTop: theme.spacing(2), paddingLeft: theme.spacing(2) }}>
          <Typography variant="h6" gutterBottom>
            {t('options.submission.profile_name')}
          </Typography>
          <div style={{ paddingBottom: theme.spacing(1) }}>
            {fetching ? (
              <Skeleton style={{ height: '3rem' }} />
            ) : (
              <Select value={profile} size="small" fullWidth onChange={handleChange}>
                <MenuItem value={'default'}>{'Default'}</MenuItem>
                {Object.keys(profiles).map((profile_name, i) => (
                  <MenuItem key={i} value={profile_name}>
                    {profile_name}
                  </MenuItem>
                ))}
              </Select>
            )}
          </div>
        </div>
      )}
    />
  );
};

export const SubmissionProfile = React.memo(WrappedSubmissionProfile);
