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

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

const yaraDef = {
  defaultToken: 'invalid',
  octaldigits: /-?0o[0-7]+/,
  hexdigits: /-?0x[0-9a-fA-F]+/,
  digits: /-?[0-9]+/,
  hexchars: /([0-9a-fA-F?]{2})+/,
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
  identifiers: /[A-Z_a-z][0-9A-Z_a-z]*/,
  string_names: /[!@#$][0-9A-Z_a-z]*/,
  rule_brackets: /[{}]/,
  regexp_control: /[(){}$^|\-*+?.[\]]/,
  regexp_escapes: /\\[^0-9x\r\nj]/,
  string_escapes: /\\(?:[nrt\\"]|x[0-9A-Fa-f]{2})/,
  operator_chars: /[!%&*+-.:<=>\\^|~]+/,
  operators: [
    '.',
    '..',
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
    ':',
    '='
  ],
  // The main tokenizer for our languages
  tokenizer: {
    root: [
      {
        include: '@whitespace'
      },
      {
        include: '@modules'
      },
      {
        include: '@rules_files'
      },
      {
        include: '@rules'
      }
    ],
    modules: [
      [
        'import',
        {
          token: 'keyword',
          next: '@quoted_string'
        }
      ]
    ],
    rules_files: [
      [
        'include',
        {
          token: 'keyword',
          next: '@quoted_string'
        }
      ]
    ],
    rules: [
      {
        include: '@rule_restrictions'
      },
      {
        include: '@rule_declaration'
      }
    ],
    rule_restrictions: [
      ['global', 'keyword'],
      ['private', 'keyword']
    ],
    rule_declaration: [
      ['rule', 'keyword'],
      [
        /[A-Z_a-z][0-9A-Z_a-z]{0,127}\b/,
        {
          cases: {
            '@keywords': 'invalid',
            '@default': 'variable'
          }
        }
      ],
      [/:/, 'operator', '@rule_tags'],
      [/\{/, '@brackets', '@rule_content']
    ],
    rule_tags: [
      [
        /[A-Z_a-z][0-9A-Z_a-z]{0,127}\b/,
        {
          cases: {
            '@keywords': 'invalid',
            '@default': 'variable'
          }
        }
      ],
      [/(?=\{)/, '', '@pop']
    ],
    rule_content: [
      {
        include: '@whitespace'
      },
      [/meta\b/, 'keyword', '@rule_meta_start'],
      [/strings\b/, 'keyword', '@rule_strings_start'],
      [/condition\b/, 'keyword', '@rule_condition_start'],
      [/\}/, '@brackets', '@pop']
    ],
    // Meta
    rule_meta_start: [
      [
        /:/,
        {
          token: 'keyword',
          switchTo: '@rule_meta'
        }
      ]
    ],
    rule_meta: [
      {
        include: '@whitespace'
      },
      [/(meta|strings|condition|\})/, {token: '@rematch', next: '@pop'}],
      [
        /[A-Z_a-z][0-9A-Z_a-z]{0,127}\b/,
        {
          cases: {
            '@keywords': {
              token: 'invalid',
              next: '@meta_assign'
            },
            '@default': {
              token: 'string',
              next: '@meta_assign'
            }
          }
        }
      ],
      [/[^A-Z_a-z \t\r\n]+[^\t\r\n]*$/, 'invalid']
    ],
    meta_assign: [
      [
        /=/,
        {
          token: 'operator',
          switchTo: '@meta_values'
        }
      ],
      [
        /[^= \t\r\n]+[^\t\r\n]*$/,
        {
          token: 'invalid',
          switchTo: '@meta_values'
        }
      ]
    ],
    meta_values: [
      [
        /(?=")/,
        {
          token: 'string',
          switchTo: '@quoted_string'
        }
      ], // strings
      [/@hexdigits/, 'number', '@pop'], // integers
      [/@octaldigits/, 'number', '@pop'], // integers
      [/@digits/, 'number', '@pop'], // integers
      [
        /([A-Z_a-z][0-9A-Z_a-z]{0,127})(.*$)/,
        [
          {
            cases: {
              'true|false': {
                token: 'keyword',
                next: '@pop'
              },
              '@default': {
                token: 'invalid',
                next: '@pop'
              }
            }
          },
          {
            token: 'invalid'
          }
        ]
      ] // booleans
    ],
    // Strings
    rule_strings_start: [
      [
        /:/,
        {
          token: 'keyword',
          switchTo: '@rule_strings'
        }
      ]
    ],
    rule_strings: [
      {
        include: '@whitespace'
      },
      [/(meta|strings|condition|\})/, {token: '@rematch', next: '@pop'}],
      [
        /[$][0-9A-Z_a-z]*\b/,
        {
          token: 'variable',
          next: '@strings_assign'
        }
      ],
      [
        /[$]/,
        {
          token: 'variable',
          next: '@strings_assign'
        } // anonymous name
      ],
      [
        /(xor)\s*(\()\s*((?:0x[0-9A-Fa-f]{1,2}|0o[0-7]{1,3}|[0-9]{1,3})(?:\s*-\s*(?:0x[0-9A-Fa-f]{1,2}|0o[0-7]{1,3}|[0-9]{1,3}))?)\s*(\))/,
        ['keyword', 'delimiter', 'number', 'delimiter']
      ],
      [
        /(base64|base64wide)(\()("(?:\\(?:[nrt\\"]|x[0-9A-Fa-f]{2})|[\x20\x21\x23-\x5B\x5D-\x7E]){1,64}")(\))/,
        ['keyword', 'delimiter', 'string', 'delimiter']
      ],
      [
        /(nocase|wide|ascii|fullword|private|xor|base64|base64wide)\b/,
        'keyword'
      ],
      [/[^$ \t\r\n]+[^\t\r\n]*$/, 'invalid']
    ],
    strings_assign: [
      [
        /=/,
        {
          token: 'operator',
          switchTo: '@strings_values'
        }
      ],
      [
        /[^= \t\r\n]+[^\t\r\n]*$/,
        {
          token: 'invalid',
          switchTo: '@strings_values'
        }
      ]
    ],
    strings_values: [
      [
        /(?=")/,
        {
          token: 'string',
          switchTo: '@quoted_string'
        }
      ], // strings
      [
        /\//,
        {
          token: 'regexp',
          switchTo: '@regexp'
        }
      ], // regular expressions
      [
        /\{/,
        {
          token: 'delimiter',
          switchTo: '@hex_string'
        }
      ] // hex strings
    ],
    // Condition
    rule_condition_start: [
      [
        /:/,
        {
          token: 'keyword',
          switchTo: '@rule_condition'
        }
      ]
    ],
    rule_condition: [
      {
        include: '@whitespace'
      },
      [/(meta|strings|condition|\})/, {token: '@rematch', next: '@pop'}],
      [/@string_names/, 'variable'],
      [
        /@identifiers/,
        {
          cases: {
            'all|any': {
              token: 'number'
            },
            'global|private|rule|meta|strings|condition': {
              token: 'invalid'
            },
            '@keywords': {
              token: 'keyword'
            },
            '@default': {
              token: 'variable'
            }
          }
        }
      ],
      [
        /@operator_chars/,
        {
          cases: {
            '=': {
              token: 'invalid'
            },
            '@operators': {
              token: 'operators'
            },
            '@default': {
              token: 'invalid'
            }
          }
        }
      ],
      [/@digits/, 'number'],
      [/@hexdigits/, 'number'],
      [/@octaldigits/, 'number'],
      [
        /[()]/,
        {
          token: '@brackets'
        }
      ],
      [
        /(?=")/,
        {
          token: 'string',
          next: '@quoted_string'
        }
      ], // strings
      [
        /\//,
        {
          token: 'regexp',
          next: '@regexp'
        }
      ], // regular expressions
      [/[^A-Z_a-z }\t\r\n]+[^}\t\r\n]*$/, 'invalid']
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
    quoted_string: [
      [/"([^"\\]|@string_escapes)*$/, 'invalid', '@pop'],
      [
        /"/,
        {
          token: 'string',
          bracket: '@open',
          switchTo: '@quoted_chars'
        }
      ]
    ],
    quoted_chars: [
      [/[^\\"]+/, 'string'],
      [/@string_escapes/, 'escape'],
      [/\\./, 'invalid'],
      [
        /"/,
        {
          token: 'string',
          bracket: '@close',
          next: '@pop'
        }
      ]
    ],
    regexp: [
      [
        /(\{)([0-9]+|[0-9]+,(?:[0-9]+)?|,[0-9]+)(\})/,
        ['delimiter', 'number.float', 'delimiter']
      ],
      [/\{/, 'regexp'],
      [
        /(\[)(\^?)(-?)(?=(?:[^\r\n\]\\/]|\\.)+\])/,
        [
          {
            token: 'delimiter',
            bracket: '@open',
            next: '@regexp_range'
          },
          'operator',
          'regexp'
        ]
      ],
      [/[^\\/\r\n()[\]{}]/, 'regexp'],
      [
        /(\/)(i?s?)/,
        [
          {
            token: 'regexp',
            bracket: '@close',
            next: '@pop'
          },
          'keyword.other'
        ]
      ],
      [/@regexp_escapes/, 'string'],
      [/@regexp_control/, 'delimiter'],
      [/(.+$)/, 'invalid', '@pop']
    ],
    regexp_range: [
      [
        /(-?)(\])/,
        [
          'regexp',
          {
            token: 'delimiter',
            bracket: '@close',
            next: '@pop'
          }
        ]
      ],
      [/-/, 'delimiter'],
      [/@regexp_escapes/, 'string'],
      [/[^\\\]\r\n]/, 'regexp']
    ],
    hex_string: [
      {
        include: '@whitespace'
      },
      [/}/, 'delimiter', '@pop'], // End of hex string
      [/(meta|strings|condition|\})/, {token: '@rematch', next: '@pop'}],
      ['@hexchars', 'string'], // hex values
      [/[|]/, 'delimiter'], // alternate values
      [
        /(\[)\s*(?:([1-9][0-9]*|[0-9]*\s*-|[0-9]+\s*-\s*[0-9]*)\s*(\]))/,
        ['delimiter', 'number', 'delimiter']
      ] // hex jump
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
    {
      open: '"',
      close: '"',
      notIn: ['string', 'regexp', 'comment']
    },
    {
      open: '/',
      close: '/',
      notIn: ['string', 'regexp', 'comment']
    },
    {
      open: '{',
      close: '}',
      notIn: ['string', 'comment']
    },
    {
      open: '[',
      close: ']',
      notIn: ['string', 'comment']
    },
    {
      open: '(',
      close: ')',
      notIn: ['string', 'comment']
    }
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
  const { isDark: isDarkTheme } = useAppTheme();

  useEffectOnce(() => {
    if (!yaraFile) reload();
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

const Yara = React.memo(WrappedYara);
export default Yara;
