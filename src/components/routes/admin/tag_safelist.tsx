import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  useTheme
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Editor, { DiffEditor, loader } from '@monaco-editor/react';
import useAppContext from 'commons/components/hooks/useAppContext';
import useUser from 'commons/components/hooks/useAppUser';
import PageFullSize from 'commons/components/layout/pages/PageFullSize';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';
import { Redirect } from 'react-router-dom';

loader.config({ paths: { vs: '/cdn/monaco/' } });

export default function AdminTagSafelist() {
  const { t, i18n } = useTranslation(['adminTagSafelist']);
  const theme = useTheme();
  const containerEL = useRef<HTMLDivElement>();
  const containerDialogEL = useRef<HTMLDivElement>();
  const [tagSafelist, setTagSafelist] = useState(null);
  const [originalTagSafelist, setOriginalTagSafelist] = useState(null);
  const [open, setOpen] = useState(false);
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useUser<CustomUser>();
  const { isDarkTheme } = useAppContext();

  useEffect(() => {
    reload(false);
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reload = defValue => {
    apiCall({
      method: 'GET',
      url: `/api/v4/system/tag_safelist/${defValue ? '?default' : ''}`,
      onSuccess: api_data => {
        setTagSafelist(api_data.api_response);
        if (!defValue) setOriginalTagSafelist(api_data.api_response);
        if (defValue && api_data.api_response !== originalTagSafelist) setOpen(true);
      }
    });
  };

  const saveChanges = tagData => {
    setOpen(false);
    apiCall({
      method: 'PUT',
      url: '/api/v4/system/tag_safelist/',
      body: tagData,
      onSuccess: api_data => {
        reload(false);
        showSuccessMessage(t('save.success'));
      }
    });
  };

  const onMount = editor => {
    editor.focus();
  };

  return currentUser.is_admin ? (
    <PageFullSize margin={4}>
      <div style={{ marginBottom: theme.spacing(4), textAlign: 'left' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item style={{ flexGrow: 1 }}>
            <div>
              <Typography variant="h4">{t('title')}</Typography>
            </div>
          </Grid>
          <Grid item>
            <Grid container spacing={2}>
              <Grid item>
                <Button variant="outlined" onClick={() => reload(true)}>
                  {t('reset')}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => setTagSafelist(originalTagSafelist)}
                  disabled={tagSafelist === originalTagSafelist}
                >
                  {t('undo')}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={tagSafelist === originalTagSafelist}
                  onClick={() => setOpen(true)}
                >
                  {t('save')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="dialog-title" fullWidth maxWidth="md">
        <DialogTitle id="dialog-title">{t('save.title')}</DialogTitle>
        <DialogContent>
          <div style={{ border: `1px solid ${theme.palette.divider}` }}>
            <ReactResizeDetector handleWidth targetRef={containerDialogEL}>
              {({ width }) => (
                <div ref={containerDialogEL}>
                  <DiffEditor
                    language="yaml"
                    theme={isDarkTheme ? 'vs-dark' : 'vs'}
                    original={originalTagSafelist}
                    width={width}
                    height="50vh"
                    loading={t('loading')}
                    modified={tagSafelist}
                    options={{ renderSideBySide: false, readOnly: true }}
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
          <Button onClick={() => saveChanges(tagSafelist)} color="primary">
            {t('save.acceptText')}
          </Button>
        </DialogActions>
      </Dialog>
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
                {tagSafelist !== null ? (
                  <>
                    <Editor
                      language="yaml"
                      width={width}
                      height={height}
                      theme={isDarkTheme ? 'vs-dark' : 'vs'}
                      loading={t('loading')}
                      value={tagSafelist}
                      onChange={setTagSafelist}
                      onMount={onMount}
                    />
                  </>
                ) : (
                  <Skeleton width={width} height={height} variant="rect" animation="wave" />
                )}
              </div>
            )}
          </ReactResizeDetector>
        </div>
      </div>
    </PageFullSize>
  ) : (
    <Redirect to="/forbidden" />
  );
}
