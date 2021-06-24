import { Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import { maxLenStr } from 'helpers/utils';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import CustomChip from '../CustomChip';
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

export type Safelist = {
  added: string;
  classification: string;
  enabled: boolean;
  hashes: {
    md5: string;
    sha1: string;
    sha256: string;
  };
  file: {
    name: string[];
  };
  id: string;
  sources: {
    name: string[];
  };
  tag: {
    type: string;
    value: string;
  };
  type: string;
  updated: string;
};

type SearchResults = {
  items: Safelist[];
  total: number;
};

type SafelistTableProps = {
  safelistResults: SearchResults;
  setSafelistID?: (id: string) => void;
  allowSort?: boolean;
};

const WrappedSafelistTable: React.FC<SafelistTableProps> = ({
  safelistResults,
  setSafelistID = null,
  allowSort = true
}) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return safelistResults ? (
    safelistResults.total !== 0 ? (
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
            {safelistResults.items.map(sl_item => (
              <LinkRow
                key={sl_item.id}
                component={Link}
                to={`/manage/safelist/${sl_item.id}`}
                onClick={event => {
                  if (setSafelistID) {
                    event.preventDefault();
                    setSafelistID(sl_item.id);
                  }
                }}
                hover
              >
                <DivTableCell>
                  <Tooltip title={sl_item.added}>
                    <Moment fromNow locale={i18n.language}>
                      {sl_item.added}
                    </Moment>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>{sl_item.type}</DivTableCell>
                <DivTableCell style={{ wordBreak: 'break-word' }}>
                  {sl_item.type === 'file' ? sl_item.id : `${sl_item.tag.type} - ${maxLenStr(sl_item.tag.value, 100)}`}
                </DivTableCell>
                <DivTableCell style={{ wordBreak: 'break-word' }}>{sl_item.sources.name.join(' | ')}</DivTableCell>
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
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_safelist_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const SafelistTable = React.memo(WrappedSafelistTable);
export default SafelistTable;
