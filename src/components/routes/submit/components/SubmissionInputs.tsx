import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Alert,
  CircularProgress,
  ListItemText,
  Button as MuiButton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useALContext from 'components/hooks/useALContext';
import type { APIResponseProps } from 'components/hooks/useMyAPI';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { File } from 'components/models/base/file';
import type { Submission } from 'components/models/base/submission';
import type { SearchResult } from 'components/models/ui/search';
import { getProfileNames } from 'components/routes/settings/settings.utils';
import FileDropper from 'components/routes/submit/components/FileDropper';
import type { SubmitStore } from 'components/routes/submit/submit.form';
import { FLOW, useForm } from 'components/routes/submit/submit.form';
import {
  calculateFileHash,
  getHashQuery,
  isUsingExternalServices,
  parseSubmitProfile,
  switchProfile,
  useAutoURLServicesSelection
} from 'components/routes/submit/submit.utils';
import type { ButtonProps } from 'components/visual/Buttons/Button';
import { Button } from 'components/visual/Buttons/Button';
import { IconButton } from 'components/visual/Buttons/IconButton';
import Classification from 'components/visual/Classification';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { getSubmitType } from 'helpers/utils';
import generateUUID from 'helpers/uuid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

export const ClassificationInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const form = useForm();

  if (!c12nDef?.enforce) return null;

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.customize,
          state.values.state.phase === 'editing',
          state.values.settings?.classification?.value
        ] as const
      }
    >
      {([loading, disabled, customize, isEditing, value]) => (
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
          <Typography>{t('classification.input.label')}</Typography>
          <Classification
            format="long"
            type="picker"
            c12n={loading ? null : value}
            disabled={disabled || !isEditing || !customize}
            setClassification={v => form.setFieldValue('settings.classification.value', v)}
          />
        </div>
      )}
    </form.Subscribe>
  );
});

export const FileInput = React.memo(() => {
  const form = useForm();

  const handleFileChange = useCallback(
    (file: SubmitStore['file']) => {
      form.setFieldValue('file', file);
      calculateFileHash(file)
        .then(hash =>
          form.setFieldValue('file', f => {
            f.hash = hash;
            return f;
          })
        )
        // eslint-disable-next-line no-console
        .catch(console.error);
    },
    [form]
  );

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.phase === 'editing',
          state.values.file
        ] as const
      }
    >
      {([loading, disabled, isEditing, file]) => (
        <FileDropper file={file} setFile={handleFileChange} disabled={loading || disabled || !isEditing} />
      )}
    </form.Subscribe>
  );
});

export const HashInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration } = useALContext();
  const { closeSnackbar } = useMySnackbar();
  const form = useForm();

  const applyAutoURLServicesSelection = useAutoURLServicesSelection();

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.phase === 'editing',
          state.values.hash.type,
          state.values.hash.value
        ] as const
      }
    >
      {([loading, disabled, isEditing, type, value]) => (
        <TextInput
          id="HashInput"
          label={configuration.ui.allow_url_submissions ? t('url.input.label') : t('hash.input.label')}
          tooltip={configuration.ui.allow_url_submissions ? t('url.input.tooltip') : t('hash.input.tooltip')}
          helperText={configuration.ui.allow_url_submissions ? t('url.input.helperText') : ''}
          value={value}
          loading={loading}
          disabled={disabled || !isEditing}
          onChange={(_, v) => {
            closeSnackbar();
            const [nextType, nextValue] = getSubmitType(v, configuration);
            form.setFieldValue('hash.type', nextType);
            form.setFieldValue('hash.value', nextValue);
            applyAutoURLServicesSelection();
          }}
          endAdornment={
            <Typography
              color={type ? 'primary' : 'disabled'}
              fontFamily="Consolas, Courier New, monospace"
              textTransform="uppercase"
            >
              {type}
            </Typography>
          }
        />
      )}
    </form.Subscribe>
  );
});

