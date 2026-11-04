import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { RetrohuntIndexed } from 'models/base/retrohunt';
import type { FC } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Classification from 'ui/Classification';
import CustomChip from 'ui/CustomChip';
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

export type RetrohuntTableProps = {
  retrohuntResults: SearchResult<RetrohuntIndexed>;
  allowSort?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, retrohunt: RetrohuntIndexed) => void;
};

export const RetrohuntTable = memo(
  ({ retrohuntResults, allowSort = true, onRowClick = () => null }: RetrohuntTableProps) => {
    const { t } = useTranslation(['search']);
    const { c12nDef } = useALContext();

    const hasTotalHits = useMemo<boolean>(
      () => retrohuntResults?.total > 0 && retrohuntResults.items.some(item => !!item.total_hits),
      [retrohuntResults]
    );

    const RetrohuntStatus = useCallback<FC<{ result: RetrohuntIndexed }>>(
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

    return !retrohuntResults ? (
      <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
    ) : !retrohuntResults?.total ? (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_retrohunt_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    ) : (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell children={t('header.created')} sortField="created_time" allowSort={allowSort} />
              <DivTableCell children={t('header.description')} />
              <SortableHeaderCell children={t('header.creator')} sortField="creator" allowSort={allowSort} />
              {c12nDef.enforce && (
                <SortableHeaderCell
                  children={t('header.rule_classification')}
                  sortField="classification"
                  allowSort={allowSort}
                />
              )}
              {hasTotalHits && <DivTableCell children={t('header.total_hits')} />}
              <SortableHeaderCell children={t('header.finished')} sortField="finished" allowSort={allowSort} />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {retrohuntResults.items.map((retrohunt, id) => (
              <LinkRow
                key={`${retrohunt.id}-${id}`}
                nav={nav => nav.to().create({ route: '/retrohunt/detail/:id', path: { id: retrohunt.key } })}
                navDeps={[retrohunt.key]}
                onClick={event => onRowClick(event, retrohunt)}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={retrohunt?.created_time}>
                    <div>
                      <Moment variant="fromNow">{retrohunt?.created_time}</Moment>
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
    );
  }
);
