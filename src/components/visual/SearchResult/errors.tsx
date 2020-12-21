import { Tooltip, useTheme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow } from 'components/visual/DivTable';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import InformativeAlert from '../InformativeAlert';

export type ErrorResult = {
  created: string;
  id: string;
  response: {
    message: string;
    service_debug_info: string;
    service_name: string;
    service_tool_version: string;
    service_version: string;
    status: string;
  };
  sha256: string;
  type: string;
};

type SearchResults = {
  items: ErrorResult[];
  rows: number;
  offset: number;
  total: number;
};

type ErrorsTableProps = {
  errorResults: SearchResults;
  onClick: (error: ErrorResult) => void;
};

const WrappedErrorsTable: React.FC<ErrorsTableProps> = ({ errorResults, onClick }) => {
  const { t, i18n } = useTranslation(['adminErrorViewer']);
  const theme = useTheme();

  const errorMap = {
    'MAX DEPTH REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'MAX RETRY REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
    EXCEPTION: <ReportProblemOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'TASK PRE-EMPTED': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'SERVICE DOWN': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'SERVICE BUSY': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'MAX FILES REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
    UNKNOWN: <ReportProblemOutlinedIcon style={{ color: theme.palette.action.active }} />
  };

  return errorResults ? (
    errorResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable size="small">
          <DivTableHead>
            <DivTableRow style={{ whiteSpace: 'nowrap' }}>
              <DivTableCell>{t('header.time')}</DivTableCell>
              <DivTableCell>{t('header.service')}</DivTableCell>
              <DivTableCell>{t('header.message')}</DivTableCell>
              <DivTableCell>{t('header.type')}</DivTableCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {errorResults.items.map(error => (
              <DivTableRow key={error.id} hover onClick={() => onClick(error)} style={{ cursor: 'pointer' }}>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={error.created}>
                    <Moment fromNow locale={i18n.language}>
                      {error.created}
                    </Moment>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>{error.response.service_name}</DivTableCell>
                <DivTableCell>{error.response.message}</DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={t(`type.${error.type}`)}>
                    <span>{errorMap[error.type]}</span>
                  </Tooltip>
                </DivTableCell>
              </DivTableRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_errors_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const ErrorsTable = React.memo(WrappedErrorsTable);
export default ErrorsTable;