export const SubmissionProfileInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { user, configuration, settings } = useALContext();
  const form = useForm();

  const applyAutoURLServicesSelection = useAutoURLServicesSelection();

  const options = useMemo(
    () =>
      getProfileNames(settings).map(profileValue => ({
        value: profileValue,
        primary:
          profileValue === 'default'
            ? t('profile.option.custom.label')
            : configuration.submission.profiles[profileValue].display_name,
        secondary:
          profileValue === 'default'
            ? t('profile.option.custom.description')
            : configuration.submission.profiles[profileValue].description
      })),
    [configuration.submission.profiles, settings, t]
  );

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.phase === 'editing',
          state.values.state.profile
        ] as const
      }
    >
      {([loading, disabled, isEditing, value]) => (
        <SelectInput
          id="submission-profile"
          label={t('profile.input.label')}
          tooltip={t('profile.input.tooltip')}
          value={value}
          loading={loading}
          disabled={disabled || !isEditing}
          options={options}
          onChange={(_, profile) => {
            const prevProfile = form.store.state.values.state.profile;
            if (prevProfile === profile) return;
            form.setFieldValue('state.profile', profile);
            form.setFieldValue('settings', s => switchProfile(s, configuration, settings, user, profile));
            applyAutoURLServicesSelection();
          }}
        />
      )}
    </form.Subscribe>
  );
});

export const MaliciousInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.tab === 'file' && !!state.values.file,
          state.values.settings.malicious.value,
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.phase === 'editing'
        ] as const
      }
    >
      {([isFile, value, loading, disabled, isEditing]) => (
        <SwitchInput
          label={t('malicious.switch.label')}
          labelProps={{ color: 'textPrimary' }}
          tooltip={t('malicious.switch.tooltip')}
          value={value}
          loading={loading}
          disabled={disabled || !isEditing}
          preventRender={!isFile}
          onChange={(_, v) => form.setFieldValue('settings.malicious.value', v)}
        />
      )}
    </form.Subscribe>
  );
});

export const ExternalSources = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.tab === 'hash',
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.phase === 'editing',
          state.values.hash.type
        ] as const
      }
      children={([isHash, loading, disabled, isEditing, hashType]) => {
        const sources = configuration.submission.file_sources?.[hashType]?.sources || [];

        return !isHash || sources.length === 0 ? null : (
          <div style={{ textAlign: 'left' }}>
            <Typography color="textSecondary" variant="body2">
              {t('options.submission.default_external_sources.label')}
            </Typography>
            {sources.map((source: string, i) => (
              <form.Subscribe
                key={`${source}-${i}`}
                selector={state => state.values.settings.default_external_sources.value.indexOf(source) !== -1}
                children={value => (
                  <CheckboxInput
                    key={i}
                    id={`source-${source.replace('_', ' ')}`}
                    label={source.replace('_', ' ')}
                    labelProps={{ color: 'textPrimary' }}
                    value={value}
                    loading={loading}
                    disabled={disabled || !isEditing}
                    onChange={() => {
                      form.setFieldValue('settings.default_external_sources.value', s => {
                        s.indexOf(source) >= 0 ? s.splice(s.indexOf(source), 1) : s.push(source);
                        return s;
                      });
                    }}
                  />
                )}
              />
            ))}
          </div>
        );
      }}
    />
  );
});

export const ExternalServices = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.phase === 'editing',
          state.values.state.customize,
          state.values.autoURLServiceSelection.prev
        ] as const
      }
    >
      {([loading, disabled, isEditing, customize, autoURLServiceSelection]) =>
        (autoURLServiceSelection ?? []).length === 0 ? null : (
          <div style={{ textAlign: 'left' }}>
            <Typography color="textSecondary" variant="body2">
              {t('options.submission.url_submission_auto_service_selection.label')}
            </Typography>
            {(autoURLServiceSelection ?? []).map(([cat, svr], i) => (
              <form.Subscribe
                key={i}
                selector={state => {
                  const service = state.values.settings.services[cat].services[svr];
                  return [service.name, service.selected, service.restricted] as const;
                }}
              >
                {([name, selected, restricted]) => (
                  <CheckboxInput
                    id={`url_submission_auto_service_selection-${name.replace('_', ' ')}`}
                    label={name.replace('_', ' ')}
                    labelProps={{ textTransform: 'capitalize', color: 'textPrimary' }}
                    value={selected}
                    loading={loading}
                    disabled={disabled || !isEditing || (!customize && restricted)}
                    onChange={() => {
                      form.setFieldValue('settings', s => {
                        s.services[cat].services[svr].selected = !selected;
                        s.services[cat].selected = s.services[cat].services.every(val => val.selected);
                        return s;
                      });
                    }}
                  />
                )}
              </form.Subscribe>
            ))}
          </div>
        )
      }
    </form.Subscribe>
  );
});

