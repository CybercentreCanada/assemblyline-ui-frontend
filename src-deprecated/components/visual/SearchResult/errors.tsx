import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
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
import InformativeAlert from 'components/visual/InformativeAlert';
import Moment from 'components/visual/Moment';
import { bytesToSize } from 'helpers/utils';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const MAX_MESSAGE_SIZE = 2500;

type Props = {
  errorResults: SearchResult<Error>;
  setErrorKey?: (key: string) => void;
  allowSort?: boolean;
};

const WrappedErrorsTable: React.FC<Props> = ({ errorResults, setErrorKey = null, allowSort = true }) => {
  const { t } = useTranslation(['adminErrorViewer']);
  const theme = useTheme();

  const severityMap = useMemo<Record<Error['severity'], ReactElement>>(
    () => ({
      warning: <WarningAmberOutlinedIcon style={{ color: theme.palette.warning.main }} />,
      error: <ErrorOutlineOutlinedIcon style={{ color: theme.palette.error.main }} />
    }),
    [theme.palette.error.main, theme.palette.warning.main]
  );

  const typeMap = useMemo<Record<ErrorType, ReactElement>>(
    () => ({
      'MAX DEPTH REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
      'MAX RETRY REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
      EXCEPTION: <ReportProblemOutlinedIcon style={{ color: theme.palette.action.active }} />,
      'TASK PRE-EMPTED': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
      'SERVICE DOWN': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
      'SERVICE BUSY': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
      'MAX FILES REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
      UNKNOWN: <ReportProblemOutlinedIcon style={{ color: theme.palette.action.active }} />
    }),
    [theme.palette.action.active]
  );

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
              <SortableHeaderCell sortField="severity" allowSort={allowSort}>
                {t('header.severity')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="type" allowSort={allowSort}>
                {t('header.type')}
              </SortableHeaderCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {errorResults.items.map((error, i) => (
              <LinkRow
                key={`${error.id}-${i}`}
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
                    <div>
                      <Moment variant="fromNow">{error.created}</Moment>
                    </div>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>{error.response.service_name}</DivTableCell>
                <DivTableCell style={{ wordBreak: 'break-word' }}>
                  {error.response.message.length > MAX_MESSAGE_SIZE ? (
                    <>
                      <span>{error.response.message.slice(0, MAX_MESSAGE_SIZE)}... </span>
                      <span style={{ color: theme.palette.secondary.main }}>
                        {`(${bytesToSize(
                          new Blob([error.response.message.slice(MAX_MESSAGE_SIZE)]).size
                        )} ${t('more')})`}
                      </span>
                    </>
                  ) : (
                    <span>{error.response.message}</span>
                  )}
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={t(`severity.${error.severity}`)}>
                    <span>{severityMap?.[error?.severity]}</span>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={t(`type.${error.type}`)}>
                    <span>{typeMap?.[error?.type]}</span>
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
