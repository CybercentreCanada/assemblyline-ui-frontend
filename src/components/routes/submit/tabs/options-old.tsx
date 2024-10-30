import {
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  Slider,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ServiceTree from 'components/layout/serviceTree';
import { SubmissionProfileParams } from 'components/models/base/config';
import MetadataInputField from 'components/visual/MetadataInputField';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { ServiceAccordion } from '../components/ServiceAccordion';
import { useForm } from '../contexts/form';

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

type Props = {
  onValidateServiceSelection: (cbType: string) => void;
  onCancelUpload: () => void;
};

const WrappedSubmitOptionsOld = ({ onValidateServiceSelection, onCancelUpload }: Props) => {
  const { t, i18n } = useTranslation(['submit']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const banner = useAppBanner();
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const { showErrorMessage, showSuccessMessage, closeSnackbar } = useMySnackbar();

  const form = useForm();

  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  const handleProfileChange = useCallback(
    submission_profile => {
      form.setStore(s => {
        const profile = configuration.submission.profiles[submission_profile];
        if (!profile) {
          return;
        }
        const newServices = s.settings.services;
        const newServiceSpec = s.settings.service_spec;
        const enabledServices = [];

        // Disable all services
        for (const cat of newServices) {
          cat.selected = false;
          for (const srv of cat.services) {
            srv.selected = false;
          }
        }
        for (const srv of newServiceSpec) {
          // Reset service parameters to their defaults
          for (const param of srv.params) {
            param.value = param.default;
          }
        }

        // Assign default values in case profile doesn't specify
        profile.services.selected = profile.services.selected || [];
        profile.services.excluded = profile.services.excluded || [];
        profile.service_spec = profile.service_spec || [];
        profile.editable_params = profile.editable_params || {};

        // Enable all services that part of the profile, ensure all others are disabled
        for (const cat of newServices) {
          if (profile.services.selected.indexOf(cat.name) > -1) {
            // Category selected, enable all services that are part of the category
            cat.selected = true;
            for (const srv of cat.services) {
              // Enable all services except those in the exclusion list
              if (profile.services.excluded.indexOf(srv.name) === -1) {
                srv.selected = true;
                enabledServices.push(srv.name);
              }
            }
          } else if (profile.services.excluded.indexOf(cat.name) > -1) {
            // Category excluded, disabled all services that are part of the category
            cat.selected = false;
            for (const srv of cat.services) {
              // Disable all services except those in the selected list
              if (profile.services.selected.indexOf(srv.name) === -1) {
                srv.selected = false;
              }
            }
          }
        }

        // Set parameters of enabled service based on profile
        for (const srv of newServiceSpec) {
          if (enabledServices.indexOf(srv.name) > -1 && profile.service_spec[srv.name]) {
            for (const param of srv.params) {
              if (param.name in profile.service_spec[srv.name]) {
                // Set parameter value based on profile configuration
                param.value = profile.service_spec[srv.name][param.name];
              }
            }
          }
        }

        const profileParams: Record<string, SubmissionProfileParams> = {};
        // for (const [k, v] of Object.entries(profile)) {
        //   // Assign the other parameters of the profile that don't pertain to service settings
        //   if (!k.startsWith('service')) {
        //     profileParams[k] = v;
        //   }
        // }

        // setSettings({ ...settings, services: newServices, ...profileParams, submission_profile });

        return { ...s, services: newServices, ...profileParams, submissionProfile: profile };
      });
    },
    [configuration.submission.profiles, form]
  );

  return (
    <>
      <form.Field
        field={store => store.submissionProfile.toPath()}
        children={({ state, handleBlur, handleChange }) =>
          !configuration.submission.profiles ? null : (
            <div style={{ textAlign: 'left', marginTop: sp2, paddingLeft: sp2 }}>
              <Typography variant="h6" gutterBottom>
                {t('options.submission.profile_name')}
              </Typography>
              <div style={{ paddingBottom: sp1 }}>
                {!form.state.values.settings ? (
                  <Skeleton style={{ height: '3rem' }} />
                ) : (
                  <Select
                    children={Object.keys(configuration.submission.profiles).map((profile_name, i) => (
                      <MenuItem key={i} value={profile_name}>
                        {profile_name}
                      </MenuItem>
                    ))}
                    size="small"
                    fullWidth
                    onChange={event => handleProfileChange(event.target.value)}
                  />
                )}
              </div>
            </div>
          )
        }
      />

      <Grid container spacing={1}>
        <Grid item xs={12} md>
          <div style={{ paddingLeft: sp2, textAlign: 'left', marginTop: sp2 }}>
            <Typography variant="h6" gutterBottom>
              {t('options.service')}
            </Typography>

            <ServiceAccordion />
          </div>

          <div style={{ paddingLeft: sp2, textAlign: 'left', marginTop: sp2 }}>
            <Typography variant="h6" gutterBottom>
              {t('options.service')}
            </Typography>

            <form.Field
              field={store => store.settings.toPath()}
              children={({ state, handleBlur, handleChange }) => (
                <ServiceTree
                  size="small"
                  settings={state.value}
                  setSettings={value => handleChange(value)}
                  setParam={(service_idx, param_idx, p_value) => {
                    if (!state.value) return;
                    const newSettings = { ...state.value };
                    const type = newSettings.service_spec[service_idx].params[param_idx].type;
                    newSettings.service_spec[service_idx].params[param_idx].value =
                      type === 'int' ? parseInt(p_value) : p_value;
                    handleChange(newSettings);
                  }}
                  submissionProfile={
                    !currentUser.roles.includes('submission_customize') ? form.state.values.submissionProfile : null
                  }
                />
              )}
            />
          </div>
        </Grid>
        <Grid item xs={12} md>
          <div style={{ textAlign: 'left', marginTop: sp2 }}>
            <Typography variant="h6" gutterBottom>
              {t('options.submission')}
            </Typography>
            <div style={{ paddingTop: sp1, paddingBottom: sp1 }}>
              <Typography variant="caption" color="textSecondary" gutterBottom>
                {t('options.submission.desc')}
              </Typography>

              <form.Field
                field={store => store.settings.description.toPath()}
                children={({ state, handleBlur, handleChange }) =>
                  !form.state.values.settings ? (
                    <Skeleton style={{ height: '3rem' }} />
                  ) : (
                    <TextField
                      id="desc"
                      size="small"
                      type="text"
                      defaultValue={state.value}
                      onBlur={handleBlur}
                      onChange={event => handleChange(event.target.value)}
                      InputLabelProps={{
                        shrink: true
                      }}
                      variant="outlined"
                      fullWidth
                    />
                  )
                }
              />
            </div>

            <div style={{ paddingTop: sp1, paddingBottom: sp1 }}>
              <Typography variant="caption" color="textSecondary" gutterBottom>
                {t('options.submission.priority')}
              </Typography>

              <form.Field
                field={store => store.settings.priority.toPath()}
                children={({ state, handleBlur, handleChange }) =>
                  !form.state.values.settings ? (
                    <Skeleton style={{ height: '3rem' }} />
                  ) : (
                    <div style={{ marginLeft: '20px', marginRight: '20px' }}>
                      <Slider
                        value={state.value}
                        valueLabelDisplay={'auto'}
                        size="small"
                        min={500}
                        max={1500}
                        marks={[
                          { label: t('options.submission.priority.low'), value: 500 },
                          { label: t('options.submission.priority.medium'), value: 1000 },
                          { label: t('options.submission.priority.high'), value: 1500 }
                        ]}
                        step={null}
                        onBlur={handleBlur}
                        onChange={(_, value) => handleChange(value)}
                        disabled={
                          !currentUser.roles.includes('submission_customize') &&
                          form.state.values.submissionProfile?.priority !== undefined
                        }
                      />
                    </div>
                  )
                }
              />
            </div>

            <div style={{ paddingTop: sp1, paddingBottom: sp1 }}>
              <form.Field
                field={store => store.settings.generate_alert.toPath()}
                children={({ state, handleBlur, handleChange }) => (
                  <FormControlLabel
                    className={form.state.values.settings ? classes.item : null}
                    label={<Typography variant="body2">{t('options.submission.generate_alert')}</Typography>}
                    control={
                      !form.state.values.settings ? (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      ) : (
                        <Checkbox
                          name="label"
                          size="small"
                          checked={state.value}
                          disabled={
                            !currentUser.roles.includes('submission_customize') &&
                            form.state.values.submissionProfile?.generate_alert !== undefined
                          }
                          onBlur={handleBlur}
                          onChange={event => handleChange(event.target.checked)}
                        />
                      )
                    }
                  />
                )}
              />

              <form.Field
                field={store => store.settings.ignore_filtering.toPath()}
                children={({ state, handleBlur, handleChange }) => (
                  <FormControlLabel
                    className={form.state.values.settings ? classes.item : null}
                    label={<Typography variant="body2">{t('options.submission.ignore_filtering')}</Typography>}
                    control={
                      !form.state.values.settings ? (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      ) : (
                        <Checkbox
                          name="label"
                          size="small"
                          checked={state.value}
                          disabled={
                            !currentUser.roles.includes('submission_customize') &&
                            form.state.values.submissionProfile?.ignore_filtering !== undefined
                          }
                          onBlur={handleBlur}
                          onChange={event => handleChange(event.target.checked)}
                        />
                      )
                    }
                  />
                )}
              />

              <form.Field
                field={store => store.settings.ignore_cache.toPath()}
                children={({ state, handleBlur, handleChange }) => (
                  <FormControlLabel
                    className={form.state.values.settings ? classes.item : null}
                    label={<Typography variant="body2">{t('options.submission.ignore_cache')}</Typography>}
                    control={
                      !form.state.values.settings ? (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      ) : (
                        <Checkbox
                          name="label"
                          size="small"
                          checked={state.value}
                          disabled={
                            !currentUser.roles.includes('submission_customize') &&
                            form.state.values.submissionProfile?.ignore_cache !== undefined
                          }
                          onBlur={handleBlur}
                          onChange={event => handleChange(event.target.checked)}
                        />
                      )
                    }
                  />
                )}
              />

              <form.Field
                field={store => store.settings.ignore_dynamic_recursion_prevention.toPath()}
                children={({ state, handleBlur, handleChange }) => (
                  <FormControlLabel
                    className={form.state.values.settings ? classes.item : null}
                    label={
                      <Typography variant="body2">
                        {t('options.submission.ignore_dynamic_recursion_prevention')}
                      </Typography>
                    }
                    control={
                      !form.state.values.settings ? (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      ) : (
                        <Checkbox
                          name="label"
                          size="small"
                          checked={state.value}
                          disabled={
                            !currentUser.roles.includes('submission_customize') &&
                            form.state.values.submissionProfile?.ignore_dynamic_recursion_prevention !== undefined
                          }
                          onBlur={handleBlur}
                          onChange={event => handleChange(event.target.checked)}
                        />
                      )
                    }
                  />
                )}
              />

              <form.Field
                field={store => store.settings.deep_scan.toPath()}
                children={({ state, handleBlur, handleChange }) => (
                  <FormControlLabel
                    className={form.state.values.settings ? classes.item : null}
                    label={<Typography variant="body2">{t('options.submission.deep_scan')}</Typography>}
                    control={
                      !form.state.values.settings ? (
                        <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
                      ) : (
                        <Checkbox
                          name="label"
                          size="small"
                          checked={state.value}
                          disabled={
                            !currentUser.roles.includes('submission_customize') &&
                            form.state.values.submissionProfile?.deep_scan !== undefined
                          }
                          onBlur={handleBlur}
                          onChange={event => handleChange(event.target.checked)}
                        />
                      )
                    }
                  />
                )}
              />
            </div>

            <div style={{ paddingTop: sp1, paddingBottom: sp1 }}>
              <Typography variant="caption" color="textSecondary" gutterBottom>
                {`${t('options.submission.ttl')} (${
                  configuration.submission.max_dtl !== 0
                    ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                    : t('options.submission.ttl.forever')
                })`}
              </Typography>

              <form.Field
                field={store => store.settings.ttl.toPath()}
                children={({ state, handleBlur, handleChange }) =>
                  !form.state.values.settings ? (
                    <Skeleton style={{ height: '3rem' }} />
                  ) : (
                    <TextField
                      id="ttl"
                      type="number"
                      margin="dense"
                      size="small"
                      inputProps={{
                        min: configuration.submission.max_dtl !== 0 ? 1 : 0,
                        max: configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365
                      }}
                      defaultValue={form.state.values.submissionProfile?.ttl}
                      value={state.value}
                      onChange={event => handleChange(event.target.value)}
                      variant="outlined"
                      fullWidth
                      disabled={
                        !currentUser.roles.includes('submission_customize') &&
                        form.state.values.submissionProfile?.ttl !== undefined
                      }
                    />
                  )
                }
              />
            </div>

            {configuration.submission.metadata &&
              configuration.submission.metadata.submit &&
              Object.keys(configuration.submission.metadata.submit).length !== 0 && (
                <>
                  <Typography variant="h6" gutterBottom style={{ paddingTop: theme.spacing(2) }}>
                    {t('options.submission.metadata')}
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(configuration.submission.metadata.submit).map(([field_name, field_cfg], i) => (
                      <form.Field
                        key={i}
                        // field={store => store.submissionMetadata[field_name].toPath()}
                        field={() => `$.submissionMetadata.${field_name}`}
                        children={({ state, handleBlur, handleChange }) => (
                          <MetadataInputField
                            key={field_name}
                            name={field_name}
                            configuration={field_cfg}
                            value={state.value}
                            onChange={v => {
                              form.setStore(s => {
                                const cleanMetadata = s.submissionMetadata;
                                if (v === undefined || v === null || v === '') {
                                  // Remove field from metadata if value is null
                                  delete cleanMetadata[field_name];
                                } else {
                                  // Otherwise add/overwrite value
                                  cleanMetadata[field_name] = v;
                                }

                                return { ...s, submissionMetadata: { ...cleanMetadata } };
                              });
                            }}
                            onReset={() => {
                              form.setStore(s => {
                                const cleanMetadata = s.submissionMetadata;
                                delete cleanMetadata[field_name];
                                return { ...s, submissionMetadata: { ...cleanMetadata } };
                              });
                            }}
                          />
                        )}
                      />
                    ))}
                  </Stack>
                </>
              )}
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export const SubmitOptionsOld = React.memo(WrappedSubmitOptionsOld);
