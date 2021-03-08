import { Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import Classification from 'components/visual/Classification';
import SubmissionState from 'components/visual/SubmissionState';
import Verdict from 'components/visual/Verdict';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from '../DivTable';
import InformativeAlert from '../InformativeAlert';

export type SubmissionResult = {
  classification: string;
  error_count: number;
  file_count: number;
  id: string;
  max_score: number;
  params: {
    description: string;
    submitter: string;
  };
  sid: string;
  state: string;
  times: {
    submitted: string;
  };
};

type SearchResults = {
  items: SubmissionResult[];
  total: number;
};

type SubmissionsTableProps = {
  submissionResults: SearchResults;
};

const WrappedSubmissionsTable: React.FC<SubmissionsTableProps> = ({ submissionResults }) => {
  const { t, i18n } = useTranslation(['search']);

  return submissionResults ? (
    submissionResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.starttime')}</DivTableCell>
              <DivTableCell>{t('header.verdict')}</DivTableCell>
              <DivTableCell>{t('header.description')}</DivTableCell>
              <DivTableCell>{t('header.user')}</DivTableCell>
              <DivTableCell>{t('header.numfiles')}</DivTableCell>
              <DivTableCell>{t('header.classification')}</DivTableCell>
              <DivTableCell>{t('header.status')}</DivTableCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {submissionResults.items.map(submission => (
              <LinkRow
                key={submission.id}
                component={Link}
                to={
                  submission.state === 'completed'
                    ? `/submission/${submission.id}`
                    : `/submission/detail/${submission.id}`
                }
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell>
                  <Tooltip title={submission.times.submitted}>
                    <Moment fromNow locale={i18n.language}>
                      {submission.times.submitted}
                    </Moment>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>
                  <Verdict score={submission.max_score} fullWidth />
                </DivTableCell>
                <DivTableCell>
                  {submission.params.description.length > 150
                    ? `${submission.params.description.substr(0, 147)}...`
                    : submission.params.description}
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>{submission.params.submitter}</DivTableCell>
                <DivTableCell>{submission.file_count}</DivTableCell>
                <DivTableCell>
                  <Classification type="text" size="tiny" c12n={submission.classification} format="short" />
                </DivTableCell>
                <DivTableCell style={{ textAlign: 'center' }}>
                  <SubmissionState state={submission.state} error_count={submission.error_count} />
                </DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_submissions_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const SubmissionsTable = React.memo(WrappedSubmissionsTable);
export default SubmissionsTable;
