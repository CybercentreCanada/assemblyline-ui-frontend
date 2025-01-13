/* eslint-disable no-useless-escape */
import Editor, { loader } from '@monaco-editor/react';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Collapse, Paper, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import CustomChip from 'components/visual/CustomChip';
import { bytesToSize } from 'helpers/utils';
import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import AutoSizer from 'react-virtualized-auto-sizer';
import { STATUS_CODE_MESSAGE } from './utils/status_code_message';
import { USER_COLOR } from './utils/user_role_color';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

/**
 * The following configuration is based on the VSCode extension for the YARA pattern matching language made by infosec-intern on Github
 *
 * Source :
 *  - Author: infosec-intern
 *  - Extension: infosec-intern.yara
 *  - Repository: https://github.com/infosec-intern/vscode-yara
 */

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, auto) 1fr',
    gap: theme.spacing(2)
  },
  container: {
    width: 'fit-content',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, auto) 1fr',
    rowGap: theme.spacing(0.25),
    columnGap: theme.spacing(2),
    margin: theme.spacing(1)
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  },
  submit: {
    alignSelf: 'center',
    justifySelf: 'end'
  },
  paper: {
    backgroundColor: theme.palette.background.default
  },
  toggle: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  monaco: {
    display: 'grid',
    gridColumnEnd: 'span 2',
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative'
  }
}));

type Snippet = {
  prefix: string;
  description: string;
  insert: string | string[];
  detail: string;
  kind: CompletionItemKind;
};

interface CompletionList {
  suggestions: CompletionItem[];
  incomplete?: boolean;
  dispose?(): void;
}

interface CompletionItem {
  label: string | CompletionItemLabel;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string | IMarkdownString;
  sortText?: string;
  filterText?: string;
  preselect?: boolean;
  insertText: string;
  insertTextRules?: CompletionItemInsertTextRule;
  range: IRange;
  commitCharacters?: string[];
}

interface CompletionItemLabel {
  label: string;
  detail?: string;
  description?: string;
}

interface IMarkdownString {
  readonly value: string;
  readonly supportThemeIcons?: boolean;
  readonly supportHtml?: boolean;
}

interface IWordAtPosition {
  readonly word: string;
  readonly startColumn: number;
  readonly endColumn: number;
}

interface IRange {
  readonly startLineNumber: number;
  readonly startColumn: number;
  readonly endLineNumber: number;
  readonly endColumn: number;
}

enum CompletionItemKind {
  Method = 0,
  Function = 1,
  Constructor = 2,
  Field = 3,
  Variable = 4,
  Class = 5,
  Struct = 6,
  Interface = 7,
  Module = 8,
  Property = 9,
  Event = 10,
  Operator = 11,
  Unit = 12,
  Value = 13,
  Constant = 14,
  Enum = 15,
  EnumMember = 16,
  Keyword = 17,
  Text = 18,
  Color = 19,
  File = 20,
  Reference = 21,
  Customcolor = 22,
  Folder = 23,
  TypeParameter = 24,
  User = 25,
  Issue = 26,
  Snippet = 27
}

enum CompletionItemInsertTextRule {
  None = 0,
  KeepWhitespace = 1,
  InsertAsSnippet = 4
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type Route = {
  complete?: boolean;
  description?: string;
  function?: string;
  id?: string;
  methods?: Method[];
  name?: string;
  path?: string;
  protected?: boolean;
  require_role?: string[];
  ui_only?: boolean;
};

type Request = {
  body?: object;
  comment?: string;
  error?: string;
  method?: Method;
  open?: boolean;
  url?: string;
};

type Response = {
  data?: object;
  errorMessage?: string;
  open?: boolean;
  responseTime?: number;
  serverVersion?: string;
  statusCode?: number;
  size?: string;
};

class RouteValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RouteValidationError';
  }
}

// const LOCAL_STORAGE = 'api.history';

const METHOD_COLOR = {
  DELETE: 'error',
  GET: 'info',
  POST: 'success',
  PUT: 'warning'
};

const STATUS_CODE_COLOR = {
  1: 'info',
  2: 'success',
  3: 'warning',
  4: 'error',
  5: 'error'
};