export const CustomizabilityAlert = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe selector={state => [state.values.state.customize] as const}>
      {([customize]) => (
        <Tooltip
          placement="bottom-start"
          title={customize ? t('customize.full.tooltip') : t('customize.limited.tooltip')}
          slotProps={{ tooltip: { sx: { backgroundColor: 'rgba(97, 97, 97, 1)' } } }}
        >
          <div>
            <Alert
              severity={customize ? 'info' : 'warning'}
              sx={{ paddingTop: theme.spacing(0.25), paddingBottom: theme.spacing(0.25) }}
            >
              {customize ? t('customize.full.label') : t('customize.limited.label')}
            </Alert>
          </div>
        </Tooltip>
      )}
    </form.Subscribe>
  );
});

export const CancelButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.tab,
          !state.values.file,
          !state.values.hash.type
        ] as const
      }
    >
      {([loading, disabled, tab, file, hash]) => (
        <Button
          tooltip={t('cancel.button.tooltip')}
          tooltipProps={{ placement: 'bottom' }}
          color="primary"
          loading={loading}
          disabled={disabled || (tab === 'file' ? file : tab === 'hash' ? hash : false)}
          variant="outlined"
          onClick={() => {
            form.setFieldValue('file', null);
            form.setFieldValue('hash.type', null);
            form.setFieldValue('hash.value', '');
            form.setFieldValue('state.phase', 'editing');
            form.setFieldValue('state.progress', null);
            form.setFieldValue('state.uuid', generateUUID());
            FLOW.cancel();
            FLOW.off('complete');
            FLOW.off('fileError');
            FLOW.off('progress');
          }}
        >
          {t('cancel.button.label')}
        </Button>
      )}
    </form.Subscribe>
  );
});

