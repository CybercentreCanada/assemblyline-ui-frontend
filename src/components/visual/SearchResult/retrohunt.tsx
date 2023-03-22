import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
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
import { Retrohunt } from '../Retrohunt';

export type RetrohuntResults = {
  items: Retrohunt[];
  offset: number;
  rows: number;
  total: number;
};

type RetrohuntTableProps = {
  retrohuntResults: RetrohuntResults;
  allowSort?: boolean;
  onRowClick?: (code: string) => void;
};

const WrappedRetrohuntTable: React.FC<RetrohuntTableProps> = ({
  retrohuntResults,
  allowSort = true,
  onRowClick = () => null
}) => {
  const { t, i18n } = useTranslation(['search']);

  return retrohuntResults ? (
    retrohuntResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="created" allowSort={allowSort}>
                {t('header.created')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="code" allowSort={allowSort}>
                {t('header.code')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="creator" allowSort={allowSort}>
                {t('header.creator')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                {t('header.classification')}
              </SortableHeaderCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {retrohuntResults.items.map((retrohunt, id) => (
              <LinkRow
                key={id}
                component={Link}
                to={() => undefined}
                onClick={event => {
                  event.preventDefault();
                  onRowClick(retrohunt?.code);
                }}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={retrohunt?.created}>
                    <>
                      <Moment fromNow locale={i18n.language}>
                        {retrohunt?.created}
                      </Moment>
                    </>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>{retrohunt?.code}</DivTableCell>
                <DivTableCell>{retrohunt?.creator}</DivTableCell>
                <DivTableCell>{retrohunt?.classification}</DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_retrohunt_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const RetrohuntTable = React.memo(WrappedRetrohuntTable);
export default RetrohuntTable;
