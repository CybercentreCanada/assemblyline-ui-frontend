import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { AlertIndexed } from 'models/base/alert';
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

export type AlertsTableProps = {
  alertResults: SearchResult<AlertIndexed>;
  allowSort?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, alert: AlertIndexed) => void;
};

export const AlertsTable = memo(({ alertResults, allowSort = true, onRowClick = () => null }: AlertsTableProps) => {
  const { t } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return !alertResults ? (
    <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
  ) : !alertResults?.total ? (
    <div style={{ width: '100%' }}>
      <InformativeAlert>
        <AlertTitle>{t('no_alerts_title')}</AlertTitle>
        {t('no_results_desc')}
      </InformativeAlert>
    </div>
  ) : (
    <TableContainer component={Paper}>
      <DivTable>
        <DivTableHead>
          <DivTableRow>
            <SortableHeaderCell sortField="reporting_ts" allowSort={allowSort}>
              {t('header.reporting_ts')}
            </SortableHeaderCell>
            <SortableHeaderCell sortField="al.score" allowSort={allowSort}>
              {t('header.verdict')}
            </SortableHeaderCell>
            <SortableHeaderCell sortField="file.sha256" allowSort={allowSort}>
              {t('header.sha256')}
            </SortableHeaderCell>
            <SortableHeaderCell sortField="status" allowSort={allowSort}>
              {t('header.status')}
            </SortableHeaderCell>
            <SortableHeaderCell sortField="type" allowSort={allowSort}>
              {t('header.type')}
            </SortableHeaderCell>
            {c12nDef.enforce && (
              <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                {t('header.classification')}
              </SortableHeaderCell>
            )}
          </DivTableRow>
        </DivTableHead>
        <DivTableBody>
          {alertResults.items.map((alert, i) => (
            <LinkRow
              key={`${alert.id}-${i}`}
              nav={nav => nav.to().create({ route: '/alert/:id', path: { id: alert.id } })}
              navDeps={[alert.id]}
              onClick={event => onRowClick(event, alert)}
              hover
              style={{ textDecoration: 'none' }}
            >
              <DivTableCell>
                <Tooltip title={alert.reporting_ts}>
                  <div>
                    <Moment variant="fromNow">{alert.reporting_ts}</Moment>
                  </div>
                </Tooltip>
              </DivTableCell>
              <DivTableCell>
                <Verdict score={alert.al.score} fullWidth />
              </DivTableCell>
              <DivTableCell breakable>{alert.file.sha256}</DivTableCell>
              <DivTableCell>{alert.status}</DivTableCell>
              <DivTableCell>{alert.type}</DivTableCell>
              {c12nDef.enforce && (
                <DivTableCell>
                  <Classification type="text" size="tiny" c12n={alert.classification} format="short" />
                </DivTableCell>
              )}
            </LinkRow>
          ))}
        </DivTableBody>
      </DivTable>
    </TableContainer>
  );
});
