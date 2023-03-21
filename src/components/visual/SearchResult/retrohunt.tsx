import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
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
  const { c12nDef } = useALContext();

  return retrohuntResults ? (
    retrohuntResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="created" allowSort={allowSort}>
                {t('header.time')}
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
              {/* <SortableHeaderCell sortField="max_score" allowSort={allowSort}>
                {t('header.verdict')}
              </SortableHeaderCell>
              <DivTableCell>{t('header.description')}</DivTableCell>
              <SortableHeaderCell sortField="params.submitter" allowSort={allowSort}>
                {t('header.user')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="file_count" allowSort={allowSort}>
                {t('header.numfiles')}
              </SortableHeaderCell>
              {c12nDef && c12nDef.enforce && (
                <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                  {t('header.classification')}
                </SortableHeaderCell>
              )}
              <SortableHeaderCell sortField="error_count" allowSort={allowSort}>
                {t('header.status')}
              </SortableHeaderCell> */}
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {retrohuntResults.items.map((retrohunt, id) => (
              <LinkRow
                key={id}
                component={Link}
                to={() => undefined}
                // to={
                //   retrohunt.state === 'completed' ? `/retrohunt/${retrohunt.id}` : `/retrohunt/detail/${retrohunt.id}`
                // }
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
                {/* <DivTableCell>
                  <Tooltip title={retrohunt.times.submitted}>
                    <>
                      <Moment fromNow locale={i18n.language} date={retrohunt.times.submitted} />
                    </>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>
                  <Verdict score={retrohunt.max_score} fullWidth />
                </DivTableCell>
                <DivTableCell breakable>{maxLenStr(retrohunt.params.description, 150)}</DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>{retrohunt.params.submitter}</DivTableCell>
                <DivTableCell>{retrohunt.file_count}</DivTableCell>
                {c12nDef && c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={retrohunt.classification} format="short" />
                  </DivTableCell>
                )}
                <DivTableCell style={{ textAlign: 'center' }}>
                  <RetrohuntState state={retrohunt.state} error_count={retrohunt.error_count} />
                </DivTableCell>
                <DivTableCell style={{ textAlign: 'center' }}>
                  {retrohunt.from_archive && (
                    <Tooltip title={t('archive')}>
                      <ArchiveOutlinedIcon />
                    </Tooltip>
                  )}
                </DivTableCell> */}
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
