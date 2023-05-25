import ClearIcon from '@mui/icons-material/Clear';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import DoneIcon from '@mui/icons-material/Done';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { AlertTitle, IconButton, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Classification from '../Classification';
import CustomChip from '../CustomChip';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from '../DivTable';
import InformativeAlert from '../InformativeAlert';

export type ServiceResult = {
  accepts: string;
  category: string;
  classification: string;
  description: string;
  enabled: boolean;
  is_external: boolean;
  name: string;
  privileged: boolean;
  rejects: string;
  stage: string;
  version: string;
};

type UpdateData = {
  auth: string;
  image: string;
  latest_tag: string;
  update_available: boolean;
  updating: boolean;
};

type Updates = {
  [name: string]: UpdateData;
};

type ServiceTableProps = {
  serviceResults: ServiceResult[];
  updates: Updates;
  setService: (svc: string) => void;
  onUpdate: (svc: string, updateData: UpdateData) => void;
};

const WrappedServiceTable: React.FC<ServiceTableProps> = ({ serviceResults, updates, setService, onUpdate }) => {
  const { t } = useTranslation(['search']);

  return serviceResults && updates ? (
    serviceResults.length !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.name')}</DivTableCell>
              <DivTableCell>{t('header.version')}</DivTableCell>
              <DivTableCell>{t('header.category')}</DivTableCell>
              <DivTableCell>{t('header.stage')}</DivTableCell>
              <DivTableCell>{t('header.accepts')}</DivTableCell>
              <DivTableCell>{t('header.location')}</DivTableCell>
              <DivTableCell>{t('header.mode')}</DivTableCell>
              <DivTableCell>{t('header.classification')}</DivTableCell>
              <DivTableCell>{t('header.enabled')}</DivTableCell>
              <DivTableCell />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {serviceResults.map(result => (
              <LinkRow
                key={result.name}
                component={Link}
                to={`/admin/services/${result.name}`}
                hover
                style={{ textDecoration: 'none' }}
                onClick={event => {
                  if (setService) {
                    event.preventDefault();
                    setService(result.name);
                  }
                }}
              >
                <DivTableCell>{result.name}</DivTableCell>
                <DivTableCell>{result.version}</DivTableCell>
                <DivTableCell>{result.category}</DivTableCell>
                <DivTableCell>{result.stage}</DivTableCell>
                <DivTableCell breakable>{result.accepts}</DivTableCell>
                <DivTableCell>
                  {result.is_external ? (
                    <Tooltip title={t('location.external')}>
                      <CloudDoneOutlinedIcon color="primary" />
                    </Tooltip>
                  ) : (
                    <Tooltip title={t('location.internal')}>
                      <CloudOffOutlinedIcon color="disabled" />
                    </Tooltip>
                  )}
                </DivTableCell>
                <DivTableCell>
                  <CustomChip
                    size="tiny"
                    type="rounded"
                    mono
                    label={result.privileged ? 'P' : 'S'}
                    color={result.privileged ? 'primary' : 'default'}
                    tooltip={result.privileged ? t('mode.privileged') : t('mode.service')}
                  />
                </DivTableCell>
                <DivTableCell>
                  <div style={{ marginBottom: '-1.5px' }}>
                    <Classification type="text" c12n={result ? result.classification : null} />
                  </div>
                </DivTableCell>
                <DivTableCell>
                  {result.enabled ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap', paddingTop: 0, paddingBottom: 0 }}>
                  {updates[result.name] && updates[result.name].update_available && (
                    <Tooltip
                      title={
                        updates[result.name].updating
                          ? t('updating')
                          : `${result.name} ${updates[result.name].latest_tag} ${t('available')}!`
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
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_services_title')}</AlertTitle>
          {t('no_services_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const ServiceTable = React.memo(WrappedServiceTable);
export default ServiceTable;
