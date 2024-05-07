import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { AlertTitle, Skeleton, Tooltip, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import type { Error, ErrorType } from 'components/models/base/error';
import type { SearchResult } from 'components/models/ui/search';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import { bytesToSize } from 'helpers/utils';
import 'moment/locale/fr';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import InformativeAlert from '../InformativeAlert';

const MAX_MESSAGE_SIZE = 2500;

type Props = {
  errorResults: SearchResult<Error>;
  setErrorKey?: (key: string) => void;
  allowSort?: boolean;
};

const WrappedErrorsTable: React.FC<Props> = ({ errorResults, setErrorKey = null, allowSort = true }) => {
  const { t, i18n } = useTranslation(['adminErrorViewer']);
  const theme = useTheme();

  const errorMap: Record<ErrorType, ReactElement> = {
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
              <SortableHeaderCell sortField="created" allowSort={allowSort}>
                {t('header.time')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="response.service_name" allowSort={allowSort}>
                {t('header.service')}
              </SortableHeaderCell>
              <DivTableCell>{t('header.message')}</DivTableCell>
              <SortableHeaderCell sortField="type" allowSort={allowSort}>
                {t('header.type')}
              </SortableHeaderCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {errorResults.items.map(error => (
              <LinkRow
                key={error.id}
                component={Link}
                to={`/admin/errors/${error.id}`}
                onClick={event => {
                  if (setErrorKey) {
                    event.preventDefault();
                    setErrorKey(error.id);
                  }
                }}
                hover
              >
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={error.created}>
                    <>
                      <Moment fromNow locale={i18n.language}>
                        {error.created}
                      </Moment>
                    </>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>{error.response.service_name}</DivTableCell>
                <DivTableCell style={{ wordBreak: 'break-word' }}>
                  {error.response.message.length > MAX_MESSAGE_SIZE ? (
                    <>
                      <span>{error.response.message.slice(0, MAX_MESSAGE_SIZE)}... </span>
                      <span style={{ color: theme.palette.secondary.main }}>{`(${bytesToSize(
                        new Blob([error.response.message.slice(MAX_MESSAGE_SIZE)]).size
                      )} ${t('more')})`}</span>
                    </>
                  ) : (
                    <span>{error.response.message}</span>
                  )}
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={t(`type.${error.type}`)}>
                    <span>{errorMap[error.type]}</span>
                  </Tooltip>
                </DivTableCell>
              </LinkRow>
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
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const ErrorsTable = React.memo(WrappedErrorsTable);
export default ErrorsTable;
