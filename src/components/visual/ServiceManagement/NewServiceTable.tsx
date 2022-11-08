import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from '../DivTable';
import InformativeAlert from '../InformativeAlert';
import { JSONFeedItem } from './';

export type ServiceResult = {
  accepts: string;
  category: string;
  description: string;
  enabled: boolean;
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

type NewServiceTableProps = {
  services: JSONFeedItem[];
  setService?: (svc: string) => void;
  onUpdate?: (svc: string, updateData: UpdateData) => void;
};

const WrappedNewServiceTable: React.FC<NewServiceTableProps> = ({ services, setService, onUpdate }) => {
  const { t } = useTranslation(['search']);

  return services ? (
    services.length !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.name')}</DivTableCell>
              <DivTableCell>{t('header.description')}</DivTableCell>
              {/* <DivTableCell>{t('header.category')}</DivTableCell>
              <DivTableCell>{t('header.stage')}</DivTableCell>
              <DivTableCell>{t('header.accepts')}</DivTableCell>
              <DivTableCell>{t('header.mode')}</DivTableCell>
              <DivTableCell>{t('header.enabled')}</DivTableCell> */}
              <DivTableCell />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {services.map(service => (
              <LinkRow
                key={service.title}
                component={props => <Link {...props} href="https://www.google.com/" />}
                // to={`/admin/services/${service.title}`}
                to={`https://www.google.com/`}
                hover
                style={{ textDecoration: 'none' }}
                onClick={event => {
                  if (setService) {
                    event.preventDefault();
                    setService(service.title);
                  }
                }}
              >
                <DivTableCell>{service.summary}</DivTableCell>
                <DivTableCell>{service.content_text}</DivTableCell>
                {/* <DivTableCell>{result.stage}</DivTableCell>
                <DivTableCell breakable>{result.accepts}</DivTableCell>
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
                  {result.enabled ? <DoneIcon color="primary" /> : <ClearIcon color="error" />}
                </DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  {updates[result.name] && updates[result.name].update_available && !updates[result.name].updating && (
                    <Tooltip title={`${result.name} ${updates[result.name].latest_tag} ${t('available')}!`}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          onUpdate(result.name, updates[result.name]);
                        }}
                      >
                        {t('update')}
                      </Button>
                    </Tooltip>
                  )}
                  {updates[result.name] && updates[result.name].updating && t('updating')}
                </DivTableCell> */}
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

const NewServiceTable = React.memo(WrappedNewServiceTable);
export default NewServiceTable;
