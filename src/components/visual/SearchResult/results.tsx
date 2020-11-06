import { Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import Classification from 'components/visual/Classification';
import Verdict from 'components/visual/Verdict';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from '../DivTable';
import InformativeAlert from '../InformativeAlert';

export type ResultResult = {
  classification: string;
  created: number;
  drop_file: boolean;
  id: string;
  response: {
    service_name: string;
    service_tool_version: string;
  };
  result: {
    score: number;
  };
};

type SearchResults = {
  items: ResultResult[];
  total: number;
};

type ResultsTableProps = {
  resultResults: SearchResults;
};

const WrappedResultsTable: React.FC<ResultsTableProps> = ({ resultResults }) => {
  const { t, i18n } = useTranslation(['search']);

  return resultResults ? (
    resultResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.created')}</DivTableCell>
              <DivTableCell>{t('header.verdict')}</DivTableCell>
              <DivTableCell>{t('header.sha256')}</DivTableCell>
              <DivTableCell>{t('header.service')}</DivTableCell>
              <DivTableCell>{t('header.classification')}</DivTableCell>
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
                  <Verdict score={result.result.score} />
                </DivTableCell>
                <DivTableCell style={{ wordBreak: 'break-word' }}>{result.id.substring(0, 64)}</DivTableCell>
                <DivTableCell>{result.response.service_name}</DivTableCell>
                <DivTableCell>
                  <Classification type="text" size="tiny" c12n={result.classification} format="short" />
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
