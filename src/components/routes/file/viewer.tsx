import { loader } from '@monaco-editor/react';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import { Grid, IconButton, Paper, Skeleton, Tab as MuiTab, Tabs, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import Empty from 'components/visual/Empty';
import FileDownloader from 'components/visual/FileDownloader';
import { ASCIISection, HexSection, ImageSection, StringsSection } from 'components/visual/FileViewer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

export type Tab = 'ascii' | 'strings' | 'hex' | 'image';

export const TAB_OPTIONS: Tab[] = ['ascii', 'strings', 'hex', 'image'];

export const DEFAULT_TAB: Tab = 'ascii';

type ParamProps = {
  id: string;
  tab: Tab;
};

type Props = {};

const WrappedFileViewer: React.FC<Props> = () => {
  const { t } = useTranslation(['fileViewer']);
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const { apiCall } = useMyAPI();
  const { id, tab: paramTab } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [type, setType] = useState<string>('unknown');
  const [imageAllowed, setImageAllowed] = useState<boolean>(false);

  const sha256 = useMemo<string>(() => id, [id]);

  const tab = useMemo(
    () =>
      sha256 && (!paramTab || !TAB_OPTIONS.includes(paramTab) || (!imageAllowed && paramTab === 'image'))
        ? DEFAULT_TAB
        : paramTab,
    [imageAllowed, paramTab, sha256]
  );

  const handleChangeTab = useCallback(
    (event, newTab) => {
      if (tab !== newTab && TAB_OPTIONS.includes(newTab))
        navigate(`/file/viewer/${sha256}/${newTab}/${location.search}${location.hash}`, { replace: true });
    },
    [location?.hash, location?.search, navigate, sha256, tab]
  );

  useEffect(() => {
    if (!sha256 || !currentUser.roles.includes('file_detail')) return;
    apiCall({
      url: `/api/v4/file/info/${sha256}/`,
      onSuccess: api_data => {
        setType(api_data.api_response.type);
        setImageAllowed(api_data.api_response.is_section_image === true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.roles, id]);

  useEffect(() => {
    if (paramTab !== tab) {
      navigate(`/file/viewer/${sha256}/${tab}/${location.search}${location.hash}`);
    }
  }, [location?.hash, location?.search, navigate, paramTab, sha256, tab]);

  return currentUser.roles.includes('file_detail') ? (
    <PageFullSize margin={4}>
      <Grid container alignItems="center">
        <Grid item xs>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
            {id}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={4} style={{ textAlign: 'right', flexGrow: 0 }}>
          <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
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
      {sha256 && tab !== null ? (
        <div className={classes.main}>
          <Paper square style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(1) }}>
            <Tabs
              value={tab}
              onChange={handleChangeTab}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <MuiTab label={t('ascii')} value="ascii" />
              <MuiTab label={t('strings')} value="strings" />
              <MuiTab label={t('hex')} value="hex" />
              {imageAllowed ? <MuiTab label={t('image')} value="image" /> : <Empty />}
            </Tabs>
          </Paper>

          {tab === 'ascii' && (
            <div className={classes.tab} style={{ display: tab === 'ascii' ? 'contents' : 'none' }}>
              <ASCIISection sha256={sha256} type={type} visible={tab === 'ascii'} />
            </div>
          )}
          {tab === 'strings' && (
            <div className={classes.tab} style={{ display: tab === 'strings' ? 'contents' : 'none' }}>
              <StringsSection sha256={sha256} type={type} visible={tab === 'strings'} />
            </div>
          )}
          {tab === 'hex' && (
            <div className={classes.tab} style={{ display: tab === 'hex' ? 'contents' : 'none' }}>
              <HexSection sha256={sha256} visible={tab === 'hex'} />
            </div>
          )}
          {tab === 'image' && (
            <div className={classes.tab} style={{ display: tab === 'image' ? 'contents' : 'none' }}>
              <ImageSection sha256={sha256} name={sha256} visible={tab === 'image'} />
            </div>
          )}
        </div>
      ) : (
        <Skeleton
          variant="rectangular"
          height={theme.spacing(6)}
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      )}
    </PageFullSize>
  ) : (
    <ForbiddenPage />
  );
};

export const FileViewer = React.memo(WrappedFileViewer);

export default FileViewer;
