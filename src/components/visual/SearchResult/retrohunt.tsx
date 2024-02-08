import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import { RetrohuntResult } from 'components/routes/retrohunt';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import moment from 'moment';
import React, { useCallback } from 'react';
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

type SearchResults = {
  items: RetrohuntResult[];
  total: number;
};

type Props = {
  retrohuntResults: SearchResults;
  allowSort?: boolean;
  onRowClick?: (retrohunt: RetrohuntResult) => void;
  onSort?: (value: { name: string; field: string }) => void;
};

const WrappedRetrohuntTable: React.FC<Props> = ({
  retrohuntResults,
  allowSort = true,
  onRowClick = null,
  onSort = () => null
}) => {
  const { t, i18n } = useTranslation(['search']);
  const location = useLocation();
  const { c12nDef } = useALContext();

  const RetrohuntStatus = useCallback<React.FC<{ result: RetrohuntResult }>>(
    (prop = { result: { finished: false, phase: 'finished', percentage: 100 } }) => {
      let { finished = false, phase = null, percentage = null } = prop.result;
      phase = finished ? 'finished' : ['filtering', 'yara', 'finished'].includes(phase) ? phase : 'finished';

      return (
        <CustomChip
          label={
            phase === 'finished' || !percentage
              ? t(`status.${phase}`)
              : `${Math.floor(percentage)}% ${t(`status.${phase}`)}`
          }
          color={phase === 'finished' ? 'primary' : 'default'}
          size="small"
          variant="outlined"
        />
      );
    },
    [t]
  );

  return retrohuntResults ? (
    retrohuntResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell
                children={t('header.created')}
                sortField="created"
                allowSort={allowSort}
                onSort={(_, value) => onSort(value)}
              />
              <DivTableCell children={t('header.description')} />
              <SortableHeaderCell
                children={t('header.creator')}
                sortField="creator"
                allowSort={allowSort}
                onSort={(_, value) => onSort(value)}
              />
              {c12nDef.enforce && (
                <SortableHeaderCell
                  children={t('header.classification')}
                  sortField="classification"
                  allowSort={allowSort}
                  onSort={(_, value) => onSort(value)}
                />
              )}
              <SortableHeaderCell
                children={t('header.numfiles')}
                sortField="total_hits"
                allowSort={allowSort}
                onSort={(_, value) => onSort(value)}
              />
              <SortableHeaderCell
                children={t('header.status')}
                sortField="finished"
                allowSort={allowSort}
                onSort={(_, value) => onSort(value)}
              />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {retrohuntResults.items.map((retrohunt, id) => (
              <LinkRow
                key={id}
                component={Link}
                to={`/retrohunt/${retrohunt.code}`}
                onClick={event => {
                  if (!onRowClick) return;
                  event.preventDefault();
                  onRowClick(retrohunt);
                }}
                hover
                style={{ textDecoration: 'none' }}
                selected={new URL(`${window.location.origin}/${location.hash.slice(1)}`).pathname.endsWith(
                  `/${retrohunt?.code}`
                )}
              >
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={retrohunt.created}>
                    <>{moment(retrohunt?.created).locale(i18n.language).fromNow()}</>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell
                  style={{
                    maxWidth: '25vw',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {retrohunt.description}
                </DivTableCell>
                <DivTableCell>{retrohunt.creator}</DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={retrohunt.classification} format="short" />
                  </DivTableCell>
                )}
                <DivTableCell>{retrohunt.total_hits}</DivTableCell>
                <DivTableCell>
                  <RetrohuntStatus result={retrohunt} />
                </DivTableCell>
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
