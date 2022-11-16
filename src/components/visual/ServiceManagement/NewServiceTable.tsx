import { IconButton, makeStyles, Paper, TableContainer, TableRow, Tooltip } from '@material-ui/core';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import LaunchOutlinedIcon from '@material-ui/icons/LaunchOutlined';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import useMyAPI from 'components/hooks/useMyAPI';
import 'moment/locale/fr';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow } from '../DivTable';
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

type Props = {
  services: JSONFeedItem[];
  setService?: (svc: string) => void;
  onUpdate?: (svc: string, updateData: UpdateData) => void;
};

const useStyles = makeStyles(theme => ({
  center: {
    textAlign: 'center'
  }
}));

const WrappedNewServiceTable: React.FC<Props> = ({ services, setService, onUpdate }: Props) => {
  const { t } = useTranslation(['search']);
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  const navigate = useCallback(url => {
    window.open(url, '_blank');
  }, []);

  const onInstall = useCallback(
    (service: JSONFeedItem) => {
      console.log({
        name: service.summary,
        update_data: {
          auth: null,
          image: service.id + ':latest',
          latest_tag: 'latest',
          update_available: true,
          updating: false
        }
      });

      apiCall({
        method: 'PUT',
        url: '/api/v4/service/install/',
        body: {
          name: service.summary,
          update_data: {
            auth: null,
            image: service.id + ':latest',
            latest_tag: 'latest',
            update_available: true,
            updating: false
          }
        },
        onSuccess: response => {
          console.log(response);
          // const newUpdates = { ...updates };
          // newUpdates[svc] = { ...newUpdates[svc], updating: true };
          // setUpdates(newUpdates);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return services ? (
    services.length !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.name')}</DivTableCell>
              <DivTableCell>{t('header.description')}</DivTableCell>
              <DivTableCell>{t('header.docs')}</DivTableCell>
              <DivTableCell>{t('header.install')}</DivTableCell>
              <DivTableCell />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {services.map((service, i) => (
              <TableRow
                key={i + ' - ' + service.title}
                component={props => <div {...props} />}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell>{service.summary}</DivTableCell>
                <DivTableCell>{service.content_text}</DivTableCell>
                <DivTableCell className={classes.center}>
                  <Tooltip title={service.url}>
                    <IconButton size="small" onClick={e => navigate(service.url)}>
                      <LaunchOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell className={classes.center}>
                  <Tooltip title={service.external_url}>
                    <IconButton color="primary" size="small" onClick={e => onInstall(service)}>
                      <CloudDownloadOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </DivTableCell>
              </TableRow>
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