export const FindButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const form = useForm();
  const { apiCall } = useMyAPI();

  const [results, setResults] = useState<SearchResult<File> | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [query, setQuery] = useState<string | null>(null);
  const [prevQuery, setPrevQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (query === prevQuery) return;
    setPrevQuery(query);

    apiCall<SearchResult<File>>({
      method: 'POST',
      url: '/api/v4/search/file/',
      body: { query, offset: 0, rows: 1 },
      onSuccess: api_data => {
        setResults(api_data.api_response);
      },
      onFailure: () => setResults(null),
      onEnter: () => setFetching(true),
      onExit: () => setFetching(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prevQuery, query]);

  return (
    <>
      <form.Subscribe
        selector={state =>
          [state.values.state.tab, state.values.file, state.values.hash.type, state.values.hash.value] as const
        }
      >
        {([tab, file, hashType, hashValue]) =>
          (tab === 'file' && !file) || (tab === 'hash' && !hashType) ? null : (
            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle>
                <ListItemText
                  primary={
                    <>
                      {`${t('find.button.title')} `}
                      {tab === 'file' ? (
                        t('find.file.label')
                      ) : (
                        <span style={{ textTransform: 'uppercase' }}>{hashType}</span>
                      )}
                    </>
                  }
                  secondary={tab === 'file' ? file.hash : hashValue}
                  primaryTypographyProps={{ variant: 'h6' }}
                />
              </DialogTitle>
              <DialogContent>
                {fetching ? (
                  <Alert
                    variant="outlined"
                    icon={<CircularProgress style={{ height: 22, width: 22 }} />}
                    sx={{ color: theme.palette.text.secondary, border: `1px solid ${theme.palette.text.secondary}` }}
                  >
                    {t('find.searching.title')}
                  </Alert>
                ) : results?.total && results.total > 0 ? (
                  <Alert
                    variant="outlined"
                    severity="success"
                    sx={{ backgroundColor: `${theme.palette.success.main}10` }}
                  >
                    {t('find.found.title')}
                  </Alert>
                ) : (
                  <Alert variant="outlined" severity="error" sx={{ backgroundColor: `${theme.palette.error.main}10` }}>
                    {t('find.not_found.title')}
                  </Alert>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>{t('find.close.title')}</Button>
                <MuiButton
                  component={Link}
                  autoFocus
                  to={`/file/detail/${results?.items?.[0]?.sha256 ?? ''}`}
                  disabled={fetching || !results?.items?.[0]?.sha256}
                  onClick={() => setOpen(false)}
                >
                  {t('find.link.title')}
                </MuiButton>
              </DialogActions>
            </Dialog>
          )
        }
      </form.Subscribe>

      <form.Subscribe
        selector={state =>
          [
            state.values.state.phase === 'loading',
            state.values.state.disabled,
            state.values.state.tab,
            state.values.file,
            state.values.hash.type,
            state.values.hash.value
          ] as const
        }
      >
        {([loading, disabled, tab, file, hashType, hashValue]) => (
          <IconButton
            disabled={disabled || (tab === 'file' ? !file : tab === 'hash' ? !hashType : false)}
            loading={loading}
            tooltip={t('find.button.tooltip')}
            tooltipProps={{ placement: 'bottom' }}
            onClick={() => {
              setOpen(true);
              if (tab === 'file') setQuery(getHashQuery('file', file.hash));
              else if (tab === 'hash')
                setQuery(getHashQuery(hashType as SubmitStore['hash']['type'] | 'file', hashValue));
            }}
          >
            <SearchIcon />
          </IconButton>
        )}
      </form.Subscribe>
    </>
  );
});

export const AdjustButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  return (
    <form.Subscribe selector={state => [state.values.state.adjust, state.values.state.phase === 'loading'] as const}>
      {([adjust, loading]) => (
        <IconButton
          tooltip={adjust ? t('adjust.button.close.tooltip') : t('adjust.button.open.tooltip')}
          tooltipProps={{ placement: 'bottom' }}
          loading={loading}
          onClick={() => form.setFieldValue('state.adjust', s => !s)}
        >
          <TuneIcon />
        </IconButton>
      )}
    </form.Subscribe>
  );
});

const AnalyzeButton = React.memo(({ children, ...props }: ButtonProps) => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.phase,
          state.values.state.disabled,
          state.values.state.tab,
          !state.values.file,
          !state.values.hash.type,
          state.values.state.progress
        ] as const
      }
    >
      {([phase, disabled, tab, file, hash, progress]) => (
        <Button
          disabled={disabled || (tab === 'file' ? file : tab === 'hash' ? hash : false)}
          loading={phase === 'loading'}
          progress={phase !== 'editing'}
          tooltip={t('submit.button.tooltip')}
          tooltipProps={{ placement: 'bottom' }}
          variant="contained"
          {...props}
        >
          {children ??
            (phase === 'redirecting'
              ? t('submit.button.redirecting.label')
              : phase === 'uploading'
                ? progress
                  ? `${progress}% ${t('submit.button.uploadProgress.label')}`
                  : t('submit.button.uploading.label')
                : phase === 'editing'
                  ? t('submit.button.editing.label')
                  : phase === 'loading'
                    ? t('submit.button.loading.label')
                    : null)}
        </Button>
      )}
    </form.Subscribe>
  );
});

