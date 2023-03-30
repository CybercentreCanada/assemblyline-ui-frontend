import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import { Grid, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import {
  DEFAULT_RETROHUNT,
  Retrohunt,
  RetrohuntAdd,
  RetrohuntResults,
  RetrohuntView,
  RetrohuntYara
} from './components';

type ParamProps = {
  code: string;
};

type RetrohuntPageType = 'page' | 'drawer';
type RetrohuntPageState = 'loading' | 'view' | 'add' | 'error' | 'forbidden';

type Props = {
  pageType?: RetrohuntPageType;
  retrohuntCode: string;
  close?: () => void;
};

function WrappedRetrohuntDetail({ retrohuntCode = null, close = () => null, pageType = 'drawer' }: Props) {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();

  const { code: paramCode } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<Retrohunt>(null);
  const [code, setCode] = useState<string>(paramCode || retrohuntCode);
  const [type, setType] = useState<RetrohuntPageState>('loading');
  const [modified, setModified] = useState<boolean>(false);
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);

  useEffect(() => {
    retrohuntCode ? setCode(retrohuntCode) : paramCode ? setCode(paramCode) : setCode(null);
  }, [paramCode, retrohuntCode]);

  useEffect(() => {
    if (!code && currentUser.roles.includes('retrohunt_run')) {
      setRetrohunt({ ...DEFAULT_RETROHUNT });
      setType('add');
    } else if (code && currentUser.roles.includes('retrohunt_view')) {
      apiCall({
        url: `/api/v4/retrohunt/${code}/`,
        onSuccess: api_data => {
          setRetrohunt({ ...api_data.api_response });
          setType('view');
        },
        onFailure: () => {
          setType('error');
        }
      });
    } else {
      setType('forbidden');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrohuntCode, code]);

  const onRetrohuntChange = useCallback((newRetrohunt: Partial<Retrohunt>) => {
    setRetrohunt(rh => ({ ...rh, ...newRetrohunt }));
    setModified(true);
  }, []);

  const onViewDetailedPage = useCallback(() => {
    navigate(`/retrohunt/${code}`);
  }, [code, navigate]);

  const onCancelRetrohuntConfirmation = useCallback(() => {
    setConfirmationOpen(false);
  }, []);

  const onCreateRetrohunt = useCallback(() => {
    if (!currentUser.roles.includes('retrohunt_run')) return;
    apiCall({
      url: `/api/v4/retrohunt/`,
      method: 'POST',
      body: {
        classification: retrohunt.classification,
        description: retrohunt.description,
        archive_only: retrohunt.archive_only ? retrohunt.archive_only : false,
        yara_signature: retrohunt.yara_signature
      },
      onSuccess: api_data => {
        setRetrohunt({ ...api_data.api_response });
        setConfirmationOpen(false);
        setType('view');
        setCode((api_data.api_response as Retrohunt)?.code);
      },
      onFailure: api_data => {
        showErrorMessage(api_data.api_error_message);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, retrohunt, showErrorMessage]);

  if (type === 'error') return <NotFoundPage />;
  else if (type === 'forbidden') return <ForbiddenPage />;
  else
    return (
      <PageFullSize margin={!code ? 2 : 4}>
        <RouterPrompt when={modified} />
        <ConfirmationDialog
          open={confirmationOpen}
          handleClose={event => setConfirmationOpen(false)}
          handleCancel={onCancelRetrohuntConfirmation}
          handleAccept={onCreateRetrohunt}
          title={t('validate.title')}
          cancelText={t('validate.cancelText')}
          acceptText={t('validate.acceptText')}
          text={t('validate.text')}
        />
        <Grid container flexDirection="row" spacing={0} paddingBottom={theme.spacing(0)}>
          <Grid item flexGrow={1}>
            {type === 'loading' && <Typography variant="h4" children={<Skeleton style={{ width: '20rem' }} />} />}
            {type === 'loading' && <Typography variant="caption" children={<Skeleton style={{ width: '20rem' }} />} />}
            {type === 'add' && <Typography variant="h4" children={t('header.add')} />}
            {type === 'view' && <Typography variant="h4" children={t('header.view')} />}
            {type === 'view' && <Typography variant="caption" children={retrohunt.code} />}
          </Grid>

          <Grid item>
            <div style={{ display: 'flex', marginBottom: theme.spacing(1) }}>
              {type === 'loading' && (
                <Skeleton
                  variant="circular"
                  style={{ margin: theme.spacing(0.5), height: '2.5rem', width: '2.5rem' }}
                />
              )}
              {type === 'add' && (
                <Tooltip title={t('tooltip.add')}>
                  <IconButton
                    onClick={() => setConfirmationOpen(true)}
                    style={{
                      color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                    }}
                    size="large"
                  >
                    <AddCircleOutlineOutlinedIcon />
                  </IconButton>
                </Tooltip>
              )}
              {type === 'view' && pageType === 'drawer' && (
                <Tooltip title={t('tooltip.view')}>
                  <IconButton
                    onClick={() => onViewDetailedPage()}
                    style={{ color: theme.palette.action.active }}
                    size="large"
                  >
                    <YoutubeSearchedForIcon />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </Grid>
        </Grid>

        <Grid container paddingTop={theme.spacing(2)} flexDirection="column">
          {type === 'loading' && <RetrohuntAdd />}
          {type === 'add' && <RetrohuntAdd retrohunt={retrohunt} onRetrohuntChange={onRetrohuntChange} />}
          {type === 'view' && <RetrohuntView retrohunt={retrohunt} />}
        </Grid>

        {type === 'view' && (
          <Grid container paddingTop={theme.spacing(2)} flexDirection="column" minHeight="500px">
            <Typography variant="subtitle2" children={t('details.results')} />
            <RetrohuntResults data={JSON.stringify(retrohunt ? retrohunt : {})} isEditable={false} beautify={true} />
          </Grid>
        )}

        <Grid container flex={1} paddingTop={theme.spacing(2)} flexDirection="column" minHeight="500px">
          <Typography variant="subtitle2" children={t('details.yara_signature')} />
          {type !== 'loading' && retrohunt && 'yara_signature' in retrohunt ? (
            <RetrohuntYara
              yara_signature={retrohunt.yara_signature}
              isEditable={type === 'add' ? true : false}
              onYaraSignatureChange={ys => setRetrohunt(r => ({ ...r, yara_signature: ys }))}
            />
          ) : (
            <Skeleton style={{ height: '10rem', transform: 'none', marginTop: theme.spacing(1) }} />
          )}
        </Grid>

        {/* <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('details.yara_signature')}</Typography>
            {retrohunt ? (
              <RetrohuntYara
                retrohunt={retrohunt}
                isReadyOnly={type === 'add' ? false : true}
                onYaraSignatureChange={ys => setRetrohunt(r => ({ ...r, yara_signature: ys }))}
              />
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
        </Grid> */}

        {/* <Grid item flex={1} height="100%" paddingTop={theme.spacing(2)}>
          <Typography variant="subtitle2" children={t('details.yara_signature')} />
          <RetrohuntYara
            retrohunt={retrohunt}
            isReadyOnly={type === 'add' ? false : true}
            onYaraSignatureChange={ys => setRetrohunt(r => ({ ...r, yara_signature: ys }))}
          />
        </Grid> */}

        {/* <Grid item flex={1} height="100%" paddingTop={theme.spacing(2)}>
          <RetrohuntYara
            retrohunt={retrohunt}
            isReadyOnly={type === 'add' ? false : true}
            onYaraSignatureChange={ys => setRetrohunt(r => ({ ...r, yara_signature: ys }))}
          />
        </Grid> */}

        {/* <Grid item flex={1} height="100%" paddingTop={theme.spacing(2)}>
          <RetrohuntYara
            retrohunt={retrohunt}
            isReadyOnly={type === 'add' ? false : true}
            onYaraSignatureChange={ys => setRetrohunt(r => ({ ...r, yara_signature: ys }))}
          />
        </Grid>

        {type === 'view' && (
          <Grid item flex={1} height="100%" paddingTop={theme.spacing(2)}>
            <RetrohuntResults retrohunt={retrohunt} />
          </Grid>
        )} */}
      </PageFullSize>
    );
}

export const RetrohuntDetail = React.memo(WrappedRetrohuntDetail);

WrappedRetrohuntDetail.defaultProps = {
  pageType: 'page',
  retrohuntCode: null,
  close: null
} as Props;

export default WrappedRetrohuntDetail;
