import { CircularProgress, useTheme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import useUser from 'commons/components/hooks/useAppUser';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory } from 'react-router-dom';

export default function Users() {
  const { t } = useTranslation(['adminUsers']);
  const { user: currentUser } = useUser<CustomUser>();
  const [users, setUsers] = useState(null);
  const history = useHistory();
  const theme = useTheme();
  const apiCall = useMyAPI();

  useEffect(() => {
    if (currentUser.is_admin) {
      apiCall({
        url: '/api/v4/user/list/?offset=0&rows=25&query=',
        onSuccess: api_data => {
          setUsers(api_data.api_response.items);
        }
      });
    }

    // eslint-disable-next-line
  }, []);

  return currentUser.is_admin ? (
    <PageFullWidth>
      <div style={{ paddingBottom: theme.spacing(8) }}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography variant="subtitle1" color="secondary">
          {users !== null && `${users.length} ${t('subtitle')}`}
        </Typography>
      </div>

      {users !== null ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow style={{ whiteSpace: 'nowrap' }}>
                <TableCell>{t('header.uid')}</TableCell>
                <TableCell>{t('header.fullname')}</TableCell>
                <TableCell>{t('header.groups')}</TableCell>
                <TableCell>{t('header.classification')}</TableCell>
                <TableCell>{t('header.active')}</TableCell>
                <TableCell>{t('header.admin')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} onClick={() => history.push(`/admin/users/${user.uname}`)} hover>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{user.uname}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.groups.join(' | ')}</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    <Classification type="text" size="tiny" c12n={user.classification} format="short" />
                  </TableCell>
                  <TableCell>{user.is_active ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}</TableCell>
                  <TableCell>
                    {user.type.indexOf('admin') !== -1 ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <CircularProgress />
        </div>
      )}
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
