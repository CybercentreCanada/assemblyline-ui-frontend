import { loader } from '@monaco-editor/react';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import WrapTextOutlinedIcon from '@mui/icons-material/WrapTextOutlined';
import { Grid, IconButton, Skeleton, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useAssistant from 'components/hooks/useAssistant';
import useMyAPI from 'components/hooks/useMyAPI';
import type { File } from 'components/models/base/file';
import type { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import FileDownloader from 'components/visual/FileDownloader';
import { ASCIISection, HexSection, ImageSection, StringsSection } from 'components/visual/FileViewer';
import CodeSection from 'components/visual/FileViewer/code_summary';
import { TabContainer } from 'components/visual/TabContainer';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Link, useLocation, useParams } from 'react-router-dom';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

const useStyles = makeStyles(theme => ({
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

export type Tab = 'ascii' | 'code' | 'strings' | 'hex' | 'image';

export const TAB_OPTIONS: Tab[] = ['ascii', 'code', 'strings', 'hex', 'image'];

export const DEFAULT_TAB: Tab = 'ascii';

type ParamProps = {
  id: string;
  tab: Tab;
};

const WrappedFileViewer = () => {
  const { t } = useTranslation(['fileViewer']);
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const { addInsight, removeInsight } = useAssistant();
  const { apiCall } = useMyAPI();
  const { configuration } = useALContext();
  const { id: sha256, tab: paramTab } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [type, setType] = useState<string>('unknown');
  const [codeAllowed, setCodeAllowed] = useState<boolean>(false);
  const [imageAllowed, setImageAllowed] = useState<boolean>(null);
  const [wordwrap, setWordwrap] = useState<'on' | 'off'>('off');
  const [dataTruncated, setDataTruncated] = useState<boolean>(false);

  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

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
        <Grid size={{ xs: 12 }}>
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
            {currentUser.roles.includes('file_download') && (
              <FileDownloader
                icon={<GetAppOutlinedIcon />}
                link={`/api/v4/file/download/${sha256}/`}
                tooltip={t('download')}
              />
            )}
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
        <div className={classes.main}>
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
                  <div className={classes.tab}>
                    <ASCIISection
                      sha256={sha256}
                      type={type}
                      codeAllowed={codeAllowed}
                      options={{ wordWrap: wordwrap }}
                      onDataTruncated={setDataTruncated}
                    />
                  </div>
                )
              },
              code: {
                label: t('code'),
                inner: (
                  <div className={classes.tab}>
                    <CodeSection sha256={sha256} />
                  </div>
                ),
                preventRender: isMdUp || !codeAllowed
              },
              strings: {
                label: t('strings'),
                inner: (
                  <div className={classes.tab}>
                    <StringsSection
                      sha256={sha256}
                      type={type}
                      options={{ wordWrap: wordwrap }}
                      onDataTruncated={setDataTruncated}
                    />
                  </div>
                )
              },
              hex: {
                label: t('hex'),
                inner: (
                  <div className={classes.tab}>
                    <HexSection sha256={sha256} onDataTruncated={setDataTruncated} />
                  </div>
                )
              },
              image: {
                label: t('image'),
                preventRender: !imageAllowed,
                inner: (
                  <div className={classes.tab}>
                    <ImageSection sha256={sha256} name={sha256} />
                  </div>
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

export const FileViewer = React.memo(WrappedFileViewer);

export default FileViewer;
