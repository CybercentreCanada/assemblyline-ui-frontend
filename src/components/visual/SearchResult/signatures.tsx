import { AlertTitle, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import type { SignatureIndexed } from 'components/models/base/signature';
import type { SearchResult } from 'components/models/ui/search';
import Classification from 'components/visual/Classification';
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
import SignatureStatus from '../SignatureStatus';

type Props = {
  signatureResults: SearchResult<SignatureIndexed>;
  setSignatureID?: (id: string) => void;
  allowSort?: boolean;
};

const WrappedSignaturesTable: React.FC<Props> = ({ signatureResults, setSignatureID = null, allowSort = true }) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return signatureResults ? (
    signatureResults.total !== 0 ? (
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
            {signatureResults.items.map(signature => (
              <LinkRow
                key={signature.signature_id}
                component={Link}
                to={`/manage/signature/${signature.id}`}
                onClick={event => {
                  if (setSignatureID) {
                    event.preventDefault();
                    setSignatureID(signature.id);
                  }
                }}
                hover
              >
                <DivTableCell>{signature.type}</DivTableCell>
                <DivTableCell>{signature.source}</DivTableCell>
                <DivTableCell>{signature.name}</DivTableCell>
                <DivTableCell>{signature.stats ? signature.stats.count || 0 : 0}</DivTableCell>
                <DivTableCell>
                  {signature.stats && signature.stats.last_hit ? (
                    <Moment fromNow locale={i18n.language}>
                      {signature.stats.last_hit}
                    </Moment>
                  ) : (
                    t('never')
                  )}
                </DivTableCell>
                <DivTableCell>
                  <Moment fromNow locale={i18n.language}>
                    {signature.last_modified}
                  </Moment>
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
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_signatures_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const SignaturesTable = React.memo(WrappedSignaturesTable);
export default SignaturesTable;