export const FileSubmit = React.memo(({ onClick = () => null, ...props }: ButtonProps) => {
  const { t } = useTranslation(['submit']);
  const form = useForm();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { closeSnackbar, showErrorMessage, showSuccessMessage } = useMySnackbar();
  const { settings } = useALContext();

  const warnOnUnload = useCallback((warn: boolean) => {
    window.onbeforeunload = warn ? () => true : null;
  }, []);

  const handleCancel = useCallback(() => {
    form.setFieldValue('state.phase', 'editing');
    form.setFieldValue('state.progress', null);
    form.setFieldValue('state.uuid', generateUUID());

    FLOW.cancel();
    FLOW.off('complete');
    FLOW.off('fileError');
    FLOW.off('progress');
  }, [form]);

  const handleSubmit = useCallback(
    () => {
      closeSnackbar();
      const file = form.getFieldValue('file');
      const size = form.getFieldValue('file.size');
      const uuid = form.getFieldValue('state.uuid');
      const params = form.getFieldValue('settings');
      const metadata = form.getFieldValue('metadata');
      const profile = form.getFieldValue('state.profile');

      form.setFieldValue('state.phase', 'uploading');
      form.setFieldValue('state.progress', 0);
      form.setFieldValue('autoURLServiceSelection.open', false);

      FLOW.opts.generateUniqueIdentifier = selectedFile => {
        const relativePath =
          selectedFile?.relativePath ??
          selectedFile?.file?.webkitRelativePath ??
          selectedFile?.file?.name ??
          selectedFile?.name;
        return `${uuid}_${size}_${relativePath.replace(/[^0-9a-zA-Z_-]/gim, '')}`;
      };

      warnOnUnload(true);

      FLOW.on('fileError', (_, api_data) => {
        try {
          const data = JSON.parse(api_data) as APIResponseProps<unknown>;
          if ('api_status_code' in data) {
            if (
              data.api_status_code === 401 ||
              (data.api_status_code === 503 &&
                data.api_error_message.includes('quota') &&
                data.api_error_message.includes('daily') &&
                data.api_error_message.includes('API'))
            ) {
              window.location.reload();
            } else handleCancel();
            showErrorMessage(t('upload.snackbar.file.upload_fail'));
          }
        } catch {
          handleCancel();
          showErrorMessage(t('upload.snackbar.file.upload_fail'));
        }
      });

      FLOW.on('progress', () => {
        form.setFieldValue('state.progress', Math.trunc(FLOW.progress() * 100));
      });

      FLOW.on('complete', () => {
        warnOnUnload(false);
        if (!FLOW.files.length || FLOW.files.some(f => f.error)) return;
        apiCall<{ started: boolean; sid: string }>({
          url: `/api/v4/ui/start/${uuid}/`,
          method: 'POST',
          body: {
            ui_params: parseSubmitProfile(params),
            submission_profile: profile,
            filename: file.path,
            metadata: metadata.data
          },
          onSuccess: ({ api_response }) => {
            showSuccessMessage(`${t('upload.snackbar.success')} ${api_response.sid}`);
            form.setFieldValue('state.phase', 'redirecting');
            setTimeout(() => navigate(`/submission/detail/${api_response.sid}`), 1000);
          },
          onFailure: ({ api_status_code, api_error_message }) => {
            if ([400, 403, 404, 503].includes(api_status_code)) showErrorMessage(api_error_message);
            else showErrorMessage(t('upload.snackbar.file.failure'));
            handleCancel();
          }
        });
      });

      FLOW.addFile(file);
      FLOW.upload();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, handleCancel, navigate, settings, showErrorMessage, showSuccessMessage, t]
  );

  return (
    <AnalyzeButton
      {...props}
      onClick={e => {
        onClick(e);
        handleSubmit();
      }}
    />
  );
});

