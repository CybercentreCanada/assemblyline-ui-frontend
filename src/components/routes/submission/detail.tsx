import { Grid, IconButton, Typography, useTheme } from '@material-ui/core';
import ChromeReaderModeOutlinedIcon from '@material-ui/icons/ChromeReaderModeOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

export default function SubmissionDetail() {
  const { t } = useTranslation(['submissionDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [submission, setSubmission] = useState(null);
  const apiCall = useMyAPI();
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  useEffect(() => {
    apiCall({
      url: `/api/v4/submission/${id}/`,
      onSuccess: api_data => {
        setSubmission(api_data.api_response);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter>
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: sp4, paddingTop: sp2 }}>
          <Classification size="tiny" c12n={submission ? submission.classification : null} />
        </div>
        <div style={{ paddingBottom: sp4 }}>
          <Grid container>
            <Grid item xs={12} sm>
              <div>
                <Typography variant="h4">{t('title')}</Typography>
                <Typography variant="caption">
                  {submission ? submission.sid : <Skeleton style={{ width: '10rem' }} />}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm>
              <div style={{ textAlign: 'right' }}>
                <Link to={`/submission/report/${submission ? submission.sid : id}`}>
                  <IconButton>
                    <ChromeReaderModeOutlinedIcon />
                  </IconButton>
                </Link>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </PageCenter>
  );
}
