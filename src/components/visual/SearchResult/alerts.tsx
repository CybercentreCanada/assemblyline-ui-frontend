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
};

const WrappedAlertsTable: React.FC<AlertsTableProps> = ({ alertResults }) => {
  const { t, i18n } = useTranslation(['search']);

  return alertResults ? (
    alertResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.reporting_ts')}</DivTableCell>
              <DivTableCell>{t('header.verdict')}</DivTableCell>
              <DivTableCell>{t('header.sha256')}</DivTableCell>
              <DivTableCell>{t('header.status')}</DivTableCell>
              <DivTableCell>{t('header.type')}</DivTableCell>
              <DivTableCell>{t('header.classification')}</DivTableCell>
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
                    <Moment fromNow locale={i18n.language}>
                      {alert.reporting_ts}
                    </Moment>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>
                  <Verdict score={alert.al.score} />
                </DivTableCell>
                <DivTableCell style={{ wordBreak: 'break-word' }}>{alert.file.sha256}</DivTableCell>
                <DivTableCell>{alert.status}</DivTableCell>
                <DivTableCell>{alert.type}</DivTableCell>
                <DivTableCell>
                  <Classification type="text" size="tiny" c12n={alert.classification} format="short" />
                </DivTableCell>
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
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const AlertsTable = React.memo(WrappedAlertsTable);
export default AlertsTable;
