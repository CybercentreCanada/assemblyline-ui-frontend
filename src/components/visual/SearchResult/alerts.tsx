import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import Moment from 'components/visual/Moment';
import Verdict from 'components/visual/Verdict';
import React from 'react';
import { useTranslation } from 'react-i18next';
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

export type AlertResult = {
  al: {
    av: string[];
    score: number;
  };
  alert_id: string;
  classification: string;
  file: {
    md5: string;
    sha1: string;
    sha256: string;
    type: string;
  };
  filtered: boolean;
  id: string;
  label: string[];
  owner: string;
  priority: string;
  reporting_ts: string;
  status: string;
  ts: string;
  type: string;
};

type SearchResults = {
  items: AlertResult[];
  total: number;
};

type AlertsTableProps = {
  alertResults: SearchResults;
  allowSort?: boolean;
};

const WrappedAlertsTable: React.FC<AlertsTableProps> = ({ alertResults, allowSort = true }) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return alertResults ? (
    alertResults.total !== 0 ? (
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
            {alertResults.items.map(alert => (
              <LinkRow
                key={alert.id}
                component={Link}
                to={`/alerts/${alert.id}`}
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
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_alerts_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const AlertsTable = React.memo(WrappedAlertsTable);
export default AlertsTable;
