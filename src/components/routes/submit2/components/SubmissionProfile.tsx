import TuneIcon from '@mui/icons-material/Tune';
import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { getProfileNames } from 'components/routes/settings/settings.utils';
import { useForm } from 'components/routes/submit2/submit.form';
import { Button } from 'components/visual/Buttons/Button';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const SelectSubmissionProfile = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration, settings } = useALContext();
  const form = useForm();

  const options = useMemo<{ value: string; primary: string; secondary: string }[]>(
    () =>
      getProfileNames(settings).map(profileValue => ({
        value: profileValue,
        primary:
          profileValue === 'default'
            ? t(`profile.custom`)
            : configuration.submission.profiles[profileValue].display_name,
        secondary:
          profileValue === 'default' ? t(`profile.custom`) : configuration.submission.profiles[profileValue].description
      })),
    [configuration.submission.profiles, settings, t]
  );

  return (
    <form.Subscribe
      selector={state => [state.values.state.profile, state.values.state.loading, state.values.state.disabled]}
      children={([value, loading, disabled]) => (
        <div style={{ flex: 1 }}>
          <SelectInput
            id="submission profile name"
            label={t('profile.input.label')}
            // helperText={
            //   configuration.submission.profiles?.[profile as string]?.description || t('profile.custom_desc')
            // }
            value={value as string}
            loading={loading as boolean}
            disabled={disabled as boolean}
            options={options}
            onChange={(e, v) => form.setFieldValue('state.profile', v)}
          />
        </div>
      )}
    />
  );
});

export const SubmissionProfile = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { closeSnackbar, showErrorMessage, showSuccessMessage } = useMySnackbar();
  const { user: currentUser, configuration, settings } = useALContext();

  const form = useForm();

  const options = useMemo<{ value: string; primary: string; secondary: string }[]>(
    () =>
      getProfileNames(settings).map(profileValue => ({
        value: profileValue,
        primary:
          profileValue === 'default'
            ? t(`profile.custom`)
            : configuration.submission.profiles[profileValue].display_name,
        secondary:
          profileValue === 'default' ? t(`profile.custom`) : configuration.submission.profiles[profileValue].description
      })),
    [configuration.submission.profiles, settings, t]
  );

  return (
    <form.Subscribe
      selector={state => {
        return [state.values.state.loading, state.values.state.disabled];
      }}
      children={([loading, disabled]) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: theme.spacing(2)
          }}
        >
          <form.Subscribe
            selector={state => state.values.state.profile}
            children={value => (
              <div style={{ flex: 1 }}>
                <SelectInput
                  id="submission profile name"
                  label={t('profile.input.label')}
                  // helperText={
                  //   configuration.submission.profiles?.[profile as string]?.description || t('profile.custom_desc')
                  // }
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  options={options}
                  onChange={(e, v) => form.setFieldValue('state.profile', v)}
                />
              </div>
            )}
          />

          <Button
            color="secondary"
            variant="contained"
            tooltip={t('adjust.button.label')}
            tooltipProps={{ placement: 'bottom' }}
            startIcon={<TuneIcon />}
            sx={{ marginTop: '24.923px', height: '40.98px' }}
          >
            {t('adjust.button.label')}
          </Button>
        </div>
      )}
    />
  );
});

// type Props = {
//   loading?: boolean;
//   disabled?: boolean;
//   drawerOpen?: boolean;
//   setDrawerOpen?: React.Dispatch<boolean>;
// };

// const WrappedSubmissionProfile = ({
//   loading = false,
//   disabled = false,
//   drawerOpen = false,
//   setDrawerOpen = null
// }: Props) => {
//   const { t } = useTranslation(['submit']);
//   const theme = useTheme();
//   const { user, configuration, settings } = useALContext();

//   const form = useForm();

//   const handleChange = useCallback(
//     (profileKey: keyof Submission['profiles']) => {
//       form.setStore(s => {
//         // Update selected profile
//         s.state.profile = profileKey;

//         // Update settings with profile settings
//         Object.entries(s.settings.profiles[s.state.profile]).forEach(
//           ([k, v]) => (s.settings = { ...s.settings, [k]: 'value' in v ? v.value : v })
//         );

//         return s;
//       });
//     },
//     [form]
//   );

//   return (
//     <form.Subscribe
//       selector={state => [state.values.state.profile, getProfileNames(settings)]}
//       children={([profile, profileKeys]) => (
//         <Grid container>
//           <Grid item xs={11}>
//             <SelectInput
//               id={`submission profile name`}
//               labelProps={{ color: 'textPrimary', variant: 'h6', gutterBottom: true }}
//               value={profile as string}
//               options={(profileKeys as string[])
//                 .map(key => ({
//                   label: key === 'default' ? t('profile.custom') : configuration.submission.profiles[key]?.display_name,
//                   value: key
//                 }))
//                 .sort()}
//               loading={loading}
//               disabled={disabled}
//               displayEmpty={false}
//               onChange={(e, v) => handleChange(v)}
//             />
//           </Grid>
//           <Grid item xs={1} style={{ alignContent: 'center' }}>
//             <Tooltip title={t('options')}>
//               <IconButton
//                 onClick={() => setDrawerOpen(!drawerOpen)}
//                 disabled={!user.roles.includes('submission_create')}
//               >
//                 <TuneOutlinedIcon />
//               </IconButton>
//             </Tooltip>
//           </Grid>
//           <Grid item xs={12}>
//             <Typography
//               variant="caption"
//               fontStyle={'italic'}
//               color={theme.palette.mode == 'dark' ? theme.palette.primary.light : theme.palette.primary.dark}
//               alignItems="left"
//             >
//               {configuration.submission.profiles[profile as string]?.description || t('profile.custom_desc')}
//             </Typography>
//           </Grid>
//         </Grid>
//       )}
//     />
//   );
// };

// export const SubmissionProfile = React.memo(WrappedSubmissionProfile);
