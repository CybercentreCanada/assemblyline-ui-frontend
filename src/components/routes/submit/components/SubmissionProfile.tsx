import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { Grid, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { Submission } from 'components/models/base/config';
import { getProfileNames } from 'components/routes/settings/utils/utils';
import { useForm } from 'components/routes/submit/contexts/form';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  loading?: boolean;
  disabled?: boolean;
  drawerOpen?: boolean;
  setDrawerOpen?: React.Dispatch<boolean>;
};

const WrappedSubmissionProfile = ({
  loading = false,
  disabled = false,
  drawerOpen = false,
  setDrawerOpen = null
}: Props) => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { user, configuration, settings } = useALContext();

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
        <Grid container>
          <Grid item xs={11}>
            <SelectInput
              id={`submission profile name`}
              labelProps={{ color: 'textPrimary', variant: 'h6', gutterBottom: true }}
              value={profile as string}
              options={(profileKeys as string[])
                .map(key => ({
                  label: key === 'default' ? t('profile.custom') : configuration.submission.profiles[key]?.display_name,
                  value: key
                }))
                .sort()}
              loading={loading}
              disabled={disabled}
              displayEmpty={false}
              onChange={(e, v) => handleChange(v)}
            />
          </Grid>
          <Grid item xs={1} style={{ alignContent: 'center' }}>
            <Tooltip title={t('options')}>
              <IconButton
                onClick={() => setDrawerOpen(!drawerOpen)}
                disabled={!user.roles.includes('submission_create')}
              >
                <TuneOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="caption"
              fontStyle={'italic'}
              color={theme.palette.mode == 'dark' ? theme.palette.primary.light : theme.palette.primary.dark}
              alignItems="left"
            >
              {configuration.submission.profiles[profile as string]?.description || t('profile.custom_desc')}
            </Typography>
          </Grid>
        </Grid>
      )}
    />
  );
};

export const SubmissionProfile = React.memo(WrappedSubmissionProfile);
