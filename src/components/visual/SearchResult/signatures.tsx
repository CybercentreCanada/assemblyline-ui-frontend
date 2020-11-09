import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from '../DivTable';
import InformativeAlert from '../InformativeAlert';

export type SignatureResult = {
  classification: string;
  id: string;
  last_modified: string;
  name: string;
  revision: string;
  signature_id: string;
  source: string;
  status: string;
  type: string;
};

type SearchResults = {
  items: SignatureResult[];
  total: number;
};

type SignaturesTableProps = {
  signatureResults: SearchResults;
};

const WrappedSignaturesTable: React.FC<SignaturesTableProps> = ({ signatureResults }) => {
  const { t } = useTranslation(['search']);

  return signatureResults ? (
    signatureResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.type')}</DivTableCell>
              <DivTableCell>{t('header.source')}</DivTableCell>
              <DivTableCell>{t('header.id')}</DivTableCell>
              <DivTableCell>{t('header.name')}</DivTableCell>
              <DivTableCell>{t('header.rev')}</DivTableCell>
              <DivTableCell>{t('header.classification')}</DivTableCell>
              <DivTableCell>{t('header.status')}</DivTableCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {signatureResults.items.map(signature => (
              <LinkRow
                key={signature.signature_id}
                component={Link}
                to={`/signature/${signature.id}`}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell>{signature.type}</DivTableCell>
                <DivTableCell>{signature.source}</DivTableCell>
                <DivTableCell>{signature.signature_id}</DivTableCell>
                <DivTableCell>{signature.name}</DivTableCell>
                <DivTableCell>{signature.revision}</DivTableCell>
                <DivTableCell>
                  <Classification type="text" size="tiny" c12n={signature.classification} format="short" />
                </DivTableCell>
                <DivTableCell>{signature.status}</DivTableCell>
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
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const SignaturesTable = React.memo(WrappedSignaturesTable);
export default SignaturesTable;