const parseAPI = (comment: string, body: object): string =>
  `${comment ? `${comment}\n` : ''}${JSON.stringify(body, null, 4)}`;

const parsePlaceholder = (data: string): string => data.replaceAll(/\<.+?\>/g, (a, b) => `\$\{${b}:${a}\}`);

export const registerAPICompletionItemProvider = (monaco, apis: Route[]) => ({
  provideCompletionItems: (model, position, context): CompletionList => {
    // const word: IWordAtPosition = model.getWordUntilPosition(position);
    const range: IRange = {
      startLineNumber: position.lineNumber,
      startColumn: 0,
      endLineNumber: position.lineNumber,
      endColumn: 0
    };

    const snippets: Snippet[] = apis.map(api => ({
      prefix: api.path,
      description: api.name,
      insert: `/*${api.description}*/\n${parsePlaceholder(
        `{\n\t"url": "${api.path}?<query>",\n\t"body": {\n\t\t<body>\n\t},\n\t"response": {}\n}`
      )}`,
      detail: api.name,
      kind: CompletionItemKind.Module
    }));

    const parseInsertText = snippet =>
      'insert' in snippet
        ? typeof snippet.insert === 'string'
          ? snippet.insert
          : Array.isArray(snippet.insert)
          ? snippet.insert.join('\n')
          : `${JSON.stringify(snippet.insert)}`
        : '';

    const suggestions: CompletionItem[] = snippets.map(snippet => ({
      label: {
        label: 'prefix' in snippet ? snippet.prefix : '',
        description: 'description' in snippet ? snippet.description : ''
      },
      insertText: parseInsertText(snippet),
      kind: 'kind' in snippet ? snippet.kind : CompletionItemKind.Text,
      detail: 'detail' in snippet ? snippet.detail : '',
      documentation: {
        value: `<pre>${parseInsertText(snippet)}</pre>`,
        supportHtml: true,
        supportThemeIcons: true
      },
      insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
      range: range
    }));
    return { suggestions };
  }
});

