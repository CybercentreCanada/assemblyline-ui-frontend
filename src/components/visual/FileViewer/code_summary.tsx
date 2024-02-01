import { Alert, LinearProgress, Tooltip, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AIMarkdown from '../AiMarkdown';

const useStyles = makeStyles(theme => ({
  watermark: {
    float: 'right',
    color: theme.palette.text.disabled,
    fontSize: 'smaller',
    cursor: 'pointer'
  }
}));

type Props = {
  sha256: string;
};

const WrappedCodeSection: React.FC<Props> = ({ sha256 }) => {
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { t } = useTranslation(['fileViewer']);
  const classes = useStyles();
  const theme = useTheme();

  const [codeError, setCodeError] = useState(null);
  const [codeSummary, setCodeSummary] = useState(null);
  const [codeTruncated, setCodeTruncated] = useState(false);

  useEffect(() => {
    if (!codeSummary) {
      apiCall({
        allowCache: true,
        url: `/api/v4/file/code_summary/${sha256}/`,
        onSuccess: api_data => {
          if (codeError !== null) setCodeError(null);
          setCodeSummary(api_data.api_response.content);
          setCodeTruncated(api_data.api_response.truncated);
        },
        onFailure: api_data => {
          setCodeError(api_data.api_error_message);
          setCodeSummary(null);
          setCodeTruncated(false);
        }
      });
    }
    return () => {
      setCodeSummary(null);
      setCodeTruncated(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  if (!currentUser.roles.includes('file_detail')) return <ForbiddenPage />;
  else if (codeError) return <Alert severity="error">{codeError}</Alert>;
  else if (!codeSummary) return <LinearProgress />;
  else
    return (
      <div
        style={{
          padding: theme.spacing(1),
          marginTop: !codeError ? theme.spacing(-4) : null
        }}
      >
        <AIMarkdown markdown={codeSummary} truncated={codeTruncated} />
        <div>
          <Tooltip title={t('powered_by_ai.tooltip')} placement="top-end">
            <div className={classes.watermark} style={{ paddingBottom: theme.spacing(1) }}>
              {t('powered_by_ai')}
            </div>
          </Tooltip>
        </div>
      </div>
    );
};

export const CodeSection = React.memo(WrappedCodeSection);
export default CodeSection;
