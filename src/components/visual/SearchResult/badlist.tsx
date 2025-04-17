import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import type { Badlist } from 'components/models/base/badlist';
import type { SearchResult } from 'components/models/ui/search';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import InformativeAlert from 'components/visual/InformativeAlert';
import Moment from 'components/visual/Moment';
import { maxLenStr } from 'helpers/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';

type Props = {
  badlistResults: SearchResult<Badlist>;
  allowSort?: boolean;
  isLoading?: boolean;
};

const WrappedBadlistTable: React.FC<Props> = ({ badlistResults, allowSort = true, isLoading = false }) => {
  const { t } = useTranslation(['search']);
  const location = useLocation();
  const navigate = useNavigate();
  const { c12nDef } = useALContext();

  return isLoading ? (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  ) : badlistResults?.total === 0 ? (
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
          {badlistResults.items.map(sl_item => (
            <LinkRow
              key={sl_item.id}
              component={Link}
              hover
              to={`/manage/badlist/${sl_item.id}`}
              onClick={event => {
                event.preventDefault();
                navigate(`${location.pathname}${location.search || ''}#${sl_item.id}`);
              }}
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
};

const BadlistTable = React.memo(WrappedBadlistTable);
export default BadlistTable;
