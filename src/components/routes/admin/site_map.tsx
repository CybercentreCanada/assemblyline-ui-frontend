import {
  createStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
  useTheme,
  withStyles
} from '@material-ui/core';
import HttpsOutlinedIcon from '@material-ui/icons/HttpsOutlined';
import NoEncryptionOutlinedIcon from '@material-ui/icons/NoEncryptionOutlined';
import { Skeleton } from '@material-ui/lab';
import useUser from 'commons/components/hooks/useAppUser';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import CustomChip from 'components/visual/CustomChip';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      wordBreak: 'break-all'
    },
    head: {
      backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#EEE',
      whiteSpace: 'nowrap'
    }
  })
)(TableCell);

export default function SiteMap() {
  const { t } = useTranslation(['adminSiteMap']);
  const theme = useTheme();
  const [siteMap, setSiteMap] = useState(null);
  const apiCall = useMyAPI();
  const { user: currentUser } = useUser<CustomUser>();

  const privMap = {
    R: 'success',
    W: 'warning',
    E: 'error'
  };

  const reqMapColor = {
    user: 'default',
    signature_importer: 'warning',
    signature_manager: 'info',
    admin: 'error'
  };

  useEffect(() => {
    apiCall({
      method: 'GET',
      url: '/api/site_map/',
      onSuccess: api_data => {
        setSiteMap(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <div style={{ marginBottom: theme.spacing(2), textAlign: 'left' }}>
        <Typography variant="h4">{t('title')}</Typography>
        {siteMap ? (
          <Typography variant="caption">{`${siteMap.length} ${t('caption')}`}</Typography>
        ) : (
          <Skeleton width="10rem" />
        )}
      </div>
      {siteMap ? (
        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>{t('header.url')}</StyledTableCell>
                <StyledTableCell>{t('header.function')}</StyledTableCell>
                <StyledTableCell>{t('header.methods')}</StyledTableCell>
                <StyledTableCell>{t('header.protected')}</StyledTableCell>
                <StyledTableCell colSpan={2}>{t('header.permissions')}</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {siteMap.map((path, id) => (
                <TableRow key={id} hover>
                  <StyledTableCell>{path.url}</StyledTableCell>
                  <StyledTableCell>{path.function}</StyledTableCell>
                  <StyledTableCell>
                    {path.methods && path.methods.map((method, mid) => <div key={mid}>{method}</div>)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {path.protected ? (
                      <HttpsOutlinedIcon color="primary" />
                    ) : (
                      <NoEncryptionOutlinedIcon color="error" />
                    )}
                  </StyledTableCell>
                  <StyledTableCell>
                    {path.req_priv &&
                      path.req_priv.map((priv, pid) => (
                        <CustomChip
                          key={pid}
                          mono
                          type="rounded"
                          color={privMap[priv]}
                          size="tiny"
                          label={priv}
                          tooltip={t(`${priv}`)}
                        />
                      ))}
                  </StyledTableCell>
                  <StyledTableCell>
                    {path.required_type &&
                      path.required_type.map((req, rid) => (
                        <CustomChip
                          key={rid}
                          mono
                          type="rounded"
                          color={reqMapColor[req]}
                          size="tiny"
                          label={t(req)}
                          tooltip={t(`${req}_label`)}
                        />
                      ))}
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Skeleton variant="rect" height="10rem" style={{ borderRadius: '4px' }} />
      )}
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
