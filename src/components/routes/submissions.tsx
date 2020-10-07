import { CircularProgress, Tooltip, useTheme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import SubmissionState from 'components/visual/SubmissionState';
import Verdict from 'components/visual/Verdict';
import 'moment/locale/fr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useHistory } from 'react-router-dom';

export default function Submissions() {
  const { t, i18n } = useTranslation(['submissions']);
  const [submissions, setSubmissions] = useState(null);
  const history = useHistory();
  const theme = useTheme();
  const apiCall = useMyAPI();

  function handleClick(submission) {
    if (submission.state === 'completed') {
      history.push(`/submission/${submission.id}`);
    } else {
      history.push(`/submission/detail/${submission.id}`);
    }
  }

  useEffect(() => {
    apiCall({
      method: 'POST',
      url: '/api/v4/search/submission/',
      body: { query: '*', rows: 200 },
      onSuccess: api_data => {
        setSubmissions(api_data.api_response.items);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageFullWidth>
      <div style={{ paddingBottom: theme.spacing(8) }}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography variant="subtitle1" color="secondary">
          {submissions !== null && `${submissions.length} ${t('subtitle')}`}
        </Typography>
      </div>

      {submissions !== null ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow style={{ whiteSpace: 'nowrap' }}>
                <TableCell>{t('header.starttime')}</TableCell>
                <TableCell>{t('header.verdict')}</TableCell>
                <TableCell>{t('header.description')}</TableCell>
                <TableCell>{t('header.user')}</TableCell>
                <TableCell>{t('header.numfiles')}</TableCell>
                <TableCell>{t('header.classification')}</TableCell>
                <TableCell>{t('header.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission.id} onClick={() => handleClick(submission)} hover>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title={submission.times.submitted}>
                      <Moment fromNow locale={i18n.language}>
                        {submission.times.submitted}
                      </Moment>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Verdict score={submission.max_score} />
                  </TableCell>
                  <TableCell style={{ wordBreak: 'break-all' }}>{submission.params.description}</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{submission.params.submitter}</TableCell>
                  <TableCell>{submission.file_count}</TableCell>
                  <TableCell>
                    <Classification type="text" size="tiny" c12n={submission.classification} format="short" />
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <SubmissionState state={submission.state} error_count={submission.error_count} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <CircularProgress />
        </div>
      )}
    </PageFullWidth>
  );
}
