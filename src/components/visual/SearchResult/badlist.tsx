import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import { maxLenStr } from 'helpers/utils';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
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

export type Badlist = {
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
    name: string;
  }[];
  signature: {
    name: string;
  };
  tag: {
    type: string;
    value: string;
  };
  type: string;
  updated: string;
};

type SearchResults = {
  items: Badlist[];
  total: number;
};

type BadlistTableProps = {
  badlistResults: SearchResults;
  setBadlistID?: (id: string) => void;
  allowSort?: boolean;
};

const WrappedBadlistTable: React.FC<BadlistTableProps> = ({
  badlistResults,
  setBadlistID = null,
  allowSort = true
}) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return badlistResults ? (
    badlistResults.total !== 0 ? (
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
                to={`/manage/badlist/${sl_item.id}`}
                onClick={event => {
                  if (setBadlistID) {
                    event.preventDefault();
                    setBadlistID(sl_item.id);
                  }
                }}
                hover
              >
                <DivTableCell>
                  <Tooltip title={sl_item.added}>
                    <>{moment(sl_item.added).locale(i18n.language).fromNow()}</>
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
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_badlist_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const BadlistTable = React.memo(WrappedBadlistTable);
export default BadlistTable;
