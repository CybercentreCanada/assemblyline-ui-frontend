import { Alert, CircularProgress, Tooltip, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AIMarkdown from '../AiMarkdown';

const useStyles = makeStyles(theme => ({
  spinner: {
    textAlign: 'center',
    position: 'relative',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  watermark: {
    float: 'right',
    color: theme.palette.text.disabled,
    fontSize: 'smaller',
    cursor: 'pointer'
  }
}));

type Props = {
  sha256: string;
  archiveOnly?: boolean;
};

const WrappedCodeSection: React.FC<Props> = ({ sha256, archiveOnly = false }) => {
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { t } = useTranslation(['fileViewer']);
  const classes = useStyles();
  const theme = useTheme();

  const [analysing, setAnalysing] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [codeSummary, setCodeSummary] = useState(null);
  const [codeTruncated, setCodeTruncated] = useState(false);

  const getCodeSummary = useCallback(
    noCache => {
      const params = [];
      if (noCache) {
        params.push('no_cache');
      }
      if (archiveOnly) {
        params.push('archive_only');
      }
      apiCall({
        allowCache: !noCache,
        url: `/api/v4/file/code_summary/${sha256}/${noCache ? '?no_cache' : ''}`,
        onSuccess: api_data => {
          if (codeError !== null) setCodeError(null);
          setCodeSummary(api_data.api_response.content);
          setCodeTruncated(api_data.api_response.truncated);
        },
        onFailure: api_data => {
          setCodeError(api_data.api_error_message);
          if (codeSummary !== null) {
            setCodeSummary(null);
            setCodeTruncated(false);
          }
        },
        onEnter: () => setAnalysing(true),
        onExit: () => setAnalysing(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeSummary, codeError, sha256]
  );

  useEffect(() => {
    if (!codeSummary) {
      getCodeSummary(false);
    }
    return () => {
      setCodeError(null);
      setCodeSummary(null);
      setCodeTruncated(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  if (!currentUser.roles.includes('file_detail')) return <ForbiddenPage />;
  return (
    <>
      <div style={{ flexGrow: 1, marginTop: !analysing && !codeError ? theme.spacing(-4) : null }}>
        {analysing ? (
          <div className={classes.spinner}>
            <div style={{ paddingBottom: theme.spacing(2) }}>{t('analysing_code')}</div>
            <CircularProgress variant="indeterminate" />
          </div>
        ) : codeError ? (
          <Alert severity="error">{codeError}</Alert>
        ) : (
          <AIMarkdown markdown={codeSummary} truncated={codeTruncated} />
        )}
      </div>
      {!analysing && (codeSummary || codeError) && (
        <div>
          <Tooltip title={t('powered_by_ai.tooltip')} placement="top-end">
            <div className={classes.watermark} onClick={() => getCodeSummary(true)}>
              {t('powered_by_ai')}
            </div>
          </Tooltip>
        </div>
      )}
    </>
  );
};

export const CodeSection = React.memo(WrappedCodeSection);
export default CodeSection;
