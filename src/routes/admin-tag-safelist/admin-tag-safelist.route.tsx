import Editor, { DiffEditor, loader } from '@monaco-editor/react';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton, useTheme } from '@mui/material';
import { useAppTheme } from '@tui/core';
import { useAppBlocker } from 'core/router';
import { createAppRoute } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';
import { PageHeader } from 'ui/layouts/PageHeader';
import { PageFullSizeLayout } from 'ui/pages/PageFullSize';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

export const AdminTagSafelistPage = memo(() => {
  const { t, i18n } = useTranslation(['adminTagSafelist']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { isDark: isDarkTheme } = useAppTheme();
  const { showSuccessMessage } = useMySnackbar();

  const [tagSafelist, setTagSafelist] = useState<string>(null);
  const [originalTagSafelist, setOriginalTagSafelist] = useState<string>(null);
  const [open, setOpen] = useState<boolean>(false);

  const containerEL = useRef<HTMLDivElement>(null);
  const containerDialogEL = useRef<HTMLDivElement>(null);

  useAppBlocker(
    () => (tagSafelist !== originalTagSafelist ? 'unsaved_changes' : null),
    [tagSafelist, originalTagSafelist]
  );

  useEffect(() => {
    if (currentUser.is_admin) {
      reload(false);
    }
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  }, []);

  const reload = defValue => {
    apiCall<string>({
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

  return (
    <PageFullSizeLayout margin={4}>
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(4) } },
          actions: { spacing: 1 }
        }}
        actions={
          <>
            <Button variant="outlined" onClick={() => reload(true)}>
              {t('reset')}
            </Button>
            <Button
              variant="contained"
              disabled={tagSafelist === originalTagSafelist}
              onClick={() => setTagSafelist(originalTagSafelist)}
            >
              {t('undo')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={tagSafelist === originalTagSafelist}
              onClick={() => setOpen(true)}
            >
              {t('save')}
            </Button>
          </>
        }
      />

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
    </PageFullSizeLayout>
  );
});

export const AdminTagSafelistRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'adminmenu.tag_safelist'
  },
  icon: {
    primary: <VerifiedUserOutlinedIcon />
  },
  ancestor: '/admin',
  component: AdminTagSafelistPage,
  path: '/admin/tag_safelist',

  forbidden: s => !s.user.is_admin
});
