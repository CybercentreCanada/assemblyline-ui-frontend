import { useMediaQuery, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { ExternalSources } from './components/ExternalSources';
import { Interface } from './components/Interface';
import { Navigation } from './components/Navigation';
import { Services } from './components/Services';
import { Submission } from './components/Submission';
import { FormProvider, useForm } from './contexts/form';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    maxHeight: 'calc(100vh-64px)',
    overflowY: 'auto'
  },
  wrap: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center'
  },
  container: {
    maxWidth: theme.breakpoints.only('md') ? '800px' : theme.breakpoints.down('md') ? '100%' : '1024px',
    padding: theme.spacing(4),
    height: '2000px'
  },
  navigation: {
    position: 'sticky',
    top: '0px',
    overflowX: 'hidden',
    overflowY: 'scroll',
    scrollbarWidth: 'none'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(2)
  }
}));

const SettingsContent = () => {
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

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  useEffect(() => {
    form.setStore(s => {
      s.settings.service_spec.sort((a, b) => a.name.localeCompare(b.name));
      s.settings.services.sort((a, b) => a.name.localeCompare(b.name));
      return s;
    });
  }, [form]);

  console.log(form.state.values);

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <PageCenter margin={4} width="100%" textAlign="start">
          <div className={classes.content}>
            <Submission />
            <Interface />
            <ExternalSources />
            <Services />
          </div>
        </PageCenter>
      </div>

      <div className={classes.navigation}>
        <div style={{ height: '2000px' }}>
          <Navigation />
        </div>
      </div>
    </div>
  );
};

const WrappedSettingsPage = () => {
  const handleSubmit = useCallback(() => {}, []);

  return (
    <FormProvider onSubmit={handleSubmit}>
      <SettingsContent />
    </FormProvider>
  );
};

export const SettingsPage = React.memo(WrappedSettingsPage);
export default SettingsPage;
