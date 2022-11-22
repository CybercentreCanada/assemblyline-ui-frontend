import { Tooltip, useTheme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import ArchiveOutlinedIcon from '@material-ui/icons/ArchiveOutlined';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import Verdict from 'components/visual/Verdict';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from '../DivTable';
import InformativeAlert from '../InformativeAlert';

export type ResultResult = {
  classification: string;
  created: number;
  drop_file: boolean;
  from_archive: boolean;
  id: string;
  response: {
    service_name: string;
    service_tool_version: string;
  };
  result: {
    score: number;
  };
  type: number;
};

type SearchResults = {
  items: ResultResult[];
  total: number;
};

type ResultsTableProps = {
  resultResults: SearchResults;
  allowSort?: boolean;
};

const WrappedResultsTable: React.FC<ResultsTableProps> = ({ resultResults, allowSort = true }) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();
  const theme = useTheme();

  return resultResults ? (
    resultResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="created" allowSort={allowSort}>
                {t('header.created')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="result.score" allowSort={allowSort}>
                {t('header.verdict')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="id" allowSort={allowSort}>
                {t('header.sha256')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="type" allowSort={allowSort}>
                {t('header.filetype')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="response.service_name" allowSort={allowSort}>
                {t('header.service')}
              </SortableHeaderCell>
              {c12nDef.enforce && (
                <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                  {t('header.classification')}
                </SortableHeaderCell>
              )}
              <DivTableCell />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {resultResults.items.map(result => (
              <LinkRow
                key={result.id}
                component={Link}
                to={`/file/detail/${result.id.substring(0, 64)}`}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell>
                  <Tooltip title={result.created}>
                    <Moment fromNow locale={i18n.language}>
                      {result.created}
                    </Moment>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>
                  <Verdict score={result.result.score} fullWidth />
                </DivTableCell>
                <DivTableCell breakable>{result.id.substring(0, 64)}</DivTableCell>
                <DivTableCell style={{ color: result.type ? null : theme.palette.text.disabled }}>
                  {result.type || t('na')}
                </DivTableCell>
                <DivTableCell>{result.response.service_name}</DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={result.classification} format="short" />
                  </DivTableCell>
                )}
                <DivTableCell style={{ textAlign: 'center' }}>
                  {result.from_archive && (
                    <Tooltip title={t('archive')}>
                      <ArchiveOutlinedIcon />
                    </Tooltip>
                  )}
                </DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_results_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const ResultsTable = React.memo(WrappedResultsTable);
export default ResultsTable;
