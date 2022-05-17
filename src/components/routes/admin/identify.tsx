import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
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

function Yara({ reload, yaraFile, originalYaraFile, setYaraFile }) {
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
      <Grid container justifyContent="flex-end" style={{ marginBottom: theme.spacing(1), textAlign: 'left' }}>
        <Grid item style={{ flexGrow: 1 }}>
          <div>
            <Typography variant="h5">{t('title.yara')}</Typography>
          </div>
        </Grid>
        <Grid item>
          <Grid container spacing={2}>
            <Grid item>
              <Button size="small" variant="contained" onClick={() => setYaraFile(originalYaraFile)}>
                {t('reset')}
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
    </>
  );
}

function LibMagic({ reload, magicFile, originalMagicFile, setMagicFile }) {
  const { t, i18n } = useTranslation(['adminIdentify']);
  const theme = useTheme();
  const containerEL = useRef<HTMLDivElement>();
  const containerDialogEL = useRef<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const { isDarkTheme } = useAppContext();

  useEffect(() => {
    if (!magicFile) reload();
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
                    theme={isDarkTheme ? 'vs-dark' : 'vs'}
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
      <Grid container justifyContent="flex-end" style={{ marginBottom: theme.spacing(1), textAlign: 'left' }}>
        <Grid item style={{ flexGrow: 1 }}>
          <div>
            <Typography variant="h5">{t('title.magic')}</Typography>
          </div>
        </Grid>
        <Grid item>
          <Grid container spacing={2}>
            <Grid item>
              <Button size="small" variant="contained" onClick={() => setMagicFile(originalMagicFile)}>
                {t('reset')}
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
                      theme={isDarkTheme ? 'vs-dark' : 'vs'}
                      loading={t('loading.magic')}
                      value={magicFile}
                      onChange={setMagicFile}
                      beforeMount={beforeMount}
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
    </>
  );
}

export default function AdminIdentify() {
  const { t } = useTranslation(['adminIdentify']);
  const theme = useTheme();
  const { user: currentUser } = useUser<CustomUser>();
  const { apiCall } = useMyAPI();
  const [value, setValue] = useState('libmagic');
  const [magicFile, setMagicFile] = useState(null);
  const [originalMagicFile, setOriginalMagicFile] = useState(null);
  const [yaraFile, setYaraFile] = useState(null);
  const [originalYaraFile, setOriginalYaraFile] = useState(null);
  const useStyles = makeStyles(curTheme => ({
    main: {
      marginTop: theme.spacing(1),
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    tab: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: theme.spacing(2)
    }
  }));
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const loadMagic = () => {
    apiCall({
      method: 'GET',
      url: '/api/v4/system/identify/magic/',
      onSuccess: api_data => {
        setMagicFile(api_data.api_response);
        setOriginalMagicFile(api_data.api_response);
      }
    });
  };

  const loadYara = () => {
    apiCall({
      method: 'GET',
      url: '/api/v4/system/identify/yara/',
      onSuccess: api_data => {
        setYaraFile(api_data.api_response);
        setOriginalYaraFile(api_data.api_response);
      }
    });
  };

  return currentUser.is_admin ? (
    <PageFullSize margin={4}>
      <div style={{ marginBottom: theme.spacing(2), textAlign: 'left' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item style={{ flexGrow: 1 }}>
            <div>
              <Typography variant="h4">{t('title')}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2">{t('warning')}</Typography>
            </div>
          </Grid>
        </Grid>
      </div>
      <div className={classes.main}>
        <Paper square>
          <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary">
            <Tab label={t('libmagic')} value="libmagic" />
            <Tab label={t('yara')} value="yara" />
          </Tabs>
        </Paper>
        {value === 'libmagic' && (
          <div className={classes.tab}>
            <LibMagic
              reload={loadMagic}
              magicFile={magicFile}
              originalMagicFile={originalMagicFile}
              setMagicFile={setMagicFile}
            />
          </div>
        )}
        {value === 'yara' && (
          <div className={classes.tab}>
            <Yara reload={loadYara} yaraFile={yaraFile} originalYaraFile={originalYaraFile} setYaraFile={setYaraFile} />
          </div>
        )}
      </div>
    </PageFullSize>
  ) : (
    <Redirect to="/forbidden" />
  );
}
