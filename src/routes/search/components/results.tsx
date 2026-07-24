import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { AlertTitle, Skeleton, Tooltip, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { ResultIndexed } from 'models/base/result';
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
import Verdict from 'ui/Verdict';

export type ResultsTableProps = {
  resultResults: SearchResult<ResultIndexed>;
  allowSort?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, result: ResultIndexed) => void;
};

export const ResultsTable = memo(({ resultResults, allowSort = true, onRowClick = () => null }: ResultsTableProps) => {
  const { t } = useTranslation(['search']);
  const { c12nDef } = useALContext();
  const theme = useTheme();

  return !resultResults ? (
    <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
  ) : !resultResults?.total ? (
    <div style={{ width: '100%' }}>
      <InformativeAlert>
        <AlertTitle>{t('no_results_title')}</AlertTitle>
        {t('no_results_desc')}
      </InformativeAlert>
    </div>
  ) : (
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
          {resultResults.items.map((result, id) => (
            <LinkRow
              key={`${result.id}-${id}`}
              nav={nav =>
                nav.to().create({
                  route: '/file/detail/:id',
                  path: { id: result.id.substring(0, 64) }
                })
              }
              navDeps={[result.id]}
              onClick={event => onRowClick(event, result)}
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
  );
});
