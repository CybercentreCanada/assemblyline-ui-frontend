import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from '../DivTable';
import InformativeAlert from '../InformativeAlert';

export type HeuristicResult = {
  attack_id: string[];
  classification: string;
  description: string;
  filetype: string;
  heur_id: string;
  id: string;
  max_score: number;
  name: string;
  score: number;
};

type SearchResults = {
  items: HeuristicResult[];
  rows: number;
  offset: number;
  total: number;
};

type HeuristicsTableProps = {
  heuristicResults: SearchResults;
};

const WrappedHeuristicsTable: React.FC<HeuristicsTableProps> = ({ heuristicResults }) => {
  const { t } = useTranslation(['search']);

  return heuristicResults ? (
    heuristicResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.id')}</DivTableCell>
              <DivTableCell>{t('header.name')}</DivTableCell>
              <DivTableCell>{t('header.filetype')}</DivTableCell>
              <DivTableCell>{t('header.score')}</DivTableCell>
              <DivTableCell>{t('header.attack_id')}</DivTableCell>
              <DivTableCell>{t('header.classification')}</DivTableCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {heuristicResults.items.map(heuristic => (
              <LinkRow
                key={heuristic.heur_id}
                component={Link}
                to={`/manage/heuristic/${heuristic.heur_id}`}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell>{heuristic.heur_id}</DivTableCell>
                <DivTableCell>{heuristic.name}</DivTableCell>
                <DivTableCell>{heuristic.filetype}</DivTableCell>
                <DivTableCell>{heuristic.score}</DivTableCell>
                <DivTableCell>{heuristic.attack_id ? heuristic.attack_id.join(', ') : ''}</DivTableCell>
                <DivTableCell>
                  <Classification type="text" size="tiny" c12n={heuristic.classification} format="short" />
                </DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_heuristics_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const HeuristicsTable = React.memo(WrappedHeuristicsTable);
export default HeuristicsTable;
