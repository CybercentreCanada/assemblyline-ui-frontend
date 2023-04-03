import { Button, CircularProgress, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import { RetrohuntAdd, RetrohuntPageType, RetrohuntResults, RetrohuntView, RetrohuntYara } from './components';

type ParamProps = {
  code: string;
};

export type Retrohunt = {
  code: any;
  creator: any;
  tags: any;
  description: any;
  created: any;
  classification: any;
  yara_signature: any;
  raw_query: any;
  total_indices: any;
  pending_indices: any;
  pending_candidates: any;
  errors: any;
  hits: any;
  finished: any;
  truncated: any;
  archive_only?: boolean;
};

type RetrohuntPageState = 'loading' | 'view' | 'add' | 'error' | 'forbidden';

type Props = {
  pageType?: RetrohuntPageType;
  retrohuntCode: string;
  close?: () => void;
};

function WrappedRetrohuntDetail({ retrohuntCode = null, pageType = 'page', close = () => null }: Props) {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();

  const { c12nDef } = useALContext();
  const { code: paramCode } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<Retrohunt>(null);
  const [code, setCode] = useState<string>(paramCode || retrohuntCode);
  const [type, setType] = useState<RetrohuntPageState>('loading');
  const [modified, setModified] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);

  const DEFAULT_RETROHUNT = useMemo<Retrohunt>(
    () => ({
      code: null,
      creator: null,
      tags: {},
      description: '',
      created: '',
      classification: c12nDef.UNRESTRICTED,
      yara_signature: [
        'rule my_rule {',
        '\tmeta:',
        '\t\tKEY = "VALUE"',
        '\tstrings:',
        '\t\t$name = "string"',
        '\tcondition:',
        '\t\tany of them',
        '}'
      ].join('\n'),
      raw_query: null,
      total_indices: 0,
      pending_indices: 0,
      pending_candidates: 0,
      errors: [],
      hits: [],
      finished: false,
      truncated: false,
      archive_only: false
    }),
    [c12nDef.UNRESTRICTED]
  );

  useEffect(() => {
    retrohuntCode ? setCode(retrohuntCode) : paramCode ? setCode(paramCode) : setCode(null);
  }, [paramCode, retrohuntCode]);

  useEffect(() => {
    if (code === 'new' && currentUser.roles.includes('retrohunt_run')) {
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
  }, [DEFAULT_RETROHUNT, code, currentUser.roles]);

  const onRetrohuntChange = useCallback((newRetrohunt: Partial<Retrohunt>) => {
    setRetrohunt(rh => ({ ...rh, ...newRetrohunt }));
    setModified(true);
  }, []);

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
        const newCode: string = api_data.api_response?.code ? api_data.api_response?.code : 'new';
        setRetrohunt({ ...api_data.api_response });
        setConfirmationOpen(false);
        setType('view');
        setModified(false);
        setCode(newCode);
        setTimeout(() => {
          navigate(`${location.pathname}${location.search ? location.search : ''}#${newCode}`);
          window.dispatchEvent(new CustomEvent('reloadRetrohunts'));
        }, 100);
      },
      onFailure: api_data => showErrorMessage(api_data.api_error_message),
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.roles, location, navigate, retrohunt, showErrorMessage]);

  if (type === 'error') return <NotFoundPage />;
  else if (type === 'forbidden') return <ForbiddenPage />;
  else
    return (
      <PageFullSize margin={pageType === 'page' ? 4 : 2}>
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

        {c12nDef.enforce && ['add', 'view'].includes(type) && (
          <Grid container flexDirection="column" style={{ paddingBottom: theme.spacing(4) }}>
            <Classification
              format="long"
              type={type === 'add' ? 'picker' : 'pill'}
              c12n={retrohunt && 'classification' in retrohunt ? retrohunt.classification : null}
              setClassification={(c12n: string) => onRetrohuntChange({ classification: c12n })}
              disabled={!currentUser.roles.includes('retrohunt_run')}
            />
          </Grid>
        )}

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
                <Button
                  variant="contained"
                  color="primary"
                  disabled={buttonLoading || !retrohunt?.description || !retrohunt?.yara_signature}
                  onClick={() => onCreateRetrohunt()}
                >
                  {t('add.button')}
                  {buttonLoading && (
                    <CircularProgress
                      size={24}
                      style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }}
                    />
                  )}
                </Button>
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
          <Grid container flex={1} paddingTop={theme.spacing(2)} flexDirection="column" minHeight="500px">
            <Typography variant="subtitle2" children={t('details.results')} />
            <RetrohuntResults data={JSON.stringify(retrohunt ? retrohunt : {})} isEditable={false} beautify={true} />
          </Grid>
        )}

        <Grid
          container
          flex={1}
          paddingTop={theme.spacing(2)}
          paddingBottom={theme.spacing(2)}
          flexDirection="column"
          minHeight="500px"
        >
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
