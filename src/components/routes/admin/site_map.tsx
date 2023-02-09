import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import NoEncryptionOutlinedIcon from '@mui/icons-material/NoEncryptionOutlined';
import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
  useTheme
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import CustomChip from 'components/visual/CustomChip';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      [theme.breakpoints.up('md')]: {
        wordBreak: 'break-word'
      }
    },
    head: {
      backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#EEE',
      whiteSpace: 'nowrap'
    }
  })
)(TableCell);

export default function SiteMap() {
  const { t } = useTranslation(['adminSiteMap']);
  const theme = useTheme();
  const [siteMap, setSiteMap] = useState(null);
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();

  const privMap = {
    R: 'success',
    W: 'warning',
    E: 'error'
  };

  const reqMapColor = {
    signature_import: 'success',
    signature_manage: 'info',
    signature_view: 'default',
    signature_download: 'warning',
    administration: 'error',
    alert_view: 'default',
    alert_manage: 'info',
    archive_view: 'default',
    archive_trigger: 'warning',
    archive_download: 'warning',
    archive_manage: 'info',
    safelist_view: 'default',
    safelist_manage: 'info',
    workflow_view: 'default',
    workflow_manage: 'info',
    apikey_access: 'default',
    obo_access: 'default',
    bundle_download: 'warning',
    submission_create: 'success',
    submission_view: 'default',
    submission_delete: 'error',
    submission_manage: 'info',
    file_detail: 'default',
    file_download: 'warning',
    replay_trigger: 'warning',
    replay_system: 'info'
  };

  useEffectOnce(() => {
    if (currentUser.is_admin) {
      apiCall({
        method: 'GET',
        url: '/api/site_map/',
        onSuccess: api_data => {
          setSiteMap(api_data.api_response);
        }
      });
    }
  });

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
                    <div style={{ display: 'flex' }}>
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
                    </div>
                  </StyledTableCell>
                  <StyledTableCell>
                    <div style={{ display: 'flex' }}>
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
                    </div>
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Skeleton variant="rectangular" height="10rem" style={{ borderRadius: '4px' }} />
      )}
    </PageFullWidth>
  ) : (
    <Navigate to="/forbidden" replace />
  );
}
