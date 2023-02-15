import Editor, { DiffEditor, loader } from '@monaco-editor/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';

loader.config({ paths: { vs: '/vs' } });

function WrappedMimes({ reload, mimesFile, originalMimesFile, setMimesFile }) {
  const { t, i18n } = useTranslation(['adminIdentify']);
  const theme = useTheme();
  const containerEL = useRef<HTMLDivElement>();
  const containerDialogEL = useRef<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const { isDark: isDarkTheme } = useAppTheme();

  useEffectOnce(() => {
    if (!mimesFile) reload();
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

  const saveChanges = tagData => {
    setOpen(false);
    apiCall({
      method: 'PUT',
      url: '/api/v4/system/identify/mimes/',
      body: tagData,
      onSuccess: api_data => {
        reload();
        showSuccessMessage(t('save.success.mimes'));
      }
    });
  };

  const onMount = editor => {
    editor.focus();
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="dialog-title" fullWidth maxWidth="md">
        <DialogTitle id="dialog-title">{t('save.title')}</DialogTitle>
        <DialogContent>
          <div style={{ border: `1px solid ${theme.palette.divider}` }}>
            <ReactResizeDetector handleWidth targetRef={containerDialogEL}>
              {({ width }) => (
                <div ref={containerDialogEL}>
                  <DiffEditor
                    language="mimes"
                    theme={isDarkTheme ? 'vs-dark' : 'vs'}
                    original={originalMimesFile}
                    width={width}
                    height="50vh"
                    loading={t('loading.mimes')}
                    modified={mimesFile}
                    options={{ links: false, renderSideBySide: false, readOnly: true }}
                  />
                </div>
              )}
            </ReactResizeDetector>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            {t('save.cancelText')}
          </Button>
          <Button onClick={() => saveChanges(mimesFile)} color="primary">
            {t('save.acceptText')}
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container justifyContent="flex-end" spacing={1} style={{ marginBottom: theme.spacing(1) }}>
        <Grid item style={{ flexGrow: 1 }}>
          <div>
            <Typography variant="h5">{t('title.mimes')}</Typography>
          </div>
        </Grid>
        <Grid item>
          <Grid container spacing={1}>
            <Grid item>
              <Button size="small" variant="outlined" onClick={() => reload(true, setOpen)}>
                {t('reset')}
              </Button>
            </Grid>
            <Grid item>
              <Button
                size="small"
                variant="contained"
                onClick={() => setMimesFile(originalMimesFile)}
                disabled={mimesFile === originalMimesFile}
              >
                {t('undo')}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                size="small"
                color="primary"
                disabled={mimesFile === originalMimesFile}
                onClick={() => setOpen(true)}
              >
                {t('save')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <div
        ref={containerEL}
        style={{
          flexGrow: 1,
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }}
        >
          <ReactResizeDetector handleHeight handleWidth targetRef={containerEL}>
            {({ width, height }) => (
              <div ref={containerEL}>
                {mimesFile !== null ? (
                  <>
                    <Editor
                      language="yaml"
                      width={width}
                      height={height}
                      theme={isDarkTheme ? 'vs-dark' : 'vs'}
                      loading={t('loading.mimes')}
                      value={mimesFile}
                      onChange={setMimesFile}
                      onMount={onMount}
                      options={{ links: false }}
                    />
                  </>
                ) : (
                  <Skeleton width={width} height={height} variant="rectangular" animation="wave" />
                )}
              </div>
            )}
          </ReactResizeDetector>
        </div>
      </div>
    </>
  );
}

const Mimes = React.memo(WrappedMimes);
export default Mimes;
