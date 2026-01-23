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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Skeleton,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useAppUser } from 'commons/components/app/hooks';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useAssistant from 'components/hooks/useAssistant';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { File } from 'components/models/base/file';
import type { Submission } from 'components/models/base/submission';
import type { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import { FileDownloader } from 'components/visual/Buttons/FileDownloader';
import { IconButton } from 'components/visual/Buttons/IconButton';
import { ASCIISection, HexSection, ImageSection, StringsSection } from 'components/visual/FileViewer';
import CodeSection from 'components/visual/FileViewer/code_summary';
import SelectionProvider, { useSelection } from 'components/visual/FileViewer/components/SelectionProvider';
import { TabContainer } from 'components/visual/TabContainer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

const TabContent = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: theme.spacing(2)
}));

export type Tab = 'ascii' | 'code' | 'strings' | 'hex' | 'image';

export const TAB_OPTIONS: Tab[] = ['ascii', 'code', 'strings', 'hex', 'image'];

export const DEFAULT_TAB: Tab = 'ascii';

type ParamProps = {
  id: string;
  tab: Tab;
};

const WrappedFileViewer = () => {
  const { t } = useTranslation(['fileViewer']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const selection = useSelection();

  const { addInsight, removeInsight } = useAssistant();
  const { apiCall } = useMyAPI();
  const { configuration } = useALContext();
  const { id: sha256, tab: paramTab } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { showSuccessMessage } = useMySnackbar();

  const [type, setType] = useState<string>('unknown');
  const [codeAllowed, setCodeAllowed] = useState<boolean>(false);
  const [imageAllowed, setImageAllowed] = useState<boolean>(null);
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

  const submit = useCallback(
    (submitType: string, isProfile: boolean) => {
      apiCall<Submission>({
        method: isProfile ? 'PUT' : 'GET',
        url: `/api/v4/submit/${submitType}/${sha256}/`,
        onSuccess: api_data => {
          showSuccessMessage(t('submit.success'));
          setTimeout(() => {
            navigate(`/submission/detail/${api_data.api_response.sid}`);
          }, 500);
        }
      });
      setSubmitAnchor(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256, t]
  );

  useEffect(() => {
    if (!sha256 || !currentUser.roles.includes('file_detail')) return;
    apiCall<File>({
      url: `/api/v4/file/info/${sha256}/`,
      onSuccess: api_data => {
        setType(api_data.api_response.type);
        setImageAllowed(api_data.api_response.is_section_image === true);
        if (api_data.api_response.type.indexOf('code/') === 0) {
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
    <PageFullSize margin={4}>
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
                  tooltip={`${t('submit_file')}: ${selection?.getSelection()?.length > 0 ? 'selection' : 'file'}`}
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
                  <List disablePadding>
                    <ListItemButton
                      component={Link}
                      to="/submit"
                      state={{ raw: selection?.getSelection() }}
                      dense
                      onClick={() => setSubmitAnchor(null)}
                    >
                      <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                        <TuneOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary={t('submit.modify')} />
                    </ListItemButton>
                    <ListItemButton dense onClick={() => submit('dynamic', false)}>
                      <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                        <OndemandVideoOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary={t('submit.dynamic')} />
                    </ListItemButton>
                    {submissionProfiles &&
                      Object.entries(submissionProfiles).map(([name, display]) => (
                        <ListItemButton key={name} dense onClick={() => submit(name, true)}>
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
                <IconButton component={Link} to={`/file/detail/${sha256}`} size="large">
                  <DescriptionOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            {currentUser.roles.includes('submission_view') && (
              <Tooltip title={t('related')}>
                <IconButton
                  component={Link}
                  to={`/search/submission?query=files.sha256:${sha256} OR results:${sha256}* OR errors:${sha256}*`}
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
            onChange={(_event, value) =>
              navigate(`/file/viewer/${sha256}/${value}/${location.search}${location.hash}`, { replace: true })
            }
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
    </PageFullSize>
  ) : (
    <ForbiddenPage />
  );
};

export const FileViewer = React.memo(props => (
  <SelectionProvider>
    <WrappedFileViewer {...props} />
  </SelectionProvider>
));

export default FileViewer;
