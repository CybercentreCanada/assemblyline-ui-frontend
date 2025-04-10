import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { AlertTitle, IconButton, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import type { ApiKey, Role } from 'components/models/base/user';
import type { SearchResult } from 'components/models/ui/search';
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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const MAX_DISPLAY_ROLES = 5;

type RolesChipProps = {
  roles: Role[];
};

const RolesCustomChips = ({ roles }: RolesChipProps) => {
  const { t } = useTranslation(['adminAPIkeys']);

  const [showMore, setShowMore] = useState<boolean>(false);

  return (
    <div>
      {roles
        .filter((role, i) => showMore || i < MAX_DISPLAY_ROLES)
        .map((role, i) => (
          <CustomChip key={`${role}-${i}`} type="rounded" label={t(`role.${role}`)} size="tiny" color="primary" />
        ))}
      {showMore ? null : (
        <IconButton
          size="small"
          style={{ padding: 0 }}
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            setShowMore(true);
          }}
        >
          <MoreHorizOutlinedIcon />
        </IconButton>
      )}
    </div>
  );
};

type ApiTableProps = {
  apikeySearchResults: SearchResult<ApiKey>;
  setApikeyID?: (id: string) => void;
};

const WrappedUsersApiTable: React.FC<ApiTableProps> = ({ apikeySearchResults, setApikeyID = null }) => {
  const { t } = useTranslation(['adminAPIkeys']);

  return !apikeySearchResults ? (
    <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
  ) : apikeySearchResults.total === 0 ? (
    <div style={{ width: '100%' }}>
      <InformativeAlert>
        <AlertTitle>{t('no_apikey_title')}</AlertTitle>
        {t('no_results_desc')}
      </InformativeAlert>
    </div>
  ) : (
    <TableContainer component={Paper}>
      <DivTable size="small">
        <DivTableHead>
          <DivTableRow style={{ whiteSpace: 'nowrap' }}>
            <SortableHeaderCell sortField="uname">{t('username')}</SortableHeaderCell>
            <SortableHeaderCell sortField="key_name">{t('apikey')}</SortableHeaderCell>
            <SortableHeaderCell sortField="creation_date">{t('creation_date')}</SortableHeaderCell>
            <SortableHeaderCell sortField="expiry_ts">{t('expiration_date')}</SortableHeaderCell>
            <SortableHeaderCell sortField="last_used">{t('last_used')}</SortableHeaderCell>
            <SortableHeaderCell sortField="acl">{t('acl')}</SortableHeaderCell>
            <SortableHeaderCell sortField="roles">{t('roles')}</SortableHeaderCell>
          </DivTableRow>
        </DivTableHead>

        <DivTableBody>
          {apikeySearchResults.items.map(userApikey => (
            <LinkRow
              key={userApikey.id}
              hover
              component={Link}
              to={`/admin/apikeys/${userApikey.id}`}
              onClick={event => {
                if (setApikeyID) {
                  event.preventDefault();
                  setApikeyID(userApikey.id);
                }
              }}
              sx={{ textDecoration: 'none' }}
            >
              <DivTableCell>{userApikey.uname}</DivTableCell>
              <DivTableCell>{userApikey.key_name}</DivTableCell>

              <DivTableCell>
                {!userApikey.creation_date ? null : <Moment variant="fromNow">{userApikey.creation_date}</Moment>}
              </DivTableCell>
              <DivTableCell>
                {!userApikey.expiry_ts ? null : <Moment variant="fromNow">{userApikey.expiry_ts}</Moment>}
              </DivTableCell>
              <DivTableCell>
                {!userApikey.last_used ? null : <Moment format="YYYY-MM-DD">{userApikey.last_used}</Moment>}
              </DivTableCell>
              <DivTableCell>
                {userApikey.acl.sort().map((e, x) => (
                  <CustomChip key={e} type="rounded" label={e} size="tiny" color="primary" />
                ))}
              </DivTableCell>
              <DivTableCell>
                <RolesCustomChips roles={userApikey.roles} />
              </DivTableCell>
            </LinkRow>
          ))}
        </DivTableBody>
      </DivTable>
    </TableContainer>
  );
};

const ApikeysTable = React.memo(WrappedUsersApiTable);
export default ApikeysTable;
