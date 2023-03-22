import Editor, { loader } from '@monaco-editor/react';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import 'moment/locale/fr';
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import ForbiddenPage from './403';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

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
      // Variables
      [/[$@][\w_]*/, 'attribute.name'],
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
      [/(\/(?:[^\\/]|\\.)+\/)([si]{1,2})?[ \t\n\r$]*/, 'regexp'],

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
    ['(', ')']
  ],
  // symbols that are auto closed when typing
  autoClosingPairs: [
    { open: '"', close: '"', notIn: ['string', 'annotation'] },
    { open: '/', close: '/', notIn: ['string', 'annotation'] },
    { open: '{', close: '}', notIn: ['string', 'annotation'] },
    { open: '[', close: ']', notIn: ['string', 'annotation'] },
    { open: '(', close: ')', notIn: ['string', 'annotation'] }
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

const useStyles2 = makeStyles(theme => ({
  hexWrapper: {
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FAFAFA',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  img: {
    maxWidth: '100%',
    maxHeight: '100%'
  },
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
  },
  container: {
    flexGrow: 1,
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative'
  },
  innerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
}));

const WrappedMonacoViewer = ({ data, type, error, beautify = false }) => {
  const classes = useStyles2();
  const { i18n } = useTranslation();
  const containerEL = useRef<HTMLDivElement>();
  const { isDark: isDarkTheme } = useAppTheme();
  const theme = useTheme();

  useEffectOnce(() => {
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

  const beautifyJSON = inputData => {
    if (!beautify) return inputData;

    try {
      return JSON.stringify(JSON.parse(inputData), null, 4);
    } catch {
      return inputData;
    }
  };

  const languageSelector = {
    'text/json': 'json',
    'text/jsons': 'json',
    'code/vbe': 'vb',
    'code/vbs': 'vb',
    'code/wsf': 'xml',
    'code/batch': 'bat',
    'code/ps1': 'powershell',
    'text/ini': 'ini',
    'text/autorun': 'ini',
    'code/java': 'java',
    'code/python': 'python',
    'code/php': 'php',
    'code/shell': 'shell',
    'code/xml': 'xml',
    'code/yaml': 'yaml',
    'code/javascript': 'javascript',
    'code/jscript': 'javascript',
    'code/typescript': 'typescript',
    'code/xfa': 'xml',
    'code/html': 'html',
    'code/hta': 'html',
    'code/html/component': 'html',
    'code/csharp': 'csharp',
    'code/jsp': 'java',
    'code/c': 'cpp',
    'code/h': 'cpp',
    'code/clickonce': 'xml',
    'code/css': 'css',
    'code/markdown': 'markdown',
    'code/sql': 'sql',
    'code/go': 'go',
    'code/ruby': 'ruby',
    'code/perl': 'perl',
    'code/rust': 'rust',
    'code/lisp': 'lisp'
  };

  return data !== null && data !== undefined ? (
    <div
      ref={containerEL}
      style={{ height: '100%', flexGrow: 1, border: `1px solid ${theme.palette.divider}`, position: 'relative' }}
    >
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
        <ReactResizeDetector handleHeight handleWidth targetRef={containerEL}>
          {({ width, height }) => (
            <div ref={containerEL}>
              <Editor
                language={'yara'}
                width={width}
                height={height}
                theme={isDarkTheme ? 'vs-dark' : 'vs'}
                value={beautifyJSON(data)}
                options={{ links: false, readOnly: true }}
              />
            </div>
          )}
        </ReactResizeDetector>
      </div>
    </div>
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress />
  );
};

const MonacoViewer = React.memo(WrappedMonacoViewer);

const DEFAULT_LABELS = [
  'PHISHING',
  'CRIME',
  'ATTRIBUTED',
  'WHITELISTED',
  'FALSE_POSITIVE',
  'REPORTED',
  'MITIGATED',
  'PENDING'
];

export type RetrohuntPost = {
  description: string;
  classification: string;
  archive_only: boolean;
  yara_signature: string;
};

export type Retrohunt = {
  code: any;
  creator: any;
  tags: any;
  description: any;
  created: any;
  classification: any;
  yara_signature: any;
  raw_query: any;
  total_indices: any;
  pending_indices: any;
  pending_candidates: any;
  errors: any;
  hits: any;
  finished: any;
  truncated: any;
};

export type Workflow = {
  classification: string;
  creation_date?: number;
  creator?: string;
  edited_by?: string;
  hit_count: number;
  labels: string[];
  last_edit?: string;
  last_seen?: string;
  name: string;
  priority: string;
  query: string;
  status: string;
  retrohunt_code?: string;
};

type ParamProps = {
  code: string;
};

type RetrohuntDetailProps = {
  retrohunt_code?: string;
  close?: () => void;
};

const MyMenuItem = withStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: theme.spacing(4)
    }
  })
)(MenuItem);

