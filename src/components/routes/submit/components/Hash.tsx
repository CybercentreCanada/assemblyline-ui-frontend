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
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { MetadataSummary } from 'components/routes/submit/components/MetadataSummary';
import type { SubmitStore } from 'components/routes/submit/contexts/form';
import { useForm } from 'components/routes/submit/contexts/form';
import { BooleanInput } from 'components/routes/submit/inputs/BooleanInput';
import { getSubmitType } from 'helpers/utils';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const HashSubmit = () => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const { closeSnackbar } = useMySnackbar();

  const form = useForm();

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
        <form.Subscribe
          selector={state => [state.values.submit.isFetchingSettings]}
          children={([fetching]) => (
            <>
              <form.Field
                name="hash"
                children={({ state, handleBlur }) =>
                  fetching ? (
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
                        onChange={event => {
                          closeSnackbar();
                          const [type, value] = getSubmitType(event.target.value, configuration);

                          form.setStore(s => {
                            s.hash.type = type;
                            s.hash.value = value;
                            s.hash.hasError = !type || (!configuration.ui.allow_url_submissions && type === 'url');

                            if (type === 'url' && s.hash.urlAutoSelect) {
                              s.hash.urlAutoSelect = false;
                              s.settings.services.forEach((category, i) => {
                                category.services.forEach((service, j) => {
                                  if (configuration.ui.url_submission_auto_service_selection.includes(service.name)) {
                                    s.settings.services[i].services[j].selected = true;
                                  }
                                });
                                s.settings.services[i].selected = s.settings.services[i].services.every(
                                  svr => svr.selected
                                );
                              });
                            } else if (type !== 'url') {
                              s.hash.urlAutoSelect = true;
                            }

                            return s;
                          });
                        }}
                      />
                      {!state.meta.errors ? null : (
                        <Typography variant="caption" color="error" children={state.meta.errors.join(', ')} />
                      )}
                    </div>
                  )
                }
              />

              <form.Subscribe
                selector={state => [
                  state.values.submit.isUploading,
                  state.values.hash.type,
                  state.values.hash.hasError
                ]}
                children={([isUploading, type, error]) =>
                  fetching ? (
                    <Skeleton style={{ height: '3rem', width: '5rem' }} />
                  ) : (
                    <Button
                      disabled={Boolean(isUploading || error)}
                      color="primary"
                      variant="contained"
                      onClick={async () => {
                        await form.handleSubmit();
                      }}
                      style={{ height: '40px' }}
                    >
                      {type ? `${t('urlHash.button')} ${type}` : t('urlHash.button')}
                      {isUploading && (
                        <CircularProgress
                          size={24}
                          style={{
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
            </>
          )}
        />
      </div>

      <form.Subscribe
        selector={state =>
          [
            state.values.hash.type === 'url',
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
                  name={`settings.services[${cat}].services[${svr}]`}
                  children={({ state, handleBlur }) => (
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
        selector={state => [state.values.settings, state.values.hash.type]}
        children={props => {
          const settings = props[0] as SubmitStore['settings'];
          const type = props[1] as SubmitStore['hash']['type'];
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
                      style={{
                        ...(settings && {
                          marginLeft: 0,
                          width: '100%',
                          '&:hover': {
                            background: theme.palette.action.hover
                          }
                        })
                      }}
                      label={<Typography variant="body2">{source}</Typography>}
                      control={
                        !settings ? (
                          <Skeleton
                            style={{
                              height: '2rem',
                              width: '1.5rem',
                              marginLeft: theme.spacing(2),
                              marginRight: theme.spacing(2)
                            }}
                          />
                        ) : (
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
                        )
                      }
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
