import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import { RetrohuntResult } from 'components/routes/retrohunt';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import Moment from 'components/visual/Moment';
import React, { useCallback, useMemo } from 'react';
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

  const hasTotalHits = useMemo<boolean>(
    () => retrohuntResults?.total > 0 && retrohuntResults.items.some(item => !!item.total_hits),
    [retrohuntResults]
  );

  const RetrohuntStatus = useCallback<React.FC<{ result: RetrohuntResult }>>(
    ({ result }) => {
      const { finished = false, step, progress } = result;
      let label = '';

      if (finished) {
        label = t(`status.finished`);
      } else if (step) {
        switch (step) {
          case 'Starting':
            label = t(`status.starting`);
            break;
          case 'Filtering':
            label = `${Math.ceil(100 * progress)}% ${t(`status.filtering`)}`;
            break;
          case 'Yara':
            label = `${Math.ceil(100 * progress)}% ${t(`status.yara`)}`;
            break;
          case 'Finished':
            label = t(`status.finished`);
            break;
          default:
            label = t(`status.in_progress`);
        }
      } else {
        label = t(`status.in_progress`);
      }

      return <CustomChip label={label} color={finished ? 'primary' : 'default'} size="small" variant="outlined" />;
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
                sortField="created_time"
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
                  children={t('header.rule_classification')}
                  sortField="classification"
                  allowSort={allowSort}
                  onSort={(_, value) => onSort(value)}
                />
              )}
              {hasTotalHits && <DivTableCell children={t('header.total_hits')} />}
              <SortableHeaderCell
                children={t('header.finished')}
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
                to={`/retrohunt/${retrohunt.key}`}
                onClick={event => {
                  if (!onRowClick) return;
                  event.preventDefault();
                  onRowClick(retrohunt);
                }}
                hover
                style={{ textDecoration: 'none' }}
                selected={new URL(`${window.location.origin}/${location.hash.slice(1)}`).pathname.endsWith(
                  `/${retrohunt?.key}`
                )}
              >
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={retrohunt?.created}>
                    <div>
                      <Moment variant="fromNow">{retrohunt?.created}</Moment>
                    </div>
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
                {hasTotalHits && <DivTableCell>{retrohunt?.total_hits}</DivTableCell>}
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