const useStyles = makeStyles(theme => ({
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

const RetrohuntDetail = ({ retrohunt_code, close }: RetrohuntDetailProps) => {
  const { t, i18n } = useTranslation(['retrohuntDetail']);
  const { code } = useParams<ParamProps>();
  const theme = useTheme();
  const [retrohunt, setRetrohunt] = useState<Retrohunt>(null);
  const [modified, setModified] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const navigate = useNavigate();
  const containerEL = useRef<HTMLDivElement>();
  const containerDialogEL = useRef<HTMLDivElement>();
  const { isDark: isDarkTheme } = useAppTheme();
  const [tab, setTab] = useState<'details' | 'signature' | 'results'>('details');

  const [yara, setYara] = useState(`
  rule test_sig {
    strings:
      $first = "Content_Types"
    condition:
      $first
  }
  `);

  const DEFAULT_RETROHUNT = useMemo<Retrohunt>(
    () => ({
      code: 'c7e5da580df940ed8883182396be4baa',
      creator: 'admin',
      tags: {},
      description: 'words',
      created: '2023-03-13T18:21:48.744095Z',
      classification: 'TLP:W',
      yara_signature: `''
  '                   'rule test_sig {
  '                   '    strings:
  '                   '        $first = "Content_Types"
  '                   '
  '                   '    condition:
  '                   '        $first
  '                   '}
  '`,
      raw_query: '{436f6e74656e745f5479706573}',
      total_indices: 3,
      pending_indices: 3,
      pending_candidates: 0,
      errors: [],
      hits: [],
      finished: false,
      truncated: false
    }),
    []
  );

  console.log(retrohunt_code, code, currentUser.roles);

  useEffect(() => {
    apiCall({
      url: `/api/v4/search/retrohunt?query=*:*`,
      onSuccess: api_data => console.log(api_data)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiCall({
      method: 'GET',
      url: `/api/v4/retrohunt/00173b06e4044885b8ccdaa00165d1c9/`,
      onSuccess: api_data => console.log(api_data)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiCall({
      method: 'POST',
      body: {
        classification: 'TLP:W',
        description: 'words',
        archive_only: false,
        yara_signature: yara
      },
      url: `/api/v4/retrohunt/`,
      onSuccess: api_data => console.log(api_data)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yara]);

  useEffect(() => {
    if ((retrohunt_code || code) && currentUser.roles.includes('retrohunt_view')) {
      apiCall({
        url: `/api/v4/retrohunt/${retrohunt_code || code}/`,
        onSuccess: api_data => setRetrohunt({ ...api_data.api_response })
      });
    } else {
      setRetrohunt({ ...DEFAULT_RETROHUNT });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrohunt_code, code]);

  // const handleNameChange = event => {
  //   setModified(true);
  //   setRetrohunt({ ...retrohunt, name: event.target.value });
  // };

  // const handleQueryChange = event => {
  //   setModified(true);
  //   setRetrohunt({ ...retrohunt, query: event.target.value });
  // };

  // const handleLabelsChange = labels => {
  //   setModified(true);
  //   setRetrohunt({ ...retrohunt, labels: labels.map(label => label.toUpperCase()) });
  // };

  // const handlePriorityChange = event => {
  //   setModified(true);
  //   setRetrohunt({ ...retrohunt, priority: event.target.value });
  // };

  // const handleStatusChange = event => {
  //   setModified(true);
  //   setRetrohunt({ ...retrohunt, status: event.target.value });
  // };

  useEffectOnce(() => {
    // if (!retrohunt) reload();
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

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

  const handleValueChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof Retrohunt) => {
      setModified(true);
      setRetrohunt({ ...retrohunt, [key]: event.target.value });
    },
    [retrohunt]
  );

  const setClassification = classification => {
    setModified(true);
    setRetrohunt({ ...retrohunt, classification });
  };

  const removeRetrohunt = () => {
    apiCall({
      url: `/api/v4/retrohunt/${retrohunt_code || code}/`,
      method: 'DELETE',
      onSuccess: () => {
        setDeleteDialog(false);
        showSuccessMessage(t('delete.success'));
        if (code) {
          setTimeout(() => navigate('/manage/retrohunt'), 1000);
        }
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadRetrohunt')), 1000);
        close();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const saveRetrohunt = () => {
    apiCall({
      url: retrohunt_code || code ? `/api/v4/retrohunt/${retrohunt_code || code}/` : '/api/v4/retrohunt/',
      method: retrohunt_code || code ? 'POST' : 'PUT',
      body: {
        ...retrohunt
        // priority: retrohunt.priority === '' ? null : retrohunt.priority,
        // status: retrohunt.status === '' ? null : retrohunt.status
      },
      onSuccess: () => {
        showSuccessMessage(t(retrohunt_code || code ? 'save.success' : 'add.success'));
        setModified(false);
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadRetrohunt')), 1000);
        if (!(retrohunt_code || code)) close();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  return currentUser.roles.includes('retrohunt_view') ? (
    <PageCenter margin={!code ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={removeRetrohunt}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={buttonLoading}
      />

      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification
            type="picker"
            c12n={retrohunt ? retrohunt.classification : null}
            setClassification={setClassification}
            disabled={!currentUser.roles.includes('retrohunt_manage')}
          />
        </div>
      )}

      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{t(retrohunt_code || code ? 'title' : 'add.title')}</Typography>
              <Typography variant="caption">
                {retrohunt ? retrohunt.code : <Skeleton style={{ width: '10rem' }} />}
              </Typography>
            </Grid>
            {(retrohunt_code || code) && currentUser.roles.includes('retrohunt_run') && (
              <Grid item xs={12} sm style={{ textAlign: 'right', flexGrow: 0 }}>
                {retrohunt ? (
                  <Tooltip title={t('remove')}>
                    <IconButton
                      style={{
                        color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                      onClick={() => setDeleteDialog(true)}
                      size="large"
                    >
                      <RemoveCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                )}
              </Grid>
            )}
          </Grid>
        </div>

        <Grid container spacing={2} height="100vh">
          <Paper square>
            <Tabs
              value={tab}
              onChange={(event, newValue) => setTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={t('tab.details')} value="details" />
              <Tab label={t('tab.signature')} value="signature" />
              <Tab label={t('tab.results')} value="results" />
            </Tabs>
          </Paper>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('description')}</Typography>
            {retrohunt ? (
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={e => handleValueChange(e, 'description')}
                value={retrohunt.description}
                disabled={!currentUser.roles.includes('retrohunt_run')}
                // disabled={!currentUser.roles.includes('retrohunt_manage')}
              />
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('classification')}</Typography>
            {retrohunt ? (
              <Classification
                type="picker"
                c12n={retrohunt ? retrohunt.classification : null}
                setClassification={value => {
                  setModified(true);
                  setRetrohunt(r => ({ ...r, classification: value }));
                }}
              />
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('archive_only')}</Typography>
            {retrohunt ? <Checkbox checked={false} disabled={true} /> : <Skeleton style={{ height: '2.5rem' }} />}
          </Grid>
          <Grid item xs={12} flex={1}>
            {retrohunt ? (
              <div
                ref={containerEL}
                style={{
                  flexGrow: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  position: 'relative',
                  height: '500px'
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
                        {yara !== null ? (
                          <>
                            <Editor
                              language="yara"
                              width={width}
                              height={height}
                              theme={isDarkTheme ? 'vs-dark' : 'vs'}
                              loading={t('loading.yara')}
                              value={yara}
                              onChange={setYara}
                              beforeMount={beforeMount}
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
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
        </Grid>
      </div>

      <RouterPrompt when={modified} />

      {retrohunt && modified && retrohunt.code && false ? (
        <div
          style={{
            paddingTop: code ? theme.spacing(1) : theme.spacing(2),
            paddingBottom: code ? theme.spacing(1) : theme.spacing(2),
            position: code ? 'fixed' : 'inherit',
            bottom: code ? 0 : 'inherit',
            left: code ? 0 : 'inherit',
            width: code ? '100%' : 'inherit',
            textAlign: code ? 'center' : 'right',
            zIndex: code ? theme.zIndex.drawer - 1 : 'auto',
            backgroundColor: code ? theme.palette.background.default : 'inherit',
            boxShadow: code ? theme.shadows[4] : 'inherit'
          }}
        >
          <Button variant="contained" color="primary" disabled={buttonLoading} onClick={saveRetrohunt}>
            {t(retrohunt_code || code ? 'save' : 'add.button')}
            {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        </div>
      ) : null}
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
};

RetrohuntDetail.defaultProps = {
  retrohunt_code: null,
  close: () => {}
};

export default RetrohuntDetail;
