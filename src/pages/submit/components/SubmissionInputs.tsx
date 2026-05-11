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
import { useApiCallFn } from 'core/api';
import type { ApiResponse } from 'core/api/api.models';
import { useAppConfig } from 'core/config';
import { AppLink } from 'core/router';
import { useAppSnackbar } from 'core/snackbar';
import type { ApiResponseProps } from 'layout/auth/auth.models';
import type { SearchResult } from 'models/api/search';
import type { File as FileModel } from 'models/base/file';
import { getProfileNames } from 'pages/settings/settings.utils';
import { FileDropper } from 'pages/submit/components/FileDropper';
import type { SubmitStore } from 'pages/submit/submit.form';
import { FLOW, useForm } from 'pages/submit/submit.form';
import {
  calculateFileHash,
  getHashQuery,
  isUsingExternalServices,
  parseSubmitProfile,
  switchProfile,
  useAutoURLServicesSelection
} from 'pages/submit/submit.utils';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';
import { getSubmitType } from 'shared/utils/utils';
import type { ButtonProps } from 'ui/buttons/Button';
import { Button } from 'ui/buttons/Button';
import { IconButton } from 'ui/buttons/IconButton';
import { Classification } from 'ui/Classification';
import { CheckboxInput } from 'ui/inputs/CheckboxInput';
import type { SelectInputOption } from 'ui/inputs/models/inputs.model';
import { SelectInput } from 'ui/inputs/SelectInput';
import { SwitchInput } from 'ui/inputs/SwitchInput';
import { TextAreaInput } from 'ui/inputs/TextAreaInput';
import { TextInput } from 'ui/inputs/TextInput';

export const ClassificationInput = memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const c12nDef = useAppConfig(s => s.c12nDef);
  const form = useForm();

  return !c12nDef?.enforce ? null : (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.phase === 'loading',
          state.values.state.disabled,
          state.values.state.customize,
          state.values.state.phase === 'editing',
          state.values.settings?.classification?.value,
          state.values.settings?.classification?.restricted
        ] as const
      }
    >
      {([loading, disabled, customize, isEditing, value, restricted]) => (
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
          <Typography>{t('classification.input.label')}</Typography>
          <Classification
            format="long"
            type="picker"
            c12n={loading ? null : value}
            disabled={disabled || !isEditing || (!customize && restricted)}
            setClassification={v => form.setFieldValue('settings.classification.value', v)}
          />
        </div>
      )}
    </form.Subscribe>
  );
});
ClassificationInput.displayName = 'ClassificationInput';

