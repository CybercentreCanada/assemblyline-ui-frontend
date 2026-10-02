import type { Monaco } from '@monaco-editor/react';
import Editor, { loader } from '@monaco-editor/react';
import { Button, Grid, Paper, Skeleton, Typography, useTheme } from '@mui/material';
import PageFullSize from 'commons/components/pages/PageFullSize';
import { useALQuery } from 'components/core/Query/AL/useALQuery';
import { useAPIMutation } from 'components/core/Query/API/useAPIMutation';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { ApiDocumentation } from 'components/models/ui';
import type { Method } from 'components/models/utils/request';
import type { Request, Response } from 'components/routes/development/api/development_api.models';
import {
  formatMilliseconds,
  METHOD_COLOR_MAP,
  parseRequest,
  STATUS_CODES,
  stringifyRequest
} from 'components/routes/development/api/development_api.utils';
import CustomChip from 'components/visual/CustomChip';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import type { editor } from 'monaco-editor';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import AutoSizer from 'react-virtualized-auto-sizer';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

export const DevelopmentAPI = () => {
  const { t } = useTranslation(['developmentAPI', 'user']);
  const theme = useTheme();
  const { user: currentUser, configuration } = useALContext();
  const { showErrorMessage } = useMySnackbar();

  const [value, setValue] = useState<string>('');
  const [response, setResponse] = useState<Response>(null);

  const deferredValue = useDeferredValue<string>(value);

  const { data: routes, isLoading } = useALQuery({ url: `/api/v4/` });

  const request = useMemo<Request>(() => parseRequest(deferredValue), [deferredValue]);

  const currentRoute = useMemo<ApiDocumentation | null>(() => {
    // Ensure request URL and API routes are valid before proceeding
    if (!request?.url || !routes?.apis) return null;

    // Parse the current request URL
    const currentUrl = new URL(request.url, window.location.origin);

    // Find the matching route based on the request URL
    return (
      routes.apis.find(apiRoute => {
        const routeRegex = new RegExp(`^${apiRoute.path.replaceAll(/<[^>]*>/g, '.*').replaceAll('/', '\\/')}$`);
        return routeRegex.test(currentUrl.pathname);
      }) || null
    ); // Return null if no matching route is found
  }, [request?.url, routes?.apis]);

  const requestRef = useRef<Request>(request);
  const currentRouteRef = useRef<ApiDocumentation | null>(currentRoute);

  const handleSubmit = useAPIMutation((req: Request, route: ApiDocumentation) => {
    const startTime = performance.now(); // Start timestamp

    return {
      url: req.url,
      method: req.method,
      body: req.body as object,
      enabled: !!route,
      onSuccess: ({ api_response, api_server_version, api_status_code }) => {
        const endTime = performance.now();

        setValue(v => stringifyRequest({ ...parseRequest(v), response: api_response }));
        setResponse({
          serverVersion: api_server_version,
          statusCode: api_status_code,
          elapseTime: endTime - startTime
        });
      },
      onFailure: ({ api_error_message, api_server_version, api_status_code }) => {
        const endTime = performance.now();

        showErrorMessage(api_error_message);
        setValue(v => stringifyRequest({ ...parseRequest(v), response: api_error_message }));
        setResponse({
          serverVersion: api_server_version,
          statusCode: api_status_code,
          elapseTime: endTime - startTime
        });
      }
    };
  });

  const beforeMount = useCallback(
    (monaco: Monaco) => {
      // Ignore comments in JSON diagnostics
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ comments: 'ignore' });

      // Register a completion item provider for JSON
      monaco.languages.registerCompletionItemProvider('json', {
        provideCompletionItems: (model, position) => {
          // Check that we are only on the first line
          if (position.lineNumber !== 1) {
            return null; // Do not provide suggestions for any other lines
          }

          // If `routes.apis` is unavailable, return nothing
          if (!routes?.apis) {
            return null;
          }

          // Provide suggestions for the first line
          return {
            suggestions: routes.apis.map(route => ({
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
              kind: monaco.languages.CompletionItemKind.Module,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
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
          };
        }
      });
    },
    [routes?.apis]
  );

  const onMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      editor.focus();

      // Add a custom format action (Ctrl+Shift+F / Cmd+Shift+F)
      editor.addAction({
        id: 'format-code',
        label: 'Format Code',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => {
          // Trigger the editor's built-in format action
          void editor.getAction('editor.action.formatDocument').run();
        }
      });

      // Add a custom format action (Ctrl+Shift+F / Cmd+Shift+F)
      editor.addAction({
        id: 'format-code',
        label: 'Format Code',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => {
          // Trigger the editor's built-in format action
          void editor.getAction('editor.action.formatDocument').run();
        }
      });

      // Add a custom action to capture Ctrl+Enter
      editor.addAction({
        id: 'ctrl-enter-action',
        label: 'Trigger on Ctrl+Enter',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter], // Combine Ctrl/Cmd key with Enter key
        run: () => handleSubmit.mutate(requestRef.current, currentRouteRef.current)
      });
    },
    [handleSubmit]
  );

  useEffect(() => {
    if (!currentRoute) setResponse(null);
  }, [currentRoute]);

  useEffect(() => {
    requestRef.current = request;
    currentRouteRef.current = currentRoute;
  }, [currentRoute, request]);

  if (!currentUser.is_admin || !['development', 'staging'].includes(configuration.system.type))
    return <Navigate to="/forbidden" replace />;
  else
    return (
      <PageFullSize margin={4}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
          <PageHeader
            primary={t('title')}
            actions={
              <Button
                disabled={!currentRoute}
                variant="contained"
                onClick={() => handleSubmit.mutate(request, currentRoute)}
              >
                {t('submit')}
              </Button>
            }
          />

          <Grid container component={Paper}>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ padding: theme.spacing(1) }}>
              <Typography variant="body1">{t('request')}</Typography>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  columnGap: theme.spacing(1),
                  rowGap: theme.spacing(0.25)
                }}
              >
                <div style={{ color: theme.palette.text.secondary }}>{t('name')}:</div>
                <div>{currentRoute?.name}</div>

                <div style={{ color: theme.palette.text.secondary }}>{t('path')}:</div>
                <div>{currentRoute?.path}</div>

                <div style={{ color: theme.palette.text.secondary }}>{t('method')}:</div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    columnGap: theme.spacing(0.5)
                  }}
                >
                  {currentRoute?.methods.map((method, i) => (
                    <CustomChip
                      key={`${method}-${i}`}
                      label={method}
                      color={METHOD_COLOR_MAP?.[method] || 'default'}
                      size="tiny"
                      variant={request?.method === method ? 'filled' : 'outlined'}
                    />
                  ))}
                </div>

                <div style={{ color: theme.palette.text.secondary }}>{t('required_role')}:</div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    columnGap: theme.spacing(0.5)
                  }}
                >
                  {currentRoute?.require_role.map((role, i) => (
                    <CustomChip
                      key={`${role}-${i}`}
                      label={t(`user:role.${role}`)}
                      color={currentUser.roles.includes(role) ? 'primary' : 'default'}
                      size="tiny"
                      type="rounded"
                    />
                  ))}
                </div>

                <div></div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    columnGap: theme.spacing(0.5)
                  }}
                >
                  {!currentRoute ? null : (
                    <>
                      {currentRoute?.complete && (
                        <CustomChip label={t('complete')} size="tiny" type="rounded" variant="outlined" />
                      )}
                      {currentRoute?.count_towards_quota && (
                        <CustomChip label={t('count_towards_quota')} size="tiny" type="rounded" variant="outlined" />
                      )}
                      {currentRoute?.protected && (
                        <CustomChip label={t('protected')} size="tiny" type="rounded" variant="outlined" />
                      )}
                      {currentRoute?.ui_only && (
                        <CustomChip label={t('ui_only')} size="tiny" type="rounded" variant="outlined" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ padding: theme.spacing(1) }}>
              <Typography variant="body1">{t('response')}</Typography>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: theme.spacing(1) }}>
                <div style={{ color: theme.palette.text.secondary }}>{t('version')}:</div>
                <div>{response?.serverVersion}</div>

                <div style={{ color: theme.palette.text.secondary }}>{t('status_code')}:</div>
                <div>
                  {response?.statusCode && (
                    <CustomChip
                      label={response?.statusCode}
                      size="tiny"
                      color={(() => {
                        switch (response?.statusCode?.toString()[0]) {
                          case '1':
                            return 'info';
                          case '2':
                            return 'success';
                          case '3':
                            return 'warning';
                          case '4':
                            return 'error';
                          case '5':
                            return 'primary';
                          default:
                            return 'default';
                        }
                      })()}
                    />
                  )}
                </div>

                <div style={{ color: theme.palette.text.secondary }}>{t('name')}:</div>
                <div>{STATUS_CODES?.[response?.statusCode]?.name || null}</div>

                <div style={{ color: theme.palette.text.secondary }}>{t('description')}:</div>
                <div>{STATUS_CODES?.[response?.statusCode]?.description || null}</div>

                <div style={{ color: theme.palette.text.secondary }}>{t('elapse_time')}:</div>
                <div>{formatMilliseconds(response?.elapseTime)}</div>

                <div style={{ color: theme.palette.text.secondary }}>{t('error')}:</div>
                <div
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                  }}
                >
                  {handleSubmit?.failureReason?.message || handleSubmit?.error}
                </div>
              </div>
            </Grid>
          </Grid>

          {isLoading ? (
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