const HashSubmit = React.memo(({ onClick = () => null, ...props }: ButtonProps) => {
  const { t } = useTranslation(['submit']);
  const form = useForm();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { closeSnackbar, showErrorMessage, showSuccessMessage } = useMySnackbar();

  const handleSubmit = useCallback(
    () => {
      closeSnackbar();

      const hash = form.getFieldValue('hash');
      const params = form.getFieldValue('settings');
      const metadata = form.getFieldValue('metadata');
      const profile = form.getFieldValue('state.profile');

      apiCall<Submission>({
        url: '/api/v4/submit/',
        method: 'POST',
        body: {
          ui_params: parseSubmitProfile(params),
          submission_profile: profile,
          [hash.type]: hash.value,
          metadata: metadata.data
        },
        onEnter: () => {
          form.setFieldValue('state.phase', 'uploading');
          form.setFieldValue('autoURLServiceSelection.open', false);
        },
        onSuccess: ({ api_response }) => {
          showSuccessMessage(`${t('upload.snackbar.success')} ${api_response.sid}`);
          form.setFieldValue('state.phase', 'redirecting');
          setTimeout(() => navigate(`/submission/detail/${api_response.sid}`), 1000);
        },
        onFailure: ({ api_error_message }) => {
          showErrorMessage(api_error_message);
          form.setFieldValue('state.phase', 'editing');
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, navigate, showErrorMessage, showSuccessMessage, t]
  );

  return (
    <AnalyzeButton
      {...props}
      onClick={e => {
        onClick(e);
        handleSubmit();
      }}
    />
  );
});

const ExternalServicesDialog = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration } = useALContext();
  const form = useForm();

  const handleDeselectExternalServices = useCallback(() => {
    form.setFieldValue('settings.services', categories => {
      categories.forEach((category, i) => {
        category.services.forEach((service, j) => {
          if (configuration.ui.url_submission_auto_service_selection.includes(service.name)) {
            categories[i].services[j].selected = false;
          }
        });
        categories[i].selected = category.services.every(s => s.selected);
      });

      return categories;
    });
  }, [configuration.ui.url_submission_auto_service_selection, form]);

  return (
    <>
      <form.Subscribe
        selector={state =>
          [
            state.values.state.tab === 'file' && !!state.values.file,
            state.values.state.tab === 'hash' && !!state.values.hash.type,
            state.values.autoURLServiceSelection.open
          ] as const
        }
      >
        {([isFile, isHash, confirmation]) => (
          <Dialog
            aria-labelledby={t('external_services.dialog.title')}
            aria-describedby={t('external_services.dialog.content')}
            fullWidth
            open={confirmation}
            onClose={() => form.setFieldValue('autoURLServiceSelection.open', false)}
          >
            <DialogTitle id={t('external_services.dialog.title')}>{t('external_services.dialog.title')}</DialogTitle>
            <DialogContent>
              <Typography color="textSecondary">{t('external_services.dialog.content')}</Typography>
            </DialogContent>
            <DialogActions sx={{ paddingTop: 0 }}>
              {isFile ? (
                <>
                  <FileSubmit color="secondary" variant="text" onClick={() => handleDeselectExternalServices()}>
                    {t('external_services.dialog.action.deselect')}
                  </FileSubmit>
                  <FileSubmit variant="text">{t('external_services.dialog.action.continue')}</FileSubmit>
                </>
              ) : isHash ? (
                <>
                  <HashSubmit color="secondary" variant="text" onClick={() => handleDeselectExternalServices()}>
                    {t('external_services.dialog.action.deselect')}
                  </HashSubmit>
                  <HashSubmit variant="text">{t('external_services.dialog.action.continue')}</HashSubmit>
                </>
              ) : null}
            </DialogActions>
          </Dialog>
        )}
      </form.Subscribe>
      <AnalyzeButton onClick={() => form.setFieldValue('autoURLServiceSelection.open', true)} />
    </>
  );
});

export const AnalyzeSubmission = React.memo(() => {
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.tab === 'file' && !!state.values.file,
          state.values.state.tab === 'hash' && !!state.values.hash.type,
          state.values.state.phase === 'loading' ? false : isUsingExternalServices(state.values.settings, configuration)
        ] as const
      }
    >
      {([isFile, isHash, isExternal]) =>
        isExternal ? (
          <ExternalServicesDialog />
        ) : isFile ? (
          <FileSubmit />
        ) : isHash ? (
          <HashSubmit />
        ) : (
          <AnalyzeButton disabled />
        )
      }
    </form.Subscribe>
  );
});

export const ToS = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();

  if (!configuration.ui.tos) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <Typography variant="body2">
        {t('tos.terms1')}
        <i>{t('submit.button.editing.label')}</i>
        {t('tos.terms2')}
        <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
          {t('tos.terms3')}
        </Link>
        .
      </Typography>
    </div>
  );
});
