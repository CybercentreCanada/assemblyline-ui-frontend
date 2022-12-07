import { IconButton, makeStyles, Paper, TableContainer, TableRow, Tooltip } from '@material-ui/core';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import 'moment/locale/fr';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceFeedItem } from '.';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow } from '../DivTable';
import InformativeAlert from '../InformativeAlert';

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

type Props = {
  services: ServiceFeedItem[];
  installingServices: ServiceFeedItem[];
  onInstall: (s: ServiceFeedItem[]) => void;
};

const useStyles = makeStyles(theme => ({
  center: {
    textAlign: 'center'
  }
}));

const WrappedNewServiceTable: React.FC<Props> = ({ services, installingServices, onInstall }: Props) => {
  const { t } = useTranslation(['search']);
  const classes = useStyles();

  const navigate = useCallback(url => {
    window.open(url, '_blank');
  }, []);

  const installingNames = useMemo<string[]>(
    () =>
      !installingServices
        ? []
        : !Array.isArray(installingServices)
        ? []
        : installingServices?.map(s => s?.summary?.toLowerCase()),
    [installingServices]
  );

  return services ? (
    services.length !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.name')}</DivTableCell>
              <DivTableCell>{t('header.description')}</DivTableCell>
              <DivTableCell />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {services?.map((service, i) => (
              <TableRow
                key={i + ' - ' + service.title}
                component={props => <div {...props} />}
                hover
                style={{ cursor: 'pointer', textDecoration: 'none' }}
                onClick={e => navigate(service.url)}
              >
                <DivTableCell>{service.summary}</DivTableCell>
                <DivTableCell>{service.content_text}</DivTableCell>
                <DivTableCell
                  className={classes.center}
                  style={{ whiteSpace: 'nowrap', paddingTop: 0, paddingBottom: 0 }}
                >
                  <Tooltip
                    title={
                      installingNames.includes(service?.summary.toLowerCase())
                        ? t('installing')
                        : `${service.title} ${t('available')}!`
                    }
                  >
                    <span>
                      <IconButton
                        color="primary"
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          onInstall([service]);
                        }}
                        disabled={installingNames.includes(service?.summary.toLowerCase())}
                      >
                        <CloudDownloadOutlinedIcon />
                      </IconButton>
                    </span>
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
