import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import { AlertTitle, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { UserIndexed } from 'models/base/user';
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

export type UsersTableProps = {
  userResults: SearchResult<UserIndexed>;
  allowSort?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, user: UserIndexed) => void;
};

export const UsersTable = memo(({ userResults, allowSort = true, onRowClick = () => null }: UsersTableProps) => {
  const { t } = useTranslation(['adminUsers']);
  const { c12nDef, classificationAliases } = useALContext();

  return !userResults ? (
    <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
  ) : !userResults?.total ? (
    <div style={{ width: '100%' }}>
      <InformativeAlert>
        <AlertTitle>{t('no_users_title')}</AlertTitle>
        {t('no_results_desc')}
      </InformativeAlert>
    </div>
  ) : (
    <TableContainer component={Paper}>
      <DivTable size="small">
        <DivTableHead>
          <DivTableRow style={{ whiteSpace: 'nowrap' }}>
            <SortableHeaderCell sortField="uname" allowSort={allowSort}>
              {t('header.uid')}
            </SortableHeaderCell>
            <SortableHeaderCell sortField="name" allowSort={allowSort}>
              {t('header.fullname')}
            </SortableHeaderCell>
            <SortableHeaderCell sortField="groups" allowSort={allowSort}>
              {t('header.groups')}
            </SortableHeaderCell>
            {c12nDef.enforce && (
              <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                {t('header.classification')}
              </SortableHeaderCell>
            )}
            <SortableHeaderCell sortField="is_active" allowSort={allowSort}>
              {t('header.active')}
            </SortableHeaderCell>
            <SortableHeaderCell sortField="type" allowSort={allowSort}>
              {t('header.admin')}
            </SortableHeaderCell>
          </DivTableRow>
        </DivTableHead>
        <DivTableBody>
          {userResults.items.map((user, i) => (
            <LinkRow
              key={`${user.id}-${i}`}
              nav={nav => nav.to().create({ route: '/admin/users/:id', path: { id: user.uname } })}
              onClick={event => onRowClick(event, user)}
              hover
              style={{ textDecoration: 'none' }}
            >
              <DivTableCell style={{ whiteSpace: 'nowrap' }}>{user.uname}</DivTableCell>
              <DivTableCell>{user.name}</DivTableCell>
              <DivTableCell>
                {user.groups &&
                  user.groups
                    .map(group =>
                      group in classificationAliases
                        ? classificationAliases?.[group]?.name || classificationAliases?.[group]?.short_name || group
                        : group
                    )
                    .join(' | ')}
              </DivTableCell>
              {c12nDef.enforce && (
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Classification type="text" size="tiny" c12n={user.classification} format="short" isUser />
                </DivTableCell>
              )}
              <DivTableCell>{user.is_active ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}</DivTableCell>
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
  );
});