export const FileInput = memo(() => {
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
FileInput.displayName = 'FileInput';

export const HashInput = memo(() => {
  const { t } = useTranslation(['submit']);
  const configuration = useAppConfig(s => s.configuration);
  const { closeSnackbar } = useAppSnackbar();
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
HashInput.displayName = 'HashInput';

export const SubmissionProfileInput = memo(() => {
  const { t } = useTranslation(['submit']);
  const user = useAppConfig(s => s.user);
  const configuration = useAppConfig(s => s.configuration);
  const settings = useAppConfig(s => s.settings);
  const form = useForm();

  const applyAutoURLServicesSelection = useAutoURLServicesSelection();

  const options = useMemo(
    () =>
      getProfileNames(settings).map(
        profileValue =>
          ({
            value: profileValue,
            primary:
              profileValue === 'default'
                ? t('profile.option.custom.label')
                : configuration?.submission?.profiles?.[profileValue]?.display_name,
            secondary:
              profileValue === 'default'
                ? t('profile.option.custom.summary')
                : configuration?.submission?.profiles?.[profileValue]?.summary,
            ...(profileValue !== 'default' &&
              configuration?.submission?.profiles?.[profileValue]?.description && {
                helpLink: `/settings/${profileValue}`
              })
          }) satisfies SelectInputOption
      ),
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
SubmissionProfileInput.displayName = 'SubmissionProfileInput';

export const RawInput = memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  const hashRequestId = useRef<number>(0);

  const handleRawChange = useCallback(
    (event: unknown, value: string) => {
      const requestId = ++hashRequestId.current;

      if (!value) {
        form.setFieldValue('raw.hash', null);
        form.setFieldValue('raw.value', null);
      } else {
        const encoder = new TextEncoder();
        const tempFile = new File([encoder.encode(value)], 'file.txt', { type: 'text/plain;charset=utf-8' });

        form.setFieldValue('raw.value', value);
        calculateFileHash(tempFile)
          .then(hash => {
            if (requestId !== hashRequestId.current) return;
            if (form.getFieldValue('raw.value') !== value) return;
            form.setFieldValue('raw.hash', hash);
          })
          // eslint-disable-next-line no-console
          .catch(console.error);
      }
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
          state.values.raw.value
        ] as const
      }
    >
      {([loading, disabled, isEditing, value]) => (
        <TextAreaInput
          id="raw-textarea"
          label={t('raw.input.label')}
          tooltip={t('raw.input.tooltip')}
          placeholder={t('raw.input.placeholder')}
          value={value ?? ''}
          maxRows={13}
          minRows={6}
          loading={loading}
          disabled={disabled || !isEditing}
          onChange={handleRawChange}
          tiny
          monospace
        />
      )}
    </form.Subscribe>
  );
});
RawInput.displayName = 'RawInput';

export const MaliciousInput = memo(() => {
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
          tooltip={t('malicious.switch.tooltip')}
          value={value}
          loading={loading}
          disabled={disabled || !isEditing}
          preventRender={!isFile}
          onChange={(_, v) => form.setFieldValue('settings.malicious.value', v)}
          slotProps={{ formLabel: { color: 'textPrimary' } }}
        />
      )}
    </form.Subscribe>
  );
});
MaliciousInput.displayName = 'MaliciousInput';

export const ExternalSources = memo(() => {
  const { t } = useTranslation(['submit']);
  const configuration = useAppConfig(s => s.configuration);
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
                    value={value}
                    loading={loading}
                    disabled={disabled || !isEditing}
                    onChange={() => {
                      form.setFieldValue('settings.default_external_sources.value', s => {
                        s.indexOf(source) >= 0 ? s.splice(s.indexOf(source), 1) : s.push(source);
                        return s;
                      });
                    }}
                    slotProps={{ formLabel: { color: 'textPrimary' } }}
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
ExternalSources.displayName = 'ExternalSources';

export const ExternalServices = memo(() => {
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
                    slotProps={{ formLabel: { color: 'textPrimary', textTransform: 'capitalize' } }}
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
ExternalServices.displayName = 'ExternalServices';

export const CustomizabilityAlert = memo(() => {
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
CustomizabilityAlert.displayName = 'CustomizabilityAlert';

export const CancelButton = memo(() => {
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
          !state.values.hash.type,
          !(state.values.raw.value && state.values.raw.value.length > 0)
        ] as const
      }
    >
      {([loading, disabled, tab, file, hash, raw]) => (
        <Button
          tooltip={t('cancel.button.tooltip')}
          tooltipProps={{ placement: 'bottom' }}
          color="primary"
          loading={loading}
          disabled={disabled || (tab === 'file' ? file : tab === 'hash' ? hash : tab === 'raw' ? raw : false)}
          variant="outlined"
          onClick={() => {
            form.setFieldValue('file', null);
            form.setFieldValue('hash.type', null);
            form.setFieldValue('hash.value', '');
            form.setFieldValue('raw.hash', null);
            form.setFieldValue('raw.value', null);
            form.setFieldValue('state.phase', 'editing');
            form.setFieldValue('state.progress', null);
            form.setFieldValue('state.uuid', generateRandomUUID());
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
CancelButton.displayName = 'CancelButton';

export const FindButton = memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const form = useForm();
  const apiCall = useApiCallFn();

  const [results, setResults] = useState<SearchResult<FileModel> | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [query, setQuery] = useState<string | null>(null);
  const [prevQuery, setPrevQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (query === prevQuery) return;
    setPrevQuery(query);

    apiCall({
      method: 'POST',
      url: '/api/v4/search/file/',
      body: { query, offset: 0, rows: 1 },
      onSuccess: (api_data: ApiResponse<SearchResult<FileModel>>) => {
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
                  component={AppLink}
                  autoFocus
                  to={{ path: '/file/detail/:id', params: { id: results?.items?.[0]?.sha256 ?? '' } }}
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
FindButton.displayName = 'FindButton';

export const AdjustButton = memo(() => {
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
AdjustButton.displayName = 'AdjustButton';

const AnalyzeButton = memo(({ children, ...props }: ButtonProps) => {
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
          !(state.values.raw.value && state.values.raw.value.length > 0),
          state.values.state.progress
        ] as const
      }
    >
      {([phase, disabled, tab, file, hash, noRaw, progress]) => (
        <Button
          disabled={disabled || (tab === 'file' ? file : tab === 'hash' ? hash : tab === 'raw' ? noRaw : false)}
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
AnalyzeButton.displayName = 'AnalyzeButton';

export const FileSubmit = memo(({ onClick = () => null, ...props }: ButtonProps) => {
  const { t } = useTranslation(['submit']);
  const form = useForm();
  const navigate = useNavigate();
  const apiCall = useApiCallFn();
  const { closeSnackbar, showErrorMessage, showSuccessMessage } = useAppSnackbar();
  const settings = useAppConfig(s => s.settings);

  const warnOnUnload = useCallback((warn: boolean) => {
    window.onbeforeunload = warn ? () => true : null;
  }, []);

  const handleCancel = useCallback(() => {
    form.setFieldValue('state.phase', 'editing');
    form.setFieldValue('state.progress', null);
    form.setFieldValue('state.uuid', generateRandomUUID());

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
          const data = JSON.parse(api_data) as ApiResponseProps<unknown>;
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
        apiCall({
          url: `/api/v4/ui/start/${uuid}/`,
          method: 'POST',
          body: {
            ui_params: parseSubmitProfile(params),
            submission_profile: profile,
            filename: file.path,
            metadata: metadata.data
          },
          onSuccess: ({ api_response }: ApiResponse<{ started: boolean; sid: string }>) => {
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
FileSubmit.displayName = 'FileSubmit';

const RawSubmit = memo(({ onClick = () => null, ...props }: ButtonProps) => {
  const { t } = useTranslation(['submit']);
  const form = useForm();
  const navigate = useNavigate();
  const apiCall = useApiCallFn();
  const { closeSnackbar, showErrorMessage, showSuccessMessage } = useAppSnackbar();

  const handleSubmit = useCallback(
    () => {
      closeSnackbar();

      const raw = form.getFieldValue('raw.value');
      const params = form.getFieldValue('settings');
      const metadata = form.getFieldValue('metadata');
      const profile = form.getFieldValue('state.profile');

      apiCall({
        url: '/api/v4/submit/',
        method: 'POST',
        body: {
          ui_params: parseSubmitProfile(params),
          submission_profile: profile,
          plaintext: raw,
          name: 'raw.txt',
          metadata: metadata.data
        },
        onEnter: () => {
          form.setFieldValue('state.phase', 'uploading');
          form.setFieldValue('autoURLServiceSelection.open', false);
        },
        onSuccess: ({ api_response }: ApiResponse<{ started: boolean; sid: string }>) => {
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
RawSubmit.displayName = 'RawSubmit';

const HashSubmit = memo(({ onClick = () => null, ...props }: ButtonProps) => {
  const { t } = useTranslation(['submit']);
  const form = useForm();
  const navigate = useNavigate();
  const apiCall = useApiCallFn();
  const { closeSnackbar, showErrorMessage, showSuccessMessage } = useAppSnackbar();

  const handleSubmit = useCallback(
    () => {
      closeSnackbar();

      const hash = form.getFieldValue('hash');
      const params = form.getFieldValue('settings');
      const metadata = form.getFieldValue('metadata');
      const profile = form.getFieldValue('state.profile');

      apiCall({
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
        onSuccess: ({ api_response }: ApiResponse<{ started: boolean; sid: string }>) => {
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
HashSubmit.displayName = 'HashSubmit';

const ExternalServicesDialog = memo(() => {
  const { t } = useTranslation(['submit']);
  const configuration = useAppConfig(s => s.configuration);
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
            state.values.state.tab === 'raw' && !!state.values.raw.value && state.values.raw.value.length > 0,
            state.values.autoURLServiceSelection.open
          ] as const
        }
      >
        {([isFile, isHash, isRaw, confirmation]) => (
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
              ) : isRaw ? (
                <>
                  <RawSubmit color="secondary" variant="text" onClick={() => handleDeselectExternalServices()}>
                    {t('external_services.dialog.action.deselect')}
                  </RawSubmit>
                  <RawSubmit variant="text">{t('external_services.dialog.action.continue')}</RawSubmit>
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
ExternalServicesDialog.displayName = 'ExternalServicesDialog';

export const AnalyzeSubmission = memo(() => {
  const configuration = useAppConfig(s => s.configuration);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.tab === 'file' && !!state.values.file,
          state.values.state.tab === 'hash' && !!state.values.hash.type,
          state.values.state.tab === 'raw' && !!state.values.raw.value && state.values.raw.value.length > 0,
          state.values.state.phase === 'loading' ? false : isUsingExternalServices(state.values.settings, configuration)
        ] as const
      }
    >
      {([isFile, isHash, isRaw, isExternal]) =>
        isExternal ? (
          <ExternalServicesDialog />
        ) : isFile ? (
          <FileSubmit />
        ) : isHash ? (
          <HashSubmit />
        ) : isRaw ? (
          <RawSubmit />
        ) : (
          <AnalyzeButton disabled />
        )
      }
    </form.Subscribe>
  );
});
AnalyzeSubmission.displayName = 'AnalyzeSubmission';

export const ToS = memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const configuration = useAppConfig(s => s.configuration);

  return !configuration.ui.tos ? null : (
    <div style={{ textAlign: 'center' }}>
      <Typography variant="body2">
        {t('tos.terms1')}
        <i>{t('submit.button.editing.label')}</i>
        {t('tos.terms2')}
        {/* TODO: /tos route typing - route exists but may not be in AppRoute union */}
        <AppLink style={{ textDecoration: 'none', color: theme.palette.primary.main }} to={{ path: '/tos' } as never}>
          {t('tos.terms3')}
        </AppLink>
        .
      </Typography>
    </div>
  );
});
ToS.displayName = 'ToS';
