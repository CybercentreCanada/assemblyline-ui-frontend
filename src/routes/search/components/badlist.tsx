import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { Badlist } from 'models/base/badlist';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { maxLenStr } from 'shared/utils/utils';
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

export type BadlistTableProps = {
  badlistResults: SearchResult<Badlist>;
  allowSort?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, item: Badlist) => void;
};

export const BadlistTable = memo(({ badlistResults, allowSort = true, onRowClick = () => null }: BadlistTableProps) => {
  const { t } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return !badlistResults ? (
    <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
  ) : !badlistResults?.total ? (
    <div style={{ width: '100%' }}>
      <InformativeAlert>
        <AlertTitle>{t('no_badlist_title')}</AlertTitle>
        {t('no_results_desc')}
      </InformativeAlert>
    </div>
  ) : (
    <TableContainer component={Paper}>
      <DivTable>
        <DivTableHead>
          <DivTableRow>
            <SortableHeaderCell sortField="added" allowSort={allowSort}>
              {t('header.added')}
            </SortableHeaderCell>
            <SortableHeaderCell sortField="type" allowSort={allowSort}>
              {t('header.type')}
            </SortableHeaderCell>
            <DivTableCell>{t('header.identifier')}</DivTableCell>
            <SortableHeaderCell sortField="sources.name" allowSort={allowSort}>
              {t('header.source')}
            </SortableHeaderCell>
            {c12nDef.enforce && (
              <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                {t('header.classification')}
              </SortableHeaderCell>
            )}
            <SortableHeaderCell sortField="enabled" allowSort={allowSort}>
              {t('header.status')}
            </SortableHeaderCell>
          </DivTableRow>
        </DivTableHead>
        <DivTableBody>
          {badlistResults.items.map((sl_item, i) => (
            <LinkRow
              key={`${sl_item.id}-${i}`}
              hover
              nav={nav => nav.to().create({ route: '/manage/badlist/:id', path: { id: sl_item.id } })}
              navDeps={[sl_item.id]}
              onClick={event => onRowClick(event, sl_item)}
            >
              <DivTableCell>
                <Tooltip title={sl_item.added}>
                  <div>
                    <Moment variant="fromNow">{sl_item.added}</Moment>
                  </div>
                </Tooltip>
              </DivTableCell>
              <DivTableCell>{sl_item.type}</DivTableCell>
              <DivTableCell breakable>
                {sl_item.type === 'file'
                  ? sl_item.id
                  : sl_item.type === 'signature'
                    ? maxLenStr(sl_item.signature.name, 100)
                    : `${sl_item.tag.type} - ${maxLenStr(sl_item.tag.value, 100)}`}
              </DivTableCell>
              <DivTableCell breakable>{sl_item.sources.map(obj => obj.name).join(' | ')}</DivTableCell>
              {c12nDef.enforce && (
                <DivTableCell>
                  <Classification type="text" size="tiny" c12n={sl_item.classification} format="short" />
                </DivTableCell>
              )}
              <DivTableCell>
                <CustomChip
                  fullWidth
                  type="rounded"
                  variant="outlined"
                  size="small"
                  color={sl_item.enabled ? 'primary' : 'default'}
                  label={sl_item.enabled ? t('enabled') : t('disabled')}
                />
              </DivTableCell>
            </LinkRow>
          ))}
        </DivTableBody>
      </DivTable>
    </TableContainer>
  );
});
