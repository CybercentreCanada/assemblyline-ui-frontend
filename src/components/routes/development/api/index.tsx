import type { Monaco } from '@monaco-editor/react';
import Editor, { loader } from '@monaco-editor/react';
import { Button, Grid, Paper, Skeleton, Typography, useTheme } from '@mui/material';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Role } from 'components/models/base/user';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import type { editor } from 'monaco-editor';
import { languages } from 'monaco-editor';
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import AutoSizer from 'react-virtualized-auto-sizer';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

type Method = 'GET' | 'POST';

type Route = {
  complete: boolean;
  count_towards_quota: boolean;
  description: string;
  function: string;
  id: string;
  methods: Method[];
  name: string;
  path: string;
  protected: boolean;
  require_role: Role[];
  ui_only: boolean;
};

type Request = {
  comment?: string;
  url?: string;
  method?: Method;
  body?: unknown;
  response?: unknown;
  error?: unknown;
};

type Response = {
  statusCode: number;
  serverVersion: string;
};

export const DevelopmentAPI = () => {
  const { t } = useTranslation(['developmentAPI']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration } = useALContext();
  const { showErrorMessage } = useMySnackbar();

  const [value, setValue] = useState<string>('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [Response, setResponse] = useState<Response>(null);

  const deferredValue = useDeferredValue(value);

  const parseRequest = useCallback((v: string): Request => {
    let out: Request = { comment: null, url: null, method: null, body: null, response: null, error: null };
    out.comment = v.match(/\/\*[\s\S]*?\*\//)?.[0] || null;

    try {
      const data = JSON.parse(v.replace(out.comment, '')) as Request;
      out = {
        ...out,
        url: data?.url || null,
        method: data?.method || null,
        body: data?.body || null,
        response: data?.response || null,
        error: null
      };
    } catch (e: unknown) {
      out.error = e;
    }

    return out;
  }, []);

  const stringifyRequest = useCallback(
    ({ comment = '', url = '', method = 'GET', body = null, response = null }: Request): string =>
      `${comment}\n` +
      `{\n` +
      `\t"url": "${url.replaceAll(/<[^>]*>/g, (v, i) => `$\{${i}:${v}}`)}",\n` +
      `\t"method": "${method}",\n` +
      `\t"body": ${body === null ? 'null' : typeof body === 'string' ? body : JSON.stringify(body, null, '\t')},\n` +
      `\t"response": ${response ? JSON.stringify(response, null, '\t') : 'null'}\n` +
      `}`,
    []
  );

  const request = useMemo<Request>(() => parseRequest(deferredValue), [deferredValue, parseRequest]);

  const currentRoute = useMemo<Route>(() => {
    if (!request?.url) return null;
    const url = new URL(`${window.location.origin}${request?.url}`);
    return !request?.url
      ? null
      : routes.find(route =>
          new RegExp(`^${route.path.replaceAll(/<[^>]*>/g, '.*').replaceAll('/', '\\/')}$`).test(url.pathname)
        );
  }, [request?.url, routes]);

  const handleSubmit = useCallback((req: Request) => {
    if (!currentRoute) return;
    apiCall<unknown>({
      url: req.url,
      method: req.method,
      body: req.body as object,
      onSuccess: ({ api_response, api_server_version, api_status_code }) => {
        setValue(v => stringifyRequest({ ...parseRequest(v), response: api_response }));
        setResponse({ serverVersion: api_server_version, statusCode: api_status_code });
      },
      onFailure: ({ api_error_message, api_server_version, api_status_code }) => {
        showErrorMessage(api_error_message);
        setValue(v => stringifyRequest({ ...parseRequest(v), response: api_error_message }));
        setResponse({ serverVersion: api_server_version, statusCode: api_status_code });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beforeMount = useCallback(
    (monaco: Monaco) => {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ comments: 'ignore' });
      monaco.languages.registerCompletionItemProvider('json', {
        provideCompletionItems: (model, position) => ({
          suggestions: routes.map(route => ({
            label: {
              label: route.path,
              description: route.name
            },
            insertText: stringifyRequest({
              comment: `/* ${route.description}*/`,
              url: route.path,
              method: `$\{100000000:${route.methods?.[0]}}` as Method,
              body: '${100000001:null}'
            }),
            detail: route.name,
            kind: languages.CompletionItemKind.Module,
            insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: {
              value: `<pre>${route.description}</pre>`,
              supportHtml: true,
              supportThemeIcons: true
            },
            range: {
              startLineNumber: position.lineNumber,
              startColumn: model.getWordUntilPosition(position).startColumn,
              endLineNumber: position.lineNumber,
              endColumn: model.getWordUntilPosition(position).endColumn
            }
          }))
        })
      });
    },
    [routes, stringifyRequest]
  );

  const onMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    e.focus();
  }, []);

  useEffect(() => {
    apiCall<{ apis: Route[] }>({
      url: `/api/v4/`,
      onSuccess: ({ api_response }) => setRoutes(api_response.apis),
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentUser.is_admin || !['development', 'staging'].includes(configuration.system.type))
    return <Navigate to="/forbidden" replace />;
  else
    return (
      <PageFullSize margin={4}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
          <PageHeader
            primary={t('title')}
            actions={
              <Button disabled={!currentRoute} variant="contained" onClick={() => handleSubmit(request)}>
                {t('submit')}
              </Button>
            }
          />

          <Grid container component={Paper}>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ padding: theme.spacing(1) }}>
              <Typography variant="body1">Request</Typography>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: theme.spacing(1) }}>
                <div style={{ color: theme.palette.text.secondary }}>URL:</div>
                <div>{request?.url}</div>

                <div style={{ color: theme.palette.text.secondary }}>Method:</div>
                <div>{request?.method}</div>
              </div>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ padding: theme.spacing(1) }}>
              <Typography variant="body1">Response</Typography>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: theme.spacing(1) }}>
                <div style={{ color: theme.palette.text.secondary }}>Code:</div>
                <div>{Response?.statusCode}</div>

                <div style={{ color: theme.palette.text.secondary }}>Version:</div>
                <div>{Response?.serverVersion}</div>
              </div>
            </Grid>
          </Grid>

          {loading ? (
            <Skeleton />
          ) : (
            <div
              style={{
                flexGrow: 1,
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative'
              }}
            >
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                <AutoSizer>
                  {({ width, height }: { width: number; height: number }) => (
                    <Editor
                      language="json"
                      width={width}
                      height={height}
                      theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'vs'}
                      loading={t('loading')}
                      value={value}
                      onChange={setValue}
                      beforeMount={beforeMount}
                      onMount={onMount}
                      options={{ links: false }}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>
          )}
        </div>
      </PageFullSize>
    );
};

export default DevelopmentAPI;
