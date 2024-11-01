import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { MetadataSummary } from 'components/routes/submit/components/MetadataSummary';
import { SubmitStore, useForm } from 'components/routes/submit/contexts/form';
import { BooleanInput } from 'components/routes/submit/inputs/BooleanInput';
import { getSubmitType } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

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
  onSubmit: () => void;
};

const WrappedHashSubmit = ({ onSubmit = () => null }: Props) => {
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

  const handleSubmit = useCallback(() => {
    const showValidate = form.state.values.settings.services.some(cat =>
      cat.services.some(svr => svr.selected && svr.is_external)
    );

    if (showValidate) {
      form.setStore(s => ({ ...s, confirmation: { open: true, type: 'urlHash' } }));
    } else {
      onSubmit();
    }
  }, [form, onSubmit]);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: theme.spacing(2),
          alignItems: 'flex-start',
          gap: theme.spacing(2)
        }}
      >
        <form.Field
          name="input"
          children={({ state, handleBlur, handleChange }) =>
            !form.state.values.settings ? (
              <Skeleton style={{ flexGrow: 1, height: '3rem' }} />
            ) : (
              <div style={{ flex: 1, textAlign: 'start' }}>
                <TextField
                  label={`${t('urlHash.input_title')}${t('urlHash.input_suffix')}`}
                  size="small"
                  type="stringInput"
                  variant="outlined"
                  fullWidth
                  value={state.value.value}
                  style={{ flexGrow: 1, marginRight: '1rem' }}
                  onBlur={handleBlur}
                  onChange={event =>
                    handleChange(prev => {
                      closeSnackbar();
                      const [type, value] = getSubmitType(event.target.value, configuration);
                      return {
                        ...prev,
                        type,
                        value,
                        hasError: !type || (!configuration.ui.allow_url_submissions && type === 'url')
                      };
                    })
                  }
                />
                {!state.meta.errors ? null : (
                  <Typography variant="caption" color="error" children={state.meta.errors.join(', ')} />
                )}
              </div>
            )
          }
        />

        <form.Subscribe
          selector={state => [state.values.upload.disable, state.values.input.type, state.values.input.hasError]}
          children={([uploading, type, error]) =>
            !form.state.values.settings ? (
              <Skeleton style={{ height: '3rem', width: '5rem' }} />
            ) : (
              <Button
                disabled={Boolean(uploading || error)}
                color="primary"
                variant="contained"
                onClick={() => handleSubmit()}
                style={{ height: '40px' }}
              >
                {type ? `${t('urlHash.button')} ${type}` : t('urlHash.button')}
                {uploading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: -12,
                      marginLeft: -12
                    }}
                  />
                )}
              </Button>
            )
          }
        />
      </div>

      <form.Subscribe
        selector={state =>
          [
            state.values.input.type === 'url',
            state.values?.settings?.services.reduce((prev: [number, number][], category, i) => {
              category.services.forEach((service, j) => {
                if (configuration?.ui?.url_submission_auto_service_selection?.includes(service.name)) prev.push([i, j]);
              });
              return prev;
            }, [])
          ] as [boolean, [number, number][]]
        }
        children={([isURL, services]) =>
          !isURL || !services?.length ? null : (
            <div style={{ textAlign: 'start', marginTop: theme.spacing(1) }}>
              <Typography variant="subtitle1">
                {t('options.submission.url_submission_auto_service_selection')}
              </Typography>
              {services.map(([cat, svr], i) => (
                <form.Field
                  key={i}
                  name={`settings.services[${cat}].services[${svr}]` as any}
                  children={({ state, handleBlur, handleChange }) => (
                    <BooleanInput
                      label={state.value.name}
                      value={state.value.selected}
                      onClick={() =>
                        form.setStore(s => {
                          s.settings.services[cat].services[svr].selected = !state.value.selected;
                          s.settings.services[cat].selected = s.settings.services[cat].services.every(
                            val => val.selected
                          );
                          return s;
                        })
                      }
                      onBlur={handleBlur}
                    />
                  )}
                />
              ))}
            </div>
          )
        }
      />

      <form.Subscribe
        selector={state => [state.values.settings, state.values.input.type]}
        children={props => {
          const settings = props[0] as SubmitStore['settings'];
          const type = props[1] as SubmitStore['input']['type'];
          const fileSources = configuration.submission.file_sources;

          return (
            type &&
            fileSources[type] &&
            fileSources[type].sources &&
            fileSources[type].sources.length > 0 && (
              <div style={{ textAlign: 'start', marginTop: theme.spacing(1) }}>
                <Typography variant="subtitle1">{t('options.submission.default_external_sources')}</Typography>
                {fileSources[type].sources.map((source, i) => (
                  <div key={i}>
                    <FormControlLabel
                      control={
                        settings ? (
                          <Checkbox
                            size="small"
                            checked={settings.default_external_sources.indexOf(source) !== -1}
                            name="label"
                            onChange={() => {
                              if (!settings) return;
                              form.setStore(s => {
                                const newSources = settings.default_external_sources;
                                if (newSources.indexOf(source) === -1) {
                                  newSources.push(source);
                                } else {
                                  newSources.splice(newSources.indexOf(source), 1);
                                }
                                return { ...s, default_external_sources: newSources };
                              });
                            }}
                          />
                        ) : (
                          <Skeleton
                            style={{
                              height: '2rem',
                              width: '1.5rem',
                              marginLeft: theme.spacing(2),
                              marginRight: theme.spacing(2)
                            }}
                          />
                        )
                      }
                      label={<Typography variant="body2">{source}</Typography>}
                      className={settings ? classes.item : null}
                    />
                  </div>
                ))}
              </div>
            )
          );
        }}
      />

      <MetadataSummary />

      {!configuration.ui.tos ? null : (
        <div style={{ marginTop: theme.spacing(4), textAlign: 'center' }}>
          <Typography variant="body2">
            {t('terms1')}
            <i>{t('urlHash.button')}</i>
            {t('terms2')}
            <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
              {t('terms3')}
            </Link>
            .
          </Typography>
        </div>
      )}
    </>
  );
};

export const HashSubmit = React.memo(WrappedHashSubmit);
