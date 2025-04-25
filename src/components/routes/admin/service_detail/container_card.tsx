import { Card, Grid, Tooltip, useTheme } from '@mui/material';
import type { DockerConfig, PersistentVolume } from 'components/models/base/service';
import ContainerDialog from 'components/routes/admin/service_detail/container_dialog';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CgSmartphoneChip, CgSmartphoneRam } from 'react-icons/cg';

type ContainerCardProps = {
  container: DockerConfig;
  defaults: DockerConfig;
  name?: string;
  volumes?: Record<string, PersistentVolume>;
  onChange: (newContainer: DockerConfig, name?: string, newVolumes?: Record<string, PersistentVolume>) => void;
};

const WrappedContainerCard = ({ container, defaults, name = null, volumes = null, onChange }: ContainerCardProps) => {
  const { t } = useTranslation(['adminServices']);
  const [dialog, setDialog] = useState(false);
  const theme = useTheme();
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
      <Card
        onClick={() => setDialog(true)}
        sx={{
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
        }}
      >
        <Grid container>
          {name && (
            <Grid size={{ xs: 12 }} sx={{ fontWeight: 700, fontSize: 'larger', fontFamily: 'monospace' }}>
              {name}
            </Grid>
          )}
          <Grid
            size={{ xs: 12 }}
            sx={{
              fontSize: 'larger',
              fontFamily: 'monospace'
            }}
          >
            {container.image}
          </Grid>
          {container.registry_password && container.registry_username && (
            <Grid size={{ xs: 12 }}>
              <i>{t('container.card.creds')}</i>
            </Grid>
          )}
          <Grid size={{ xs: 12 }} style={{ paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) }}>
            <Tooltip title={t('container.card.cpu')}>
              <div style={{ display: 'inline-block', paddingRight: theme.spacing(4) }}>
                <CgSmartphoneChip size={24} style={{ verticalAlign: 'middle' }} />
                <span style={{ paddingLeft: theme.spacing(1), verticalAlign: 'middle' }}>{container.cpu_cores}</span>
              </div>
            </Tooltip>
            <Tooltip title={t('container.card.ram')}>
              <div style={{ display: 'inline-block' }}>
                <CgSmartphoneRam size={24} style={{ verticalAlign: 'middle' }} />
                <span style={{ paddingLeft: theme.spacing(1), verticalAlign: 'middle' }}>{container.ram_mb}</span>
              </div>
            </Tooltip>
          </Grid>
          {container.service_account && (
            <>
              <Grid size={{ xs: 5, sm: 4, md: 2 }} style={{ fontWeight: 500 }}>
                {`${t('container.card.service_account')}:`}
              </Grid>
              <Grid size={{ xs: 7, sm: 8, md: 10 }} style={{ fontFamily: 'monospace' }}>
                {container.service_account}
              </Grid>
            </>
          )}
          {container.command && (
            <>
              <Grid size={{ xs: 5, sm: 4, md: 2 }} style={{ fontWeight: 500 }}>
                {`${t('container.card.command')}:`}
              </Grid>
              <Grid size={{ xs: 7, sm: 8, md: 10 }} style={{ fontFamily: 'monospace' }}>
                {container.command.join(' ')}
              </Grid>
            </>
          )}
          <Grid size={{ xs: 5, sm: 4, md: 2 }} style={{ fontWeight: 500 }}>{`${t('container.card.internet')}:`}</Grid>
          <Grid
            size={{ xs: 7, sm: 8, md: 10 }}
            style={{ color: container.allow_internet_access ? yesColor : noColor, fontFamily: 'monospace' }}
          >
            {container.allow_internet_access ? t('container.card.yes') : t('container.card.no')}
          </Grid>
          {container.environment && container.environment.length !== 0 && (
            <Grid size={{ xs: 12 }}>
              <div style={{ fontWeight: 500 }}>{`${t('container.card.env')}:`}&nbsp;</div>
              {container.environment.map((env, id) => (
                <div key={id} style={{ paddingLeft: '2rem', fontFamily: 'monospace' }}>
                  {`${env.name} = ${env.value}`}
                </div>
              ))}
            </Grid>
          )}
          {volumes && Object.keys(volumes).length !== 0 && (
            <Grid size={{ xs: 12 }}>
              <div style={{ fontWeight: 500 }}>{`${t('container.card.volumes')}:`}&nbsp;</div>
              {Object.keys(volumes).map((vol, id) => (
                <div key={id} style={{ paddingLeft: '2rem', fontFamily: 'monospace' }}>
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

const ContainerCard = React.memo(WrappedContainerCard);
export default ContainerCard;
