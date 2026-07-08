import { loader } from '@monaco-editor/react';
import { PublishOutlined } from '@mui/icons-material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import WrapTextOutlinedIcon from '@mui/icons-material/WrapTextOutlined';
import {
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Popover,
  Skeleton,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { AppNavigate, useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import { useAssistant } from 'layout/assistant';
import type { File } from 'models/base/file';
import type { Submission } from 'models/base/submission';
import ASCIISection from 'pages/file-viewer/components/ascii';
import CodeSection from 'pages/file-viewer/components/code_summary';
import HexSection from 'pages/file-viewer/components/hex';
import ImageSection from 'pages/file-viewer/components/image';
import StringsSection from 'pages/file-viewer/components/strings';
import { SelectionProvider, useSelection } from 'pages/file-viewer/file-viewer.providers';
import { ForbiddenPage } from 'pages/forbidden/forbidden.route';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileDownloader } from 'ui/buttons/FileDownloader';
import { IconButton } from 'ui/buttons/IconButton';
import { PageFullSizeLayout } from 'ui/pages/PageFullSize';
import { TabContainer } from 'ui/TabContainer';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

const TabContent = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: theme.spacing(2)
}));

export const TAB_OPTIONS = ['ascii', 'code', 'strings', 'hex', 'image'] as const;

export type Tab = (typeof TAB_OPTIONS)[number];

export const DEFAULT_TAB: Tab = 'ascii';

