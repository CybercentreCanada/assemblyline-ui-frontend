import { AlertTitle, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { SignatureIndexed } from 'models/base/signature';
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
import SignatureStatus from 'ui/SignatureStatus';

export type SignaturesTableProps = {
  signatureResults: SearchResult<SignatureIndexed>;
  allowSort?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, signature: SignatureIndexed) => void;
};

export const SignaturesTable = memo(
  ({ signatureResults, allowSort = true, onRowClick = () => null }: SignaturesTableProps) => {
    const { t } = useTranslation(['search']);
    const { c12nDef } = useALContext();

    return !signatureResults ? (
      <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
    ) : !signatureResults?.total ? (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_signatures_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    ) : (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="type" allowSort={allowSort}>
                {t('header.type')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="source" allowSort={allowSort}>
                {t('header.source')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="name" allowSort={allowSort}>
                {t('header.name')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="stats.count" allowSort={allowSort}>
                {t('header.hit_count')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="stats.last_hit" allowSort={allowSort}>
                {t('header.last_hit')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="last_modified" allowSort={allowSort}>
                {t('header.last_modified')}
              </SortableHeaderCell>
              {c12nDef.enforce && (
                <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                  {t('header.classification')}
                </SortableHeaderCell>
              )}
              <SortableHeaderCell sortField="status" allowSort={allowSort}>
                {t('header.status')}
              </SortableHeaderCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {signatureResults.items.map((signature, i) => (
              <LinkRow
                key={`${signature.id}-${i}`}
                nav={nav => nav.to().create({ route: '/manage/signature/detail/:id', path: { id: signature.id } })}
                navDeps={[signature.id]}
                onClick={event => onRowClick(event, signature)}
                hover
              >
                <DivTableCell>{signature.type}</DivTableCell>
                <DivTableCell>{signature.source}</DivTableCell>
                <DivTableCell>{signature.name}</DivTableCell>
                <DivTableCell>{signature.stats ? signature.stats.count || 0 : 0}</DivTableCell>
                <DivTableCell>
                  {signature.stats && signature.stats.last_hit ? (
                    <Moment variant="fromNow">{signature.stats.last_hit}</Moment>
                  ) : (
                    t('never')
                  )}
                </DivTableCell>
                <DivTableCell>
                  <Moment variant="fromNow">{signature.last_modified}</Moment>
                </DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={signature.classification} format="short" />
                  </DivTableCell>
                )}
                <DivTableCell>
                  <SignatureStatus variant="outlined" status={signature.status} />
                </DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    );
  }
);