export default function AdminAPI() {
  const { t, i18n } = useTranslation(['helpAPI']);
  const theme = useTheme();
  const classes = useStyles();
  const { isDark: isDarkTheme } = useAppTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { showSuccessMessage } = useMySnackbar();

  const [body, setBody] = useState<string>('');
  const [request, setRequest] = useState<Request>({ open: true, error: '' });
  const [response, setResponse] = useState<Response>({ open: true });
  const [routes, setRoutes] = useState<Route[]>(null);
  const [currentRoute, setCurrentRoute] = useState<Route>(null);

  const editor = useRef(null);

  const deferredBody = useDeferredValue<string>(body);

  const byteLength = useCallback((str: string) => {
    // returns the byte length of an utf8 string
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
      var code = str.charCodeAt(i);
      if (code > 0x7f && code <= 0x7ff) s++;
      else if (code > 0x7ff && code <= 0xffff) s += 2;
      if (code >= 0xdc00 && code <= 0xdfff) i--; //trail surrogate
    }
    return s;
  }, []);

  const handleBeforeMount = useCallback(
    monaco => {
      if (!monaco.languages.getLanguages().some(({ id }) => id === 'api')) {
        // Register a new language
        monaco.languages.register({ id: 'api' });
        // Modifying the json settings
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: true,
          schemaValidation: 'error'
        });
        // Overiding the json snippets with the APIs
        monaco.languages.registerCompletionItemProvider('json', registerAPICompletionItemProvider(monaco, routes));
      }
    },
    [routes]
  );

  const handleMount = useCallback(e => {
    editor.current = e;
    e.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    if (!currentRoute || !request || request?.error) return;
    let start = Date.now();
    apiCall({
      url: `${request?.url}`,
      method: request?.method,
      body: ['POST', 'PUT'].includes(request?.method) ? request?.body : null,
      onSuccess: api_data => {
        setResponse(r => ({
          ...r,
          data: api_data.api_response,
          errorMessage: null,
          responseTime: Date.now() - start,
          serverVersion: api_data.api_server_version,
          statusCode: api_data.api_status_code,
          size: bytesToSize(byteLength(JSON.stringify(api_data)))
        }));
        setBody(
          parseAPI(request?.comment, {
            url: request?.url,
            body: request?.body,
            response: api_data.api_response
          })
        );
        // editor.current.setSelection({
        //   startLineNumber: 0,
        //   startColumn: 0,
        //   endLineNumber: 0,
        //   endColumn: 0
        // });
      },
      onFailure: api_data => {
        setResponse(r => ({
          ...r,
          data: null,
          errorMessage: api_data.api_error_message,
          responseTime: Date.now() - start,
          serverVersion: api_data.api_server_version,
          statusCode: api_data.api_status_code,
          size: bytesToSize(byteLength(JSON.stringify(api_data)))
        }));
        setBody(
          parseAPI(request?.comment, {
            url: request?.url,
            body: request?.body,
            response: api_data.api_error_message
          })
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoute, request]);

  useEffect(() => {
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

  useEffect(() => {
    if (currentUser.is_admin) {
      apiCall({
        method: 'GET',
        url: `/api/v4/`,
        onSuccess: api_data => setRoutes(api_data.api_response?.apis)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin]);

  useEffect(() => {
    try {
      // Extract the comment section
      const comment: string = deferredBody.match(/\/\*(.|\n|\r)*\*\//g)?.shift() || null;

      // Remove comment section and parse body string to data object
      const data: { url?: string; body?: object; response?: any } = JSON.parse(deferredBody.replace(comment, ''));

      // Check if the URL is valid
      const url = new URL(`http://www.malware.ca${data?.url}`);

      // Find the API route
      if (!Array.isArray(routes)) throw new RouteValidationError('Invalid list of API routes.');
      const route = routes.find(r => new RegExp(`^${r?.path?.replaceAll(/(<.+?>)/g, '[^/]+?')}$`).test(url?.pathname));

      // Set the selected route
      if (!route) throw new RouteValidationError('The URL entered is an invalid API route.');
      setCurrentRoute(route);

      // Find the default Method
      if (!Array.isArray(route?.methods) || route?.methods?.length === 0)
        throw new RouteValidationError('The route has no methods availables.');

      setRequest(r => ({
        ...r,
        body: data?.body,
        comment: comment,
        error: null,
        method: route?.methods?.includes(r?.method) ? r?.method : route?.methods[0],
        url: data?.url
      }));
    } catch (error) {
      setRequest(r => ({ ...r, error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredBody, routes]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.shiftKey || e.ctrlKey) && e.code === 'Enter') handleSubmit();
    }
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [handleSubmit]);

  const Row = useCallback<
    React.FC<{ header?: React.ReactNode; children?: React.ReactNode; span?: number; color?: any }>
  >(
    ({ header = null, children = null, span = 1, color = theme.palette.text.primary }) => {
      return (
        <>
          <Typography component="div" variant="body2" fontWeight={500} color={color} children={header} />
          <Typography
            component="div"
            variant="body2"
            fontWeight={400}
            color={color}
            gridColumn={`span ${span}`}
            children={children}
          />
        </>
      );
    },
    [theme]
  );

  return currentUser.is_admin ? (
    <PageFullSize margin={4}>
      <div className={classes.root}>
        <Typography variant="h4" children={t('title')} />

        <div className={classes.submit}>
          <Tooltip
            title={`${request?.error}`}
            disableFocusListener={!request?.error}
            disableHoverListener={!request?.error}
            disableInteractive={!request?.error}
            disableTouchListener={!request?.error}
            placement="bottom-end"
          >
            <span>
              <Button
                children={t('submit')}
                variant="contained"
                color="primary"
                disabled={!!request?.error}
                onClick={handleSubmit}
              />
            </span>
          </Tooltip>
        </div>

        <div>
          <Paper className={classes.paper} variant="outlined">
            <Button
              className={classes.toggle}
              color="inherit"
              onClick={() => setRequest(r => ({ ...r, open: !r?.open }))}
            >
              {request?.method && (
                <CustomChip
                  type="rounded"
                  size="small"
                  color={METHOD_COLOR[request?.method]}
                  label={t(request?.method)}
                />
              )}
              <Typography variant="h6" children={t('request')} />
              <ExpandMoreIcon className={clsx(classes.expand, request?.open && classes.expandOpen)} />
            </Button>
            <Collapse in={request?.open}>
              <div className={classes.container}>
                <Row header={t('path')} span={3} children={currentRoute?.path} />
                <Row header={t('name')} span={3} children={currentRoute?.name} />
                <Row
                  header={t('require_role')}
                  span={3}
                  children={currentRoute?.require_role?.sort().map((r, i) => (
                    <CustomChip key={i} color={USER_COLOR[r]} type="rounded" size="tiny" label={t(`role.${r}`)} />
                  ))}
                />
                <Row
                  header={t('methods')}
                  span={3}
                  children={currentRoute?.methods?.sort().map((m, i) => (
                    <CustomChip
                      key={i}
                      color={METHOD_COLOR[m]}
                      type="rounded"
                      size="tiny"
                      variant={request?.method === m ? 'filled' : 'outlined'}
                      label={t(m)}
                      onClick={() => setRequest(r => ({ ...r, method: m }))}
                    />
                  ))}
                />
                <Row
                  header={t('complete')}
                  children={
                    currentRoute?.complete ? (
                      <CheckOutlinedIcon htmlColor={theme.palette.success.main} />
                    ) : (
                      <ClearOutlinedIcon htmlColor={theme.palette.error.main} />
                    )
                  }
                />
                <Row
                  header={t('protected')}
                  children={
                    currentRoute?.protected ? (
                      <CheckOutlinedIcon htmlColor={theme.palette.success.main} />
                    ) : (
                      <ClearOutlinedIcon htmlColor={theme.palette.error.main} />
                    )
                  }
                />
                {request?.error && (
                  <Row
                    header={t('error_message')}
                    span={3}
                    color={theme.palette.error.main}
                    children={request?.error && `${request?.error}`}
                  />
                )}
              </div>
            </Collapse>
            {/* </Grid> */}
          </Paper>
        </div>

        <div>
          <Paper className={classes.paper} variant="outlined">
            <Button
              color="inherit"
              style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'center', gap: theme.spacing(1) }}
              onClick={() => setResponse(r => ({ ...r, open: !r?.open }))}
            >
              {response?.statusCode && (
                <CustomChip
                  type="rounded"
                  size="small"
                  variant="outlined"
                  color={STATUS_CODE_COLOR[`${response?.statusCode}`[0]]}
                  label={`${response?.statusCode}`}
                />
              )}
              <Typography variant="h6" children={t('response')} />
              <ExpandMoreIcon className={clsx(classes.expand, response?.open && classes.expandOpen)} />
            </Button>

            <Collapse in={response?.open}>
              <div className={classes.container}>
                <Row header={t('server_version')} span={3} children={response?.serverVersion} />
                <Row
                  header={t('status_code')}
                  span={3}
                  children={`${response?.statusCode} - ${STATUS_CODE_MESSAGE[response?.statusCode]?.title}`}
                />
                <Row
                  header={t('response_time')}
                  span={3}
                  children={response?.responseTime && `${response?.responseTime} ms`}
                />
                <Row
                  header={t('status_message')}
                  span={3}
                  children={
                    response?.statusCode === 200
                      ? `${STATUS_CODE_MESSAGE[response?.statusCode]?.message[request?.method]}`
                      : `${STATUS_CODE_MESSAGE[response?.statusCode]?.message}`
                  }
                />
                {response?.errorMessage && (
                  <Row
                    header={t('error_message')}
                    span={3}
                    color={theme.palette.error.main}
                    children={response?.errorMessage}
                  />
                )}
                {response?.size && <Row header={t('size')} span={3} children={response?.size} />}
              </div>
            </Collapse>
          </Paper>
        </div>

        <div className={classes.monaco}>
          <AutoSizer>
            {({ height, width }) =>
              routes ? (
                <Editor
                  language="json"
                  width={width}
                  height={height}
                  theme={isDarkTheme ? 'vs-dark' : 'vs'}
                  loading={t('loading')}
                  value={body}
                  onChange={setBody}
                  onMount={handleMount}
                  beforeMount={handleBeforeMount}
                  options={{ links: false }}
                />
              ) : (
                <Skeleton width={width} height={height} variant="rectangular" animation="wave" />
              )
            }
          </AutoSizer>
        </div>
      </div>
    </PageFullSize>
  ) : (
    <Navigate to="/forbidden" replace />
  );
}
