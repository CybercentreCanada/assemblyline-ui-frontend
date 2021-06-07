import { Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import useALContext from 'components/hooks/useALContext';
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

export type Whitelist = {
  added: string;
  classification: string;
  fileinfo: {
    md5: string;
    sha1: string;
    sha256: string;
    size: number;
    type: 'user' | 'external';
  };
  id: string;
  sources: {
    name: string[];
    type: string[];
    reason: string[];
  };
  updated: string;
};

type SearchResults = {
  items: Whitelist[];
  total: number;
};

type WhitelistTableProps = {
  whitelistResults: SearchResults;
  setWhitelistID?: (id: string) => void;
  allowSort?: boolean;
};

const WrappedWhitelistTable: React.FC<WhitelistTableProps> = ({
  whitelistResults,
  setWhitelistID = null,
  allowSort = true
}) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return whitelistResults ? (
    whitelistResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="added" allowSort={allowSort}>
                {t('header.added')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="fileinfo.sha256" allowSort={allowSort}>
                {t('header.sha256')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="sources.name" allowSort={allowSort}>
                {t('header.source')}
              </SortableHeaderCell>
              {c12nDef.enforce && (
                <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                  {t('header.classification')}
                </SortableHeaderCell>
              )}
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {whitelistResults.items.map(wl_item => (
              <LinkRow
                key={wl_item.id}
                component={Link}
                to={`/manage/whitelist/${wl_item.fileinfo.sha256}`}
                onClick={event => {
                  if (setWhitelistID) {
                    event.preventDefault();
                    setWhitelistID(wl_item.id);
                  }
                }}
                hover
              >
                <DivTableCell>
                  <Tooltip title={wl_item.added}>
                    <Moment fromNow locale={i18n.language}>
                      {wl_item.added}
                    </Moment>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>{wl_item.fileinfo.sha256}</DivTableCell>
                <DivTableCell style={{ wordBreak: 'break-word' }}>{wl_item.sources.name.join(' | ')}</DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={wl_item.classification} format="short" />
                  </DivTableCell>
                )}
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_whitelist_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const WhitelistTable = React.memo(WrappedWhitelistTable);
export default WhitelistTable;
