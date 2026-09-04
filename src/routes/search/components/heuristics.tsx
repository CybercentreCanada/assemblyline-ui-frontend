import { AlertTitle, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { Heuristic } from 'models/base/heuristic';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Classification from 'ui/Classification';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'ui/DivTable';
import InformativeAlert from 'ui/InformativeAlert';
import Moment from 'ui/Moment';

export type HeuristicsTableProps = {
  heuristicResults: SearchResult<Heuristic>;
  allowSort?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, heuristic: Heuristic) => void;
};

export const HeuristicsTable = memo(
  ({ heuristicResults, allowSort = true, onRowClick = () => null }: HeuristicsTableProps) => {
    const { t } = useTranslation(['search']);
    const { c12nDef } = useALContext();

    return !heuristicResults ? (
      <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
    ) : !heuristicResults?.total ? (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_heuristics_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    ) : (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="heur_id" allowSort={allowSort}>
                {t('header.id')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="name" allowSort={allowSort}>
                {t('header.name')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="filetype" allowSort={allowSort}>
                {t('header.filetype')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="score" allowSort={allowSort}>
                {t('header.score')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="stats.count" allowSort={allowSort}>
                {t('header.hit_count')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="stats.last_hit" allowSort={allowSort}>
                {t('header.last_hit')}
              </SortableHeaderCell>
              {c12nDef.enforce && (
                <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                  {t('header.classification')}
                </SortableHeaderCell>
              )}
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {heuristicResults.items.map((heuristic, i) => (
              <LinkRow
                key={`${heuristic.heur_id}-${i}`}
                nav={nav => nav.to().create({ route: '/manage/heuristic/detail/:id', path: { id: heuristic.heur_id } })}
                navDeps={[heuristic.heur_id]}
                onClick={event => onRowClick(event, heuristic)}
                hover
              >
                <DivTableCell>{heuristic.heur_id}</DivTableCell>
                <DivTableCell>{heuristic.name}</DivTableCell>
                <DivTableCell>{heuristic.filetype}</DivTableCell>
                <DivTableCell>{heuristic.score}</DivTableCell>
                <DivTableCell>{heuristic.stats ? heuristic.stats.count || 0 : 0}</DivTableCell>
                <DivTableCell>
                  {heuristic.stats && heuristic.stats.last_hit ? (
                    <Moment variant="fromNow">{heuristic.stats.last_hit}</Moment>
                  ) : (
                    t('never')
                  )}
                </DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={heuristic.classification} format="short" />
                  </DivTableCell>
                )}
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    );
  }
);
