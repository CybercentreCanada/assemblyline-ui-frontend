/* eslint-disable no-useless-escape */
import type { Monaco } from '@monaco-editor/react';
import { Editor, loader } from '@monaco-editor/react';
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
import type { CompletionItem, IRange, Snippet } from 'components/routes/development/api/utils/monaco';
import { CompletionItemInsertTextRule, CompletionItemKind } from 'components/routes/development/api/utils/monaco';
import CustomChip from 'components/visual/CustomChip';
import { METHOD_COLORS, ROLES_COLORS, STATUS_CODE_COLORS } from 'helpers/colors';
import { bytesToSize } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import AutoSizer from 'react-virtualized-auto-sizer';
import { STATUS_CODE_MESSAGE } from './utils/status_code_message';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

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

const WrappedAPIPage = () => {
  const { t, i18n } = useTranslation(['helpAPI']);
  const theme = useTheme();
  const classes = useStyles();
  const { isDark: isDarkTheme } = useAppTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const [open, setOpen] = useState<boolean>(true);
  const [routes, setRoutes] = useState<Route[]>(null);
  const [currentRoute, setCurrentRoute] = useState<Route>(null);
  const [body, setBody] = useState<string>('');
  const [request, setRequest] = useState<Request>(null);
  const [response, setResponse] = useState<Response>(null);

  const editorRef = useRef<unknown>(null);

  const deferredBody = useDeferredValue<string>(body);

  const parseAPI = useCallback(
    (comment: string, value: object): string => `${comment ? `${comment}\n` : ''}${JSON.stringify(value, null, 4)}`,
    []
  );

  const byteLength = useCallback((str: string) => {
    // returns the byte length of an utf8 string
    let s = str.length;
    for (let i = str.length - 1; i >= 0; i--) {
      const code = str.charCodeAt(i);
      if (code > 0x7f && code <= 0x7ff) s++;
      else if (code > 0x7ff && code <= 0xffff) s += 2;
      if (code >= 0xdc00 && code <= 0xdfff) i--; //trail surrogate
    }
    return s;
  }, []);

  const handleSubmit = useCallback(() => {
    console.log(currentRoute, request);
    if (!currentRoute || !request || request?.error) return;
    const start = Date.now();
    apiCall({
      url: `${request?.url}`,
      method: request?.method,
      body: ['POST', 'PUT'].includes(request?.method) ? request?.body : null,
      onSuccess: api_data => {
        console.log(api_data);

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

  const handleBeforeMount = useCallback(
    (monaco: Monaco) => {
      if (!monaco.languages.getLanguages().some(({ id }) => id === 'api')) {
        monaco.languages.register({ id: 'api' });
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: true,
          schemaValidation: 'error'
        });
        monaco.languages.registerCompletionItemProvider('json', {
          provideCompletionItems(model, position, context, token) {
            const range: IRange = {
              startLineNumber: position.lineNumber,
              startColumn: 0,
              endLineNumber: position.lineNumber,
              endColumn: 0
            };

            const snippets: Snippet[] = routes.map(api => ({
              prefix: api.path,
              description: api.name,
              insert: `/*${
                api.description
              }*/\n${`{\n\t"url": "${api.path}?<query>",\n\t"body": {\n\t\t<body>\n\t},\n\t"response": {}\n}`.replaceAll(
                /\<.+?\>/g,
                (a, b) => `\$\{${b}:${a}\}`
              )}`,
              detail: api.name,
              kind: CompletionItemKind.Module
            }));

            const parseInsertText = (snippet: Snippet): string =>
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
      }
    },
    [routes]
  );

  const handleMount = useCallback(e => {
    editorRef.current = e;
    e.focus();
  }, []);

  useEffect(() => {
    if (i18n.language === 'fr') loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    else loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
  });

  useEffect(() => {
    if (!currentUser.is_admin) return;
    apiCall({
      method: 'GET',
      url: `/api/v4/`,
      onSuccess: ({ api_response }) => setRoutes(api_response.apis)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin]);

  useEffect(() => {
    try {
      // Extract the comment section
      const comment: string = deferredBody.match(/\/\*(.|\n|\r)*\*\//g)?.shift() || null;

      // Remove comment section and parse body string to data object
      const { url = '', body = null, response = null } = JSON.parse(deferredBody.replace(comment, '')) as any;

      // Check if the URL is valid
      const href = new URL(`http://www.malware.ca${url}`);

      // Find the API route
      if (!Array.isArray(routes)) throw new RouteValidationError('Invalid list of API routes.');
      const route = routes.find(r => new RegExp(`^${r?.path?.replaceAll(/(<.+?>)/g, '[^/]+?')}$`).test(href.pathname));

      // Set the selected route
      if (!route) throw new RouteValidationError('The URL entered is an invalid API route.');
      setCurrentRoute(route);

      // Find the default Method
      if (!Array.isArray(route?.methods) || route?.methods?.length === 0)
        throw new RouteValidationError('The route has no methods availables.');

      setRequest(r => ({
        ...r,
        body: body,
        comment: comment,
        error: null,
        method: route?.methods?.includes(r?.method) ? r?.method : route?.methods[0],
        url: url
      }));
    } catch (error) {
      setRequest(r => ({ ...r, error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredBody, routes]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      console.log('event', e);
      if (e.shiftKey && e.code === 'Enter') handleSubmit();
    }
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [handleSubmit]);

  console.log(response?.errorMessage);

  return !currentUser.is_admin ? (
    <Navigate to="/forbidden" replace />
  ) : (
    <PageFullSize margin={4} styles={{ paper: { rowGap: theme.spacing(1) } }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
        <Button
          color="inherit"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onClick={() => setOpen(o => !o)}
        >
          <Typography variant="h6" children={t('title')} />
          <ExpandMoreIcon className={clsx(classes.expand, open && classes.expandOpen)} />
        </Button>

        <div style={{ flex: 1 }} />

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

        <Button
          children={t('clear')}
          variant="outlined"
          color="primary"
          onClick={() => {
            setBody('');
            setRequest(null);
            setResponse(null);
          }}
        />
      </div>

      <Collapse in={open} sx={{ width: '100%' }}>
        <Paper
          variant="outlined"
          style={{
            width: '100%',
            padding: theme.spacing(1),
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            rowGap: theme.spacing(1),
            columnGap: theme.spacing(1)
          }}
        >
          {!request ? (
            <Typography variant="subtitle1" children={t('request')} />
          ) : request.error ? (
            <div>
              <Typography variant="subtitle1" children={t('request')} />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                display: 'grid',
                alignContent: 'flex-start',
                gridTemplateColumns: 'repeat(3, auto) 1fr',
                rowGap: theme.spacing(0.25),
                columnGap: theme.spacing(2)
              }}
            >
              <div style={{ display: 'flex', gap: theme.spacing(1), gridColumn: 'span 4' }}>
                {request?.method && (
                  <CustomChip
                    variant="outlined"
                    type="rounded"
                    size="small"
                    color={METHOD_COLORS[request?.method]}
                    label={t(request?.method)}
                  />
                )}
                <Typography variant="subtitle1" children={`${t('request')} - ${currentRoute?.name}`} />
              </div>

              <Typography color="secondary" variant="caption" gridColumn={`span 4`} children={currentRoute?.path} />

              <Typography variant="body2" fontWeight={500} children={t('details')} />
              <div style={{ display: 'flex', gap: theme.spacing(1), gridColumn: 'span 3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(0.25), gridColumn: 'span 2' }}>
                  {currentRoute?.protected ? (
                    <CheckOutlinedIcon htmlColor={theme.palette.success.main} />
                  ) : (
                    <ClearOutlinedIcon htmlColor={theme.palette.error.main} />
                  )}
                  <Typography variant="body2" fontWeight={500} children={t('protected')} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(0.25), gridColumn: 'span 2' }}>
                  {currentRoute?.complete ? (
                    <CheckOutlinedIcon htmlColor={theme.palette.success.main} />
                  ) : (
                    <ClearOutlinedIcon htmlColor={theme.palette.error.main} />
                  )}
                  <Typography variant="body2" fontWeight={500} children={t('complete')} />
                </div>
              </div>

              <Typography variant="body2" fontWeight={500} children={t('methods')} />
              <div style={{ gridColumn: 'span 3' }}>
                {currentRoute?.methods?.sort().map((m, i) => (
                  <CustomChip
                    key={i}
                    color={METHOD_COLORS[m]}
                    type="rounded"
                    size="tiny"
                    variant={request?.method === m ? 'filled' : 'outlined'}
                    label={t(m)}
                    onClick={() => setRequest(r => ({ ...r, method: m }))}
                  />
                ))}
              </div>
              <Typography variant="body2" fontWeight={500} children={t('require_role')} />
              <div style={{ gridColumn: 'span 3' }}>
                {currentRoute?.require_role?.sort().map((r, i) => (
                  <CustomChip key={i} color={ROLES_COLORS[r]} type="rounded" size="tiny" label={t(`role.${r}`)} />
                ))}
              </div>
            </div>
          )}

          {!response ? (
            <Typography variant="subtitle1" children={t('response')} />
          ) : (
            <div
              style={{
                width: '100%',
                display: 'grid',
                alignContent: 'flex-start',
                gridTemplateColumns: 'repeat(3, auto) 1fr',
                rowGap: theme.spacing(0.25),
                columnGap: theme.spacing(2)
              }}
            >
              <div style={{ display: 'flex', gap: theme.spacing(1), gridColumn: 'span 4' }}>
                {request?.method && (
                  <CustomChip
                    type="rounded"
                    variant="outlined"
                    size="small"
                    color={STATUS_CODE_COLORS[response?.statusCode.toString().charAt(0)]}
                    label={response?.statusCode}
                  />
                )}
                <Typography
                  variant="subtitle1"
                  children={`${t('response')} - ${STATUS_CODE_MESSAGE[response?.statusCode]?.title}`}
                />
              </div>
              <Typography
                color="secondary"
                variant="caption"
                gridColumn={`span 4`}
                children={
                  response?.statusCode === 200
                    ? `${STATUS_CODE_MESSAGE[response?.statusCode]?.message[request?.method]}`
                    : `${STATUS_CODE_MESSAGE[response?.statusCode]?.message}`
                }
              />

              <Typography variant="body2" fontWeight={500} children={t('server_version')} />
              <Typography variant="body2" gridColumn="span 3" children={response.serverVersion} />

              <Typography variant="body2" fontWeight={500} children={t('response_time')} />
              <Typography
                variant="body2"
                gridColumn="span 3"
                children={response?.responseTime && `${response?.responseTime} ms`}
              />

              <Typography variant="body2" fontWeight={500} children={t('size')} />
              <Typography variant="body2" gridColumn="span 3" children={response.size} />
            </div>
          )}

          <div style={{ gridColumnEnd: 'span 2' }}>
            {/* <Typography
              component="pre"
              color="error"
              variant="body2"
              whiteSpace="pre"
              dangerouslySetInnerHTML={{
                __html: '\n\nasdasd\n\nasdASd'
              }}
            />
            <Typography
              component="pre"
              color="error"
              variant="body2"
              whiteSpace="pre"
              children={response?.errorMessage}
              // dangerouslySetInnerHTML={{
              //   __html: DOMPurify.sanitize(response?.errorMessage, { USE_PROFILES: { html: true } })
              // }}
            /> */}

            <pre style={{ color: theme.palette.error.main, fontSize: 'smaller', margin: 'auto', overflowX: 'auto' }}>
              {response?.errorMessage}
            </pre>
          </div>
        </Paper>
      </Collapse>

      <div style={{ padding: '1px', flexGrow: 1, border: `1px solid ${theme.palette.divider}`, position: 'relative' }}>
        <AutoSizer>
          {({ height, width }: { height: string | number; width: string | number }) =>
            !routes ? (
              <Skeleton width={width} height={height} variant="rectangular" animation="wave" />
            ) : (
              <Editor
                language="json"
                width={width}
                height={height}
                theme={isDarkTheme ? 'vs-dark' : 'vs'}
                loading={t('loading')}
                value={body}
                onChange={value => setBody(value)}
                onMount={handleMount}
                beforeMount={handleBeforeMount}
                options={{ links: false }}
              />
            )
          }
        </AutoSizer>
      </div>
    </PageFullSize>
  );
};

export const APIPage = React.memo(WrappedAPIPage);
export default APIPage;
