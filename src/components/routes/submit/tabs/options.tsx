import { Grid, Skeleton, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { SubmissionProfileParams } from 'components/models/base/config';
import { SubmissionParameters } from 'components/routes/submit/components/SubmissionParameters';
import { useForm } from 'components/routes/submit/contexts/form';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { SubmissionMetadata } from '../components/SubmissionMetadata';

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

type ServiceTreeItemSkelProps = {
  size: 'medium' | 'small';
};

function ServiceTreeItemSkel({ size = 'medium' }: ServiceTreeItemSkelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', paddingBottom: '8px' }}>
      <Skeleton style={{ height: size === 'medium' ? '2.5rem' : '2rem', width: '1.5rem' }} />
      <Skeleton style={{ marginLeft: '1rem', height: size === 'medium' ? '2.5rem' : '2rem', width: '100%' }} />
    </div>
  );
}

type Props = {
  onValidateServiceSelection: (cbType: string) => void;
  onCancelUpload: () => void;
};

const WrappedSubmitOptions = ({ onValidateServiceSelection, onCancelUpload }: Props) => {
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
    <Grid container spacing={1}>
      <Grid item xs={12} md></Grid>
      <Grid item xs={12} md>
        <SubmissionParameters />
        <SubmissionMetadata />
      </Grid>
    </Grid>
  );
};

export const SubmitOptions = React.memo(WrappedSubmitOptions);
