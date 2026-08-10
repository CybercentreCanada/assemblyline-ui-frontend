import DataUsageOutlinedIcon from '@mui/icons-material/DataUsageOutlined';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import NoEncryptionOutlinedIcon from '@mui/icons-material/NoEncryptionOutlined';
import {
  Paper,
  Skeleton,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import { createAppRoute } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { SiteMapResponse } from 'models/api';
import type { Role } from 'models/base/user';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PossibleColor } from 'shared/utils/colors';
import CustomChip from 'ui/CustomChip';
import { PageHeader } from 'ui/layouts/PageHeader';
import { PageFullWidth } from 'ui/pages/PageFullWidth';

const StyledTableCell = memo(
  styled(TableCell)(({ theme }) => ({
    ['&.MuiTableCell-root']: {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      [theme.breakpoints.up('md')]: {
        wordBreak: 'break-word'
      }
    },
    ['&.MuiTableCell-head']: {
      backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#EEE',
      whiteSpace: 'nowrap'
    }
  }))
);

export const AdminSiteMapPage = memo(() => {
  const { t } = useTranslation(['adminSiteMap']);
  const theme = useTheme();
  const { configuration, user: currentUser } = useALContext();
  const { apiCall } = useMyAPI();

  const [siteMap, setSiteMap] = useState<SiteMapResponse>(null);

  const reqMapColor: Record<Role, PossibleColor> = {
    administration: 'error',
    alert_manage: 'info',
    alert_view: 'default',
    apikey_access: 'default',
    archive_comment: 'default',
    archive_download: 'warning',
    archive_manage: 'info',
    archive_trigger: 'warning',
    archive_view: 'default',
    assistant_use: 'info',
    badlist_manage: 'info',
    badlist_view: 'default',
    bundle_download: 'warning',
    external_query: 'default',
    file_detail: 'default',
    file_download: 'warning',
    file_purge: 'default',
    heuristic_view: 'default',
    obo_access: 'default',
    replay_system: 'warning',
    replay_trigger: 'warning',
    retrohunt_run: 'default',
    retrohunt_view: 'default',
    safelist_manage: 'info',
    safelist_view: 'default',
    self_manage: 'info',
    signature_download: 'warning',
    signature_import: 'success',
    signature_manage: 'info',
    signature_view: 'default',
    submission_create: 'success',
    submission_customize: 'info',
    submission_delete: 'error',
    submission_manage: 'info',
    submission_view: 'default',
    workflow_manage: 'info',
    workflow_view: 'default'
  };

  useEffect(() => {
    if (currentUser.is_admin) {
      apiCall<SiteMapResponse>({
        method: 'GET',
        url: '/api/site_map/',
        onSuccess: api_data => setSiteMap(api_data.api_response)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin]);

  return (
    <PageFullWidth margin={4}>
      <PageHeader
        primary={t('title')}
        secondary={() => `${siteMap.length} ${t('caption')}`}
        secondaryLoading={!siteMap}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } }
        }}
      />

      {siteMap ? (
        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>{t('header.url')}</StyledTableCell>
                <StyledTableCell>{t('header.function')}</StyledTableCell>
                <StyledTableCell>{t('header.methods')}</StyledTableCell>
                <StyledTableCell>{t('header.protected')}</StyledTableCell>
                {configuration.ui.enforce_quota && <StyledTableCell>{t('header.quota')}</StyledTableCell>}
                <StyledTableCell>{t('header.roles')}</StyledTableCell>
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
                  {configuration.ui.enforce_quota && (
                    <StyledTableCell>
                      {path.count_towards_quota && <DataUsageOutlinedIcon color="primary" />}
                    </StyledTableCell>
                  )}
                  <StyledTableCell>
                    {Array.isArray(path?.required_type) &&
                      path.required_type.map((req, rid) => (
                        <div key={rid}>
                          <CustomChip
                            mono
                            type="rounded"
                            color={reqMapColor[req]}
                            size="tiny"
                            label={t(`role.${req}`)}
                          />
                        </div>
                      ))}
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
  );
});

export const AdminSitemapRoute = createAppRoute({
  component: AdminSiteMapPage,

  path: '/admin/sitemap',

  ancestor: '/admin',
  shortname: () => ({ i18nKey: 'adminmenu.sitemap', ns: 'app' }),
  fullname: () => ({ i18nKey: 'adminmenu.sitemap', ns: 'app' }),
  shorticon: () => <MapOutlinedIcon />,
  fullicon: () => <MapOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.is_admin
});
