/* eslint-disable react/jsx-no-undef */
import { createStyles, fade, Theme, Tooltip, withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Alert, AlertTitle } from '@material-ui/lab';
import Classification from 'components/visual/Classification';
import SubmissionState from 'components/visual/SubmissionState';
import Verdict from 'components/visual/Verdict';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: '8px',
      paddingLeft: '8px'
    },
    head: {
      backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#EEE'
    },
    body: {
      wordBreak: 'break-word'
    }
  })
)(TableCell);

const InformativeAlert = withStyles((theme: Theme) =>
  createStyles({
    root: {
      marginbottom: theme.spacing(2),
      marginTop: theme.spacing(4),
      color: theme.palette.text.secondary,
      backgroundColor: fade(theme.palette.text.primary, 0.04)
    },
    icon: {
      color: `${theme.palette.text.secondary} !important`
    }
  })
)(Alert);

const DivTD = ({ children, ...other }) => {
  return (
    <StyledTableCell {...other} component="div">
      {children}
    </StyledTableCell>
  );
};

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

type SubmissionsTableProps = {
  submissions: SubmissionResult[];
};

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({ submissions }) => {
  const { t, i18n } = useTranslation(['submissions']);

  return submissions.length !== 0 ? (
    <TableContainer component={Paper}>
      <Table component="div" size="small">
        <TableHead component="div">
          <TableRow component="div" style={{ whiteSpace: 'nowrap' }}>
            <DivTD>{t('header.starttime')}</DivTD>
            <DivTD>{t('header.verdict')}</DivTD>
            <DivTD>{t('header.description')}</DivTD>
            <DivTD>{t('header.user')}</DivTD>
            <DivTD>{t('header.numfiles')}</DivTD>
            <DivTD>{t('header.classification')}</DivTD>
            <DivTD>{t('header.status')}</DivTD>
          </TableRow>
        </TableHead>
        <TableBody component="div">
          {submissions.map(submission => (
            <TableRow
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
              <DivTD>
                <Tooltip title={submission.times.submitted}>
                  <Moment fromNow locale={i18n.language}>
                    {submission.times.submitted}
                  </Moment>
                </Tooltip>
              </DivTD>
              <DivTD>
                <Verdict score={submission.max_score} />
              </DivTD>
              <DivTD>
                {submission.params.description.length > 150
                  ? `${submission.params.description.substr(0, 147)}...`
                  : submission.params.description}
              </DivTD>
              <DivTD style={{ whiteSpace: 'nowrap' }}>{submission.params.submitter}</DivTD>
              <DivTD>{submission.file_count}</DivTD>
              <DivTD>
                <Classification type="text" size="tiny" c12n={submission.classification} format="short" />
              </DivTD>
              <DivTD style={{ textAlign: 'center' }}>
                <SubmissionState state={submission.state} error_count={submission.error_count} />
              </DivTD>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <div style={{ width: '100%' }}>
      <InformativeAlert severity="info">
        <AlertTitle>{t('no_results_title')}</AlertTitle>
        {t('no_results_desc')}
      </InformativeAlert>
    </div>
  );
};

export default SubmissionsTable;
