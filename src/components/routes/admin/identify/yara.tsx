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
import useAppContext from 'commons_deprecated/components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';

loader.config({ paths: { vs: '/cdn/monaco_0.34.1' } });

const yaraDef = {
  defaultToken: '',
  digits: /\d+(_+\d+)*/,
  octaldigits: /[0-7]+(_+[0-7]+)*/,
  binarydigits: /[0-1]+(_+[0-1]+)*/,
  hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
  keywords: [
    'all',
    'and',
    'any',
    'ascii',
    'at',
    'base64',
    'base64wide',
    'condition',
    'contains',
    'endswith',
    'entrypoint',
    'false',
    'filesize',
    'for',
    'fullword',
    'global',
    'import',
    'icontains',
    'iendswith',
    'iequals',
    'in',
    'include',
    'int16',
    'int16be',
    'int32',
    'int32be',
    'int8',
    'int8be',
    'istartswith',
    'matches',
    'meta',
    'nocase',
    'none',
    'not',
    'of',
    'or',
    'private',
    'rule',
    'startswith',
    'strings',
    'them',
    'true',
    'uint16',
    'uint16be',
    'uint32',
    'uint32be',
    'uint8',
    'uint8be',
    'wide',
    'xor',
    'defined'
  ],
  typeKeywords: [
    'any',
    'of',
    'them',
    'contains',
    'icontains',
    'startswith',
    'istartswith',
    'endswith',
    'iendswith',
    'iequals',
    'matches',
    'and',
    'or'
  ],
  common: [
    [
      /[a-z_$][\w$]*/,
      {
        cases: {
          '@typeKeywords': 'keyword',
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }
    ],
    { include: '@whitespace' },
    { include: '@brackets' },
    { include: '@numbers' },
    { include: '@strings' },
    { include: '@tags' }
  ],
  escapes: /(\\[nrt\\"]|x\d{2})/,

  operators: [
    '.',
    '-',
    '~',
    '*',
    '\\',
    '%',
    '+',
    '-',
    '>>',
    '<<',
    '&',
    '^',
    '|',
    '<',
    '<=',
    '>',
    '>=',
    '==',
    '!=',
    '='
  ],
  // The main tokenizer for our languages
  tokenizer: {
    root: [[/[{}]/, 'delimiter.bracket'], { include: 'common' }],

    common: [
      // to show class names nicely
      [/\$[\w_]*/, 'attribute.name'],
      // identifiers and keywords
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            '@typeKeywords': 'keyword',
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }
      ],

      // whitespace
      { include: '@whitespace' },

      // regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
      [/(\/(?:[^\\/]|\\.)+\/)(i|is|si|i)?[ \t\n\r$]*/, 'annotation'],

      // delimiters and operators
      [/[()[\]]/, '@brackets'],

      // numbers
      [/(@digits)[eE]([-+]?(@digits))?/, 'number.float'],
      [/(@digits)\.(@digits)([eE][-+]?(@digits))?/, 'number.float'],
      [/0[xX](@hexdigits)/, 'number.hex'],
      [/0[oO]?(@octaldigits)/, 'number.octal'],
      [/0[bB](@binarydigits)/, 'number.binary'],
      [/(@digits)/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"/, 'string', '@string_double']
    ],

    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment']
    ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[/*]/, 'comment']
    ],

    string_double: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/"/, 'string', '@pop']
    ],

    bracketCounting: [
      [/\{/, 'delimiter.bracket', '@bracketCounting'],
      [/\}/, 'delimiter.bracket', '@pop'],
      { include: 'common' }
    ]
  }
};

// This config defines the editor's behavior.
const yaraConfig = {
  comments: {
    // symbol used for single line comment. Remove this entry if your language does not support line comments
    lineComment: '//',
    // symbols used for start and end a block comment. Remove this entry if your language does not support block comments
    blockComment: ['/*', '*/']
  },
  // symbols used as brackets
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['"', '"'],
    ['/', '/']
  ],
  // symbols that that can be used to surround a selection
  surroundingPairs: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['"', '"'],
    ['/', '/']
  ]
};

function WrappedYara({ reload, yaraFile, originalYaraFile, setYaraFile }) {
  const { t, i18n } = useTranslation(['adminIdentify']);
  const theme = useTheme();
  const containerEL = useRef<HTMLDivElement>();
  const containerDialogEL = useRef<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const { isDarkTheme } = useAppContext();

  useEffect(() => {
    if (!yaraFile) reload();
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveChanges = tagData => {
    setOpen(false);
    apiCall({
      method: 'PUT',
      url: '/api/v4/system/identify/yara/',
      body: tagData,
      onSuccess: api_data => {
        reload();
        showSuccessMessage(t('save.success.yara'));
      }
    });
  };

  const beforeMount = monaco => {
    if (!monaco.languages.getLanguages().some(({ id }) => id === 'yara')) {
      // Register a new language
      monaco.languages.register({ id: 'yara' });
      // Register a tokens provider for the language
      monaco.languages.setMonarchTokensProvider('yara', yaraDef);
      // Set the editing configuration for the language
      monaco.languages.setLanguageConfiguration('yara', yaraConfig);
    }
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
                    language="yara"
                    theme={isDarkTheme ? 'vs-dark' : 'vs'}
                    original={originalYaraFile}
                    width={width}
                    height="50vh"
                    loading={t('loading.yara')}
                    modified={yaraFile}
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
          <Button onClick={() => saveChanges(yaraFile)} color="primary">
            {t('save.acceptText')}
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container justifyContent="flex-end" spacing={1} style={{ marginBottom: theme.spacing(1) }}>
        <Grid item style={{ flexGrow: 1 }}>
          <div>
            <Typography variant="h5">{t('title.yara')}</Typography>
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
                onClick={() => setYaraFile(originalYaraFile)}
                disabled={yaraFile === originalYaraFile}
              >
                {t('undo')}
              </Button>
            </Grid>
            <Grid item>
              <Button
                size="small"
                variant="contained"
                color="primary"
                disabled={yaraFile === originalYaraFile}
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
                {yaraFile !== null ? (
                  <>
                    <Editor
                      language="yara"
                      width={width}
                      height={height}
                      theme={isDarkTheme ? 'vs-dark' : 'vs'}
                      loading={t('loading.yara')}
                      value={yaraFile}
                      onChange={setYaraFile}
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

const Yara = React.memo(WrappedYara);
export default Yara;
