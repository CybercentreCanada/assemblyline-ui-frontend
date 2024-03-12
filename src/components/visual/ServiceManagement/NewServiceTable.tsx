import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import { AlertTitle, IconButton, Paper, Skeleton, TableContainer, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { JSONFeedItem } from '.';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, ExternalLinkRow } from '../DivTable';
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
  services: JSONFeedItem[];
  installingServices: string[];
  onInstall: (s: JSONFeedItem[]) => void;
};

const useStyles = makeStyles(() => ({
  center: {
    textAlign: 'center'
  }
}));

const WrappedNewServiceTable: React.FC<Props> = ({ services, installingServices, onInstall }: Props) => {
  const { t } = useTranslation(['search']);
  const classes = useStyles();

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
              <ExternalLinkRow key={i + ' - ' + service.title} hover href={service.url}>
                <DivTableCell>{service.summary}</DivTableCell>
                <DivTableCell>{service.content_text}</DivTableCell>
                <DivTableCell
                  className={classes.center}
                  style={{ whiteSpace: 'nowrap', paddingTop: 0, paddingBottom: 0, width: 0 }}
                >
                  <Tooltip
                    PopperProps={{
                      disablePortal: true
                    }}
                    disableInteractive
                    placement="left"
                    title={
                      installingServices?.includes(service?.summary)
                        ? t('installing')
                        : `${t('install')} ${service.summary}`
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
                        disabled={installingServices?.includes(service?.summary)}
                        size="large"
                      >
                        <CloudDownloadOutlinedIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </DivTableCell>
              </ExternalLinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_services_available_title')}</AlertTitle>
          {t('no_services_available_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const NewServiceTable = React.memo(
  WrappedNewServiceTable,
  (prevProps: Readonly<React.PropsWithChildren<Props>>, nextProps: Readonly<React.PropsWithChildren<Props>>) => {
    function arrayEquals(a, b) {
      return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
    }

    return (
      Object.is(prevProps.onInstall, nextProps.onInstall) &&
      arrayEquals(prevProps.installingServices, nextProps.installingServices) &&
      arrayEquals(
        prevProps.services?.map(s => s?.summary),
        nextProps.services?.map(s => s?.summary)
      )
    );
  }
);

export default NewServiceTable;
