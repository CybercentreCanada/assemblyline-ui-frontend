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

const magicDef = {
  defaultToken: '',
  digits: /\d+(_+\d+)*/,
  octaldigits: /[0-7]{1,3}/,
  hexdigits: /[0-9a-fA-F]+/,
  keywords: [],
  tokenizer: {
    root: [
      { include: '@offset' },
      { include: '@operators' },
      { include: '@strings' },
      { include: '@whitespace' },
      { include: '@numbers' },
      { include: '@tags' }
    ],
    offset: [[/^[>&\d]*[&+()\d\w.\-*]+/, 'keyword']],
    operators: [[/\s+([=!<>&^?]|\\x)/, 'number.hex']],
    whitespace: [
      [/^\s*#([ =|].*)?$/, 'comment'],
      [/\s+/, 'white']
    ],
    numbers: [
      [/0[xX]@hexdigits/, 'number'],
      [/\\@octaldigits/, 'number'],
      [/(@digits)/, 'number']
    ],
    strings: [
      [
        /\s+((be|le)?(short|long|quad|float|double|date|qdate|ldate|qldate|qwdate|id3|string16)|byte|string|pstring|melong|medate|meldate|indirect|name|use|regex|search|default|clear)(?=[^\w]|$)/,
        'string'
      ]
    ],
    tags: [[/custom: [\w/]+/, 'attribute.name']]
  }
};

// This config defines the editor's behavior.
const magicConfig = {
  comments: {
    lineComment: '#'
  },
  brackets: []
};

function WrappedLibMagic({ reload, magicFile, originalMagicFile, setMagicFile }) {
  const { t, i18n } = useTranslation(['adminIdentify']);
  const theme = useTheme();
  const containerEL = useRef<HTMLDivElement>();
  const containerDialogEL = useRef<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const { isDark } = useAppTheme();

  useEffectOnce(() => {
    if (!magicFile) reload();
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
      url: '/api/v4/system/identify/magic/',
      body: tagData,
      onSuccess: api_data => {
        reload();
        showSuccessMessage(t('save.success.magic'));
      }
    });
  };

  const onMount = editor => {
    editor.focus();
  };

  const beforeMount = monaco => {
    if (!monaco.languages.getLanguages().some(({ id }) => id === 'magic')) {
      // Register a new language
      monaco.languages.register({ id: 'magic' });
      // Register a tokens provider for the language
      monaco.languages.setMonarchTokensProvider('magic', magicDef);
      // Set the editing configuration for the language
      monaco.languages.setLanguageConfiguration('magic', magicConfig);
    }
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
                    language="magic"
                    theme={isDark ? 'vs-dark' : 'vs'}
                    original={originalMagicFile}
                    width={width}
                    height="50vh"
                    loading={t('loading.magic')}
                    modified={magicFile}
                    beforeMount={beforeMount}
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
          <Button onClick={() => saveChanges(magicFile)} color="primary">
            {t('save.acceptText')}
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container justifyContent="flex-end" spacing={1} style={{ marginBottom: theme.spacing(1) }}>
        <Grid item style={{ flexGrow: 1 }}>
          <div>
            <Typography variant="h5">{t('title.magic')}</Typography>
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
                onClick={() => setMagicFile(originalMagicFile)}
                disabled={magicFile === originalMagicFile}
              >
                {t('undo')}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                size="small"
                color="primary"
                disabled={magicFile === originalMagicFile}
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
                {magicFile !== null ? (
                  <>
                    <Editor
                      language="magic"
                      width={width}
                      height={height}
                      theme={isDark ? 'vs-dark' : 'vs'}
                      loading={t('loading.magic')}
                      value={magicFile}
                      onChange={setMagicFile}
                      beforeMount={beforeMount}
                      onMount={onMount}
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

const LibMagic = React.memo(WrappedLibMagic);
export default LibMagic;
