import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import { AlertTitle, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InformativeAlert from '../InformativeAlert';

export type UserResult = {
  classification: string;
  email: string;
  groups: string[];
  id: string;
  is_active: boolean;
  name: string;
  type: string[];
  uname: string;
};

type SearchResults = {
  items: UserResult[];
  rows: number;
  offset: number;
  total: number;
};

type UsersTableProps = {
  userResults: SearchResults;
};

const WrappedUsersTable: React.FC<UsersTableProps> = ({ userResults }) => {
  const { t } = useTranslation(['adminUsers']);
  const { c12nDef } = useALContext();

  return userResults ? (
    userResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable size="small">
          <DivTableHead>
            <DivTableRow style={{ whiteSpace: 'nowrap' }}>
              <SortableHeaderCell sortField="uname">{t('header.uid')}</SortableHeaderCell>
              <SortableHeaderCell sortField="name">{t('header.fullname')}</SortableHeaderCell>
              <SortableHeaderCell sortField="groups">{t('header.groups')}</SortableHeaderCell>
              {c12nDef.enforce && (
                <SortableHeaderCell sortField="classification">{t('header.classification')}</SortableHeaderCell>
              )}
              <SortableHeaderCell sortField="is_active">{t('header.active')}</SortableHeaderCell>
              <SortableHeaderCell sortField="type">{t('header.admin')}</SortableHeaderCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {userResults.items.map(user => (
              <LinkRow key={user.id} to={`/admin/users/${user.uname}`} hover style={{ textDecoration: 'none' }}>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>{user.uname}</DivTableCell>
                <DivTableCell>{user.name}</DivTableCell>
                <DivTableCell>{user.groups && user.groups.join(' | ')}</DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                    <Classification type="text" size="tiny" c12n={user.classification} format="short" isUser />
                  </DivTableCell>
                )}
                <DivTableCell>
                  {user.is_active ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}
                </DivTableCell>
                <DivTableCell>
                  {user.type && user.type.indexOf('admin') !== -1 ? (
                    <DoneIcon color="primary" />
                  ) : (
                    <ClearIcon color="error" />
                  )}
                </DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_users_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const UsersTable = React.memo(WrappedUsersTable);
export default UsersTable;
