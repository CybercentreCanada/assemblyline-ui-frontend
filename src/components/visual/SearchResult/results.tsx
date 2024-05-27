import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { AlertTitle, Skeleton, Tooltip, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import Moment from 'components/visual/Moment';
import Verdict from 'components/visual/Verdict';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
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
  component?: any;
  allowSort?: boolean;
};

const WrappedResultsTable: React.FC<ResultsTableProps> = ({ resultResults, component = Paper, allowSort = true }) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();
  const theme = useTheme();
  const location = useLocation();

  return resultResults ? (
    resultResults.total !== 0 ? (
      <TableContainer component={component}>
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
            {resultResults.items.map((result, id) => (
              <LinkRow
                key={id}
                component={Link}
                to={`/file/detail/${result.id.substring(0, 64)}${location.hash}`}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell>
                  <Tooltip title={result.created}>
                    <div>
                      <Moment variant="fromNow">{result.created}</Moment>
                    </div>
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
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const ResultsTable = React.memo(WrappedResultsTable);
export default ResultsTable;