const FileViewerPage = React.memo(() => {
  const { t } = useTranslation(['fileViewer']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/file/viewer/:id/:tab'>();
  const selection = useSelection();

  const { addInsight, removeInsight } = useAssistant();
  const { apiCall } = useMyAPI();
  const { configuration } = useALContext();
  const { id: sha256, tab: paramTab } = useAppPathParams<'/file/viewer/:id/:tab'>();
  const { user: currentUser } = useALContext();
  const { closeSnackbar, showSuccessMessage } = useMySnackbar();

  const [type, setType] = useState<string>('unknown');
  const [codeAllowed, setCodeAllowed] = useState<boolean>(false);
  const [imageAllowed, setImageAllowed] = useState<boolean>(false);
  const [wordwrap, setWordwrap] = useState<'on' | 'off'>('off');
  const [dataTruncated, setDataTruncated] = useState<boolean>(false);
  const [submitAnchor, setSubmitAnchor] = useState<HTMLElement | null>(null);
  const [isSelection, setIsSelection] = useState<boolean>(false);

  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const submitPopoverOpen = Boolean(submitAnchor);

  const submissionProfiles = useMemo<Record<string, string>>(() => {
    const profiles = configuration?.submission?.profiles ?? {};
    const map: Record<string, string> = {};
    for (const [name, config] of Object.entries(profiles) as [string, { display_name?: unknown }][]) {
      if (typeof config.display_name === 'string') {
        map[name] = config.display_name;
      }
    }
    return map;
  }, [configuration?.submission?.profiles]);

  const handleFileSubmit = useCallback(
    (submitType: string, isProfile: boolean) => {
      apiCall<Submission>({
        method: isProfile ? 'PUT' : 'GET',
        url: `/api/v4/submit/${submitType}/${sha256}/`,
        onSuccess: api_data => {
          showSuccessMessage(t('submit.success'));
          setTimeout(() => {
            navigate.openRoute({ path: '/submission/detail/:id', params: { id: api_data.api_response.sid } });
          }, 500);
        }
      });
      setSubmitAnchor(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256, t]
  );

  const handleSelectionSubmit = useCallback(
    (profile: string) => {
      closeSnackbar();

      const plaintext = selection?.getSelection();

      apiCall<Submission>({
        url: '/api/v4/submit/',
        method: 'POST',
        body: {
          submission_profile: profile,
          plaintext
        },
        onSuccess: api_data => {
          showSuccessMessage(t('submit.success'));
          setTimeout(() => {
            navigate.openRoute({ path: '/submission/detail/:id', params: { id: api_data.api_response.sid } });
          }, 500);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selection, t]
  );

  useEffect(() => {
    if (!sha256 || !currentUser.roles.includes('file_detail')) return;
    apiCall<File>({
      url: `/api/v4/file/info/${sha256}/`,
      onSuccess: api_data => {
        setType(api_data.api_response.type);
        setImageAllowed(api_data.api_response.is_section_image === true);
        if (api_data.api_response.type.indexOf('code/') === 0 || api_data.api_response.type == 'text/plain') {
          setCodeAllowed(configuration.ui.ai.enabled);
        } else {
          setCodeAllowed(false);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.roles, sha256]);

  useEffect(() => {
    return () => {
      setType('unknown');
      setImageAllowed(null);
    };
  }, [sha256]);

  useEffect(() => {
    selection?.setSelection?.(null);
  }, [selection, sha256]);

  useEffect(() => {
    if (codeAllowed) {
      addInsight({ type: 'code', value: sha256 });
      addInsight({ type: 'file', value: sha256 });
    }

    return () => {
      removeInsight({ type: 'code', value: sha256 });
      removeInsight({ type: 'file', value: sha256 });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeAllowed]);

  return currentUser.roles.includes('file_detail') ? (
    <PageFullSizeLayout margin={4}>
      <Grid container alignItems="center">
        <Grid flexGrow={1}>
          <Typography variant="h4">{t('title')}</Typography>
          {dataTruncated ? (
            <Tooltip title={t('error.truncated')} placement="bottom-start">
              <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                <ErrorOutlineIcon color="error" />
                <Typography
                  variant="caption"
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
                    wordBreak: 'break-word'
                  }}
                >
                  {sha256}
                </Typography>
              </div>
            </Tooltip>
          ) : (
            <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
              {sha256}
            </Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4 }} style={{ textAlign: 'right', flexGrow: 0 }}>
          <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
            {!sha256 || !currentUser.roles.includes('submission_create') ? null : (
              <>
                <IconButton
                  size="large"
                  tooltip={t('submit_content')}
                  preventRender={!sha256 || !currentUser.roles.includes('submission_create')}
                  onClick={event => {
                    setSubmitAnchor(event.currentTarget);
                    setIsSelection(selection?.getSelection()?.length > 0);
                  }}
                >
                  <PublishOutlined />
                  {submitPopoverOpen ? (
                    <ExpandLessIcon style={{ position: 'absolute', right: 0, bottom: 10, fontSize: 'medium' }} />
                  ) : (
                    <ExpandMoreIcon style={{ position: 'absolute', right: 0, bottom: 10, fontSize: 'medium' }} />
                  )}
                </IconButton>
                <Popover
                  open={submitPopoverOpen}
                  anchorEl={submitAnchor}
                  onClose={() => setSubmitAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <List dense>
                    <ListSubheader
                      component="div"
                      disableSticky
                      sx={{ lineHeight: 'initial', marginTop: theme.spacing(1) }}
                    >
                      {isSelection ? t('submit.selection') : t('submit.file')}
                    </ListSubheader>

                    <ListItem dense>
                      <Paper
                        component="pre"
                        variant="outlined"
                        sx={{
                          position: 'relative',
                          backgroundColor: theme.palette.background.default,
                          margin: 0,
                          height: theme.spacing(4),
                          width: '100%'
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginLeft: theme.spacing(1),
                            marginRight: theme.spacing(1)
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {isSelection ? selection?.getSelection() : sha256}
                          </div>
                        </div>
                      </Paper>
                    </ListItem>

                    <ListItemButton
                      component={Link}
                      dense
                      onClick={() => setSubmitAnchor(null)}
                      {...(isSelection
                        ? {
                            to: '/submit',
                            state: { raw: selection?.getSelection() }
                          }
                        : {
                            to: `/submit?hash=${sha256}`
                          })}
                    >
                      <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                        <TuneOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary={t(`submit.modify`)} />
                    </ListItemButton>
                    {!isSelection && (
                      <ListItemButton dense onClick={() => handleFileSubmit('dynamic', false)}>
                        <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                          <OndemandVideoOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary={t(`submit.dynamic`)} />
                      </ListItemButton>
                    )}
                    {submissionProfiles &&
                      Object.entries(submissionProfiles).map(([name, display]) => (
                        <ListItemButton
                          key={name}
                          dense
                          onClick={() => (isSelection ? handleSelectionSubmit(name) : handleFileSubmit(name, true))}
                        >
                          <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                            <OndemandVideoOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText primary={`${t('submit.with')} "${display}"`} />
                        </ListItemButton>
                      ))}
                  </List>
                </Popover>
              </>
            )}

            {currentUser.roles.includes('submission_view') && (
              <Tooltip title={wordwrap == 'on' ? t('linewrap.off') : t('linewrap.on')}>
                <IconButton
                  color={wordwrap == 'on' ? 'primary' : 'default'}
                  size="large"
                  onClick={() => setWordwrap(v => (v === 'on' ? 'off' : 'on'))}
                >
                  <WrapTextOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            {currentUser.roles.includes('submission_view') && (
              <Tooltip title={t('detail')}>
                <IconButton
                  component={Link}
                  to={['openRoute', { path: '/file/detail/:id', params: { id: sha256 } }]}
                  size="large"
                >
                  <DescriptionOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            {currentUser.roles.includes('submission_view') && (
              <Tooltip title={t('related')}>
                <IconButton
                  component={Link}
                  to={[
                    'openRoute',
                    {
                      path: '/search/:tab',
                      params: { tab: 'submission' },
                      search: { query: 'files.sha256:${sha256} OR results:${sha256}* OR errors:${sha256}*' }
                    }
                  ]}
                  size="large"
                >
                  <ViewCarouselOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            <FileDownloader
              link={`/api/v4/file/download/${sha256}/`}
              preventRender={!currentUser.roles.includes('file_download')}
              tooltip={t('download')}
            />
          </div>
        </Grid>
      </Grid>
      {!sha256 ? (
        <Skeleton
          variant="rectangular"
          height={theme.spacing(6)}
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      ) : (
        <div
          style={{
            marginTop: theme.spacing(1),
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <TabContainer
            value={paramTab}
            defaultTab={DEFAULT_TAB}
            paper
            onChange={(_event, value: Tab) => {
              navigate.replaceRoute(
                { path: '/file/viewer/:id/:tab', params: { id: sha256, tab: value } },
                { replace: true }
              );
              selection?.setSelection?.(null);
            }}
            tabs={{
              ascii: {
                label: t('ascii'),
                inner: (
                  <TabContent>
                    <ASCIISection
                      sha256={sha256}
                      type={type}
                      codeAllowed={codeAllowed}
                      options={{ wordWrap: wordwrap }}
                      onDataTruncated={setDataTruncated}
                    />
                  </TabContent>
                )
              },
              code: {
                label: t('code'),
                inner: (
                  <TabContent>
                    <CodeSection sha256={sha256} />
                  </TabContent>
                ),
                preventRender: isMdUp || !codeAllowed
              },
              strings: {
                label: t('strings'),
                inner: (
                  <TabContent>
                    <StringsSection
                      sha256={sha256}
                      type={type}
                      options={{ wordWrap: wordwrap }}
                      onDataTruncated={setDataTruncated}
                    />
                  </TabContent>
                )
              },
              hex: {
                label: t('hex'),
                inner: (
                  <TabContent>
                    <HexSection sha256={sha256} onDataTruncated={setDataTruncated} />
                  </TabContent>
                )
              },
              image: {
                label: t('image'),
                preventRender: !imageAllowed,
                inner: (
                  <TabContent>
                    <ImageSection sha256={sha256} name={sha256} />
                  </TabContent>
                )
              }
            }}
          />
        </div>
      )}
    </PageFullSizeLayout>
  ) : (
    <ForbiddenPage />
  );
});

const WrappedFileViewerPage = React.memo(() => (
  <SelectionProvider>
    <FileViewerPage />
  </SelectionProvider>
));

export const FileViewerRoute = createAppRoute({
  component: WrappedFileViewerPage,
  path: '/file/viewer/:id/:tab',
  params: s => ({
    id: s.string(),
    tab: s.enum(TAB_OPTIONS, 'ascii')
  })
});

const FileViewerRootPage = React.memo(() => {
  const { id } = useAppPathParams<'/file/viewer/:id'>();
  return (
    <AppNavigate
      to={['replaceRoute', { path: '/file/viewer/:id/:tab', params: { id, tab: null } }, [id], { replace: true }]}
    />
  );
});

export const FileViewerRootRoute = createAppRoute({
  component: FileViewerRootPage,
  path: '/file/viewer/:id',
  params: s => ({
    id: s.string()
  })
});
