import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { AlertTitle, IconButton, Skeleton, Tooltip, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { ServiceIndexed, ServiceUpdateData, ServiceUpdates } from 'models/base/service';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineExternalLink } from 'react-icons/hi';
import Classification from 'ui/Classification';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from 'ui/DivTable';
import InformativeAlert from 'ui/InformativeAlert';

export type ServiceTableProps = {
  serviceResults: ServiceIndexed[];
  updates: ServiceUpdates;
  onUpdate: (svc: string, updateData: ServiceUpdateData) => void;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, service: ServiceIndexed) => void;
};

export const ServiceTable = memo(
  ({ serviceResults, updates, onUpdate, onRowClick = () => null }: ServiceTableProps) => {
    const { t } = useTranslation(['search']);
    const { c12nDef } = useALContext();
    const theme = useTheme();

    return !serviceResults || !updates ? (
      <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
    ) : !serviceResults?.length ? (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_services_title')}</AlertTitle>
          {t('no_services_desc')}
        </InformativeAlert>
      </div>
    ) : (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.name')}</DivTableCell>
              <DivTableCell>{t('header.version')}</DivTableCell>
              <DivTableCell>{t('header.category')}</DivTableCell>
              <DivTableCell>{t('header.stage')}</DivTableCell>
              <DivTableCell>{t('header.accepts')}</DivTableCell>
              <DivTableCell>{t('header.external')}</DivTableCell>
              {c12nDef.enforce ? <DivTableCell>{t('header.classification')}</DivTableCell> : null}
              <DivTableCell>{t('header.enabled')}</DivTableCell>
              <DivTableCell />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {serviceResults.map((result, i) => (
              <LinkRow
                key={`${result.name}-${i}`}
                nav={nav => nav.to().create({ route: '/admin/services/:svc', path: { svc: result.name } })}
                navDeps={[result.name]}
                hover
                onClick={event => onRowClick(event, result)}
              >
                <DivTableCell>{result.name}</DivTableCell>
                <DivTableCell>{result.version}</DivTableCell>
                <DivTableCell>{result.category}</DivTableCell>
                <DivTableCell>{result.stage}</DivTableCell>
                <DivTableCell breakable>{result.accepts}</DivTableCell>
                <DivTableCell>
                  {result.is_external ? (
                    <Tooltip
                      PopperProps={{
                        disablePortal: true
                      }}
                      disableInteractive
                      placement="left"
                      title={t('location.external')}
                    >
                      <div>
                        <HiOutlineExternalLink
                          style={{ fontSize: 'x-large', verticalAlign: 'middle', color: theme.palette.primary.main }}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      PopperProps={{
                        disablePortal: true
                      }}
                      disableInteractive
                      placement="left"
                      title={t('location.internal')}
                    >
                      <div>&nbsp;</div>
                    </Tooltip>
                  )}
                </DivTableCell>
                {c12nDef.enforce ? (
                  <DivTableCell>
                    <div style={{ marginBottom: '-1.5px' }}>
                      <Classification type="text" c12n={result ? result.classification : null} />
                    </div>
                  </DivTableCell>
                ) : null}
                <DivTableCell>
                  {result.enabled ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap', paddingTop: 0, paddingBottom: 0, width: 0 }}>
                  {updates[result.name] && updates[result.name].update_available && (
                    <Tooltip
                      PopperProps={{
                        disablePortal: true
                      }}
                      disableInteractive
                      placement="left"
                      title={
                        updates[result.name].updating
                          ? t('updating')
                          : `${t('update')} ${result.name} ${t('to')} ${updates[result.name].latest_tag}`
                      }
                    >
                      <span>
                        <IconButton
                          color="primary"
                          onClick={event => {
                            event.preventDefault();
                            event.stopPropagation();
                            onUpdate(result.name, updates[result.name]);
                          }}
                          disabled={updates[result.name].updating}
                          size="large"
                        >
                          <SystemUpdateAltIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    );
  }
);
