import { AlertTitle, IconButton, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import { ApiKey, Role } from 'components/models/base/user';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CustomChip from '../CustomChip';
import InformativeAlert from '../InformativeAlert';
import Moment from '../Moment';

import { ExpandLess, ExpandMore } from '@mui/icons-material';

export type ApikeySearchResults = {
  items: ApiKey[];
  rows: number;
  offset: number;
  total: number;
};

type ApiTableProps = {
  apikeySearchResults: ApikeySearchResults;
  setApikeyID?: (id: string) => void;
};

type RolesChipProps = {
  roles: Role[];
};

const RolesCustomChips = ({ roles }: RolesChipProps) => {
  const { t } = useTranslation(['apikeys']);
  const [showMore, setShowMore] = useState<Boolean>(false);
  const [showLess, setShowLess] = useState<Boolean>(false);
  const MAX_DISPLAY_ROLES = 5;

  const [displayRoles, setDisplayRoles] = useState<Role[]>(roles.slice());

  useEffectOnce(() => {
    if (roles.length > MAX_DISPLAY_ROLES) {
      setShowMore(true);
      setDisplayRoles(roles.slice(0, MAX_DISPLAY_ROLES));
    }
  });

  return (
    <div>
      {displayRoles.map((e, x) => (
        <CustomChip key={e} type="rounded" label={t(`role.${e}`)} size="tiny" color="secondary" />
      ))}
      {showMore ? (
        <IconButton
          size="small"
          onClick={event => {
            setShowMore(false);
            setShowLess(true);
            setDisplayRoles(roles.slice());
            event.preventDefault();
          }}
        >
          <ExpandMore />{' '}
        </IconButton>
      ) : (
        <></>
      )}
      {showLess ? (
        <IconButton
          size="small"
          onClick={event => {
            setShowMore(true);
            setShowLess(false);
            setDisplayRoles(roles.slice(0, MAX_DISPLAY_ROLES));
            event.preventDefault();
          }}
        >
          <ExpandLess />{' '}
        </IconButton>
      ) : (
        <></>
      )}
    </div>
  );
};

const WrappedUsersApiTable: React.FC<ApiTableProps> = ({ apikeySearchResults, setApikeyID = null }) => {
  const { t } = useTranslation(['apikeys']);

  return apikeySearchResults ? (
    apikeySearchResults.total !== 0 ? (
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
                to={`/admin/apikeys/#${userApikey.id}`}
                onClick={event => {
                  if (setApikeyID && event.target == event.currentTarget) {
                    event.preventDefault();
                    setApikeyID(userApikey.id);
                  }
                }}
                sx={{ textDecoration: 'none' }}
              >
                <DivTableCell>{userApikey.uname}</DivTableCell>
                <DivTableCell>{userApikey.key_name}</DivTableCell>

                <DivTableCell>
                  <Moment variant="fromNow">{userApikey.creation_date}</Moment>
                </DivTableCell>
                <DivTableCell>
                  {userApikey.expiry_ts ? <Moment variant="fromNow">{userApikey.expiry_ts}</Moment> : <></>}
                </DivTableCell>
                <DivTableCell>
                  {userApikey.last_used ? <Moment variant="fromNow">{userApikey.last_used}</Moment> : <></>}
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
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_apikey_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const ApikeysTable = React.memo(WrappedUsersApiTable);
export default ApikeysTable;
