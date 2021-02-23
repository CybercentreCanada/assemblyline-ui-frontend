import { Button, Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from '../DivTable';
import InformativeAlert from '../InformativeAlert';

export type ServiceResult = {
  accepts: string;
  category: string;
  description: string;
  enabled: boolean;
  name: string;
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
                <DivTableCell style={{ wordBreak: 'break-all' }}>{result.accepts}</DivTableCell>
                <DivTableCell>
                  {result.enabled ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}
                </DivTableCell>
                <DivTableCell>
                  {updates[result.name] && updates[result.name].update_available && !updates[result.name].updating && (
                    <Tooltip title={`${result.name} ${updates[result.name].latest_tag} ${t('available')}!`}>
                      <Button
                        onClick={event => {
                          event.preventDefault();
                          onUpdate(result.name, updates[result.name]);
                        }}
                      >
                        {t('update')}
                      </Button>
                    </Tooltip>
                  )}
                  {updates[result.name] && updates[result.name].updating && t('updating')}
                </DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_results_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const ServiceTable = React.memo(WrappedServiceTable);
export default ServiceTable;
