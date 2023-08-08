import { Card, Grid, Tooltip, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CgSmartphoneChip, CgSmartphoneRam } from 'react-icons/cg';
import { SiLinux, SiWindows } from 'react-icons/si';
import { Container, Volume } from '../service_detail';
import ContainerDialog from './container_dialog';

const useStyles = makeStyles(theme => ({
  card: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    padding: '8px',
    margin: '0.25rem 0',
    overflow: 'auto',
    wordBreak: 'break-word',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? '#ffffff10' : '#00000005',
      cursor: 'pointer'
    }
  },
  card_title: {
    fontSize: 'larger',
    fontFamily: 'monospace'
  },
  label: {
    fontWeight: 500
  },
  mono: {
    fontFamily: 'monospace'
  }
}));

type ContainerCardProps = {
  container: Container;
  defaults: Container;
  name?: string;
  volumes?: { [name: string]: Volume };
  onChange: (newContainer: Container, name?: string, newVolumes?: { [name: string]: Volume }) => void;
};

const OS_ICONS = {
  linux: <SiLinux size={24} style={{ verticalAlign: 'middle' }} />,
  windows: <SiWindows size={24} style={{ verticalAlign: 'middle' }} />
};

const WrappedContainerCard = ({ container, defaults, name, volumes, onChange }: ContainerCardProps) => {
  const { t } = useTranslation(['adminServices']);
  const [dialog, setDialog] = useState(false);
  const theme = useTheme();
  const classes = useStyles();
  const yesColor = theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark;
  const noColor = theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark;

  const handleContainerChange = (tempContainer, tempName, tempVolumes) => {
    onChange(tempContainer, tempName, tempVolumes);
  };

  return container ? (
    <div style={{ paddingTop: theme.spacing(1) }}>
      <ContainerDialog
        open={dialog}
        setOpen={setDialog}
        name={name}
        container={container}
        defaults={defaults}
        volumes={volumes}
        onSave={handleContainerChange}
      />
      <Card className={classes.card} onClick={() => setDialog(true)}>
        <Grid container>
          {name && (
            <Grid item xs={12} className={classes.card_title} style={{ fontWeight: 700 }}>
              {name}
            </Grid>
          )}
          <Grid item xs={12} className={classes.card_title}>
            {container.image}
          </Grid>
          {container.registry_password && container.registry_username && (
            <Grid item xs={12}>
              <i>{t('container.card.creds')}</i>
            </Grid>
          )}
          <Grid item xs={12} style={{ paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) }}>
            <Tooltip title={t('container.card.cpu')}>
              <div style={{ display: 'inline-block', paddingRight: theme.spacing(4) }}>
                <CgSmartphoneChip size={24} style={{ verticalAlign: 'middle' }} />
                <span style={{ paddingLeft: theme.spacing(1), verticalAlign: 'middle' }}>{container.cpu_cores}</span>
              </div>
            </Tooltip>
            <Tooltip title={t('container.card.ram')}>
              <div style={{ display: 'inline-block', paddingRight: theme.spacing(4) }}>
                <CgSmartphoneRam size={24} style={{ verticalAlign: 'middle' }} />
                <span style={{ paddingLeft: theme.spacing(1), verticalAlign: 'middle' }}>{container.ram_mb}</span>
              </div>
            </Tooltip>
            {container.operating_system ? (
              <Tooltip title={t('container.card.os')}>
                <div style={{ display: 'inline-block', paddingRight: theme.spacing(4) }}>
                  {OS_ICONS[container.operating_system]}
                </div>
              </Tooltip>
            ) : null}
          </Grid>
          {container.service_account && (
            <>
              <Grid item xs={5} sm={4} md={2} className={classes.label}>{`${t(
                'container.card.service_account'
              )}:`}</Grid>
              <Grid item xs={7} sm={8} md={10} className={classes.mono}>
                {container.service_account}
              </Grid>
            </>
          )}
          {container.command && (
            <>
              <Grid item xs={5} sm={4} md={2} className={classes.label}>{`${t('container.card.command')}:`}</Grid>
              <Grid item xs={7} sm={8} md={10} className={classes.mono}>
                {container.command.join(' ')}
              </Grid>
            </>
          )}
          <Grid item xs={5} sm={4} md={2} className={classes.label}>{`${t('container.card.internet')}:`}</Grid>
          <Grid
            item
            xs={7}
            sm={8}
            md={10}
            className={classes.mono}
            style={{ color: container.allow_internet_access ? yesColor : noColor }}
          >
            {container.allow_internet_access ? t('container.card.yes') : t('container.card.no')}
          </Grid>
          {container.environment && container.environment.length !== 0 && (
            <Grid item xs={12}>
              <div className={classes.label}>{`${t('container.card.env')}:`}&nbsp;</div>
              {container.environment.map((env, id) => (
                <div key={id} className={classes.mono} style={{ paddingLeft: '2rem' }}>
                  {`${env.name} = ${env.value}`}
                </div>
              ))}
            </Grid>
          )}
          {volumes && Object.keys(volumes).length !== 0 && (
            <Grid item xs={12}>
              <div className={classes.label}>{`${t('container.card.volumes')}:`}&nbsp;</div>
              {Object.keys(volumes).map((vol, id) => (
                <div key={id} className={classes.mono} style={{ paddingLeft: '2rem' }}>
                  {`${vol} = ${volumes[vol].mount_path} (${volumes[vol].storage_class}|${volumes[vol].access_mode}|${volumes[vol].capacity}B)`}
                </div>
              ))}
            </Grid>
          )}
        </Grid>
      </Card>
    </div>
  ) : null;
};

WrappedContainerCard.defaultProps = {
  name: null,
  volumes: null
};

const ContainerCard = React.memo(WrappedContainerCard);
export default ContainerCard;
