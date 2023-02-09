import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import 'moment/locale/fr';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceDetail } from '../service_detail';
import ContainerCard from './container_card';
import ContainerDialog from './container_dialog';
import ResetButton from './reset_button';

type ServiceContainerProps = {
  service: ServiceDetail;
  defaults: ServiceDetail;
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
};

const ServiceContainer = ({ service, defaults, setService, setModified }: ServiceContainerProps) => {
  const { t } = useTranslation(['adminServices']);
  const [dialog, setDialog] = useState(false);
  const theme = useTheme();

  const handleChannelChange = event => {
    setModified(true);
    setService({ ...service, update_channel: event.target.value });
  };

  const onDependencyDelete = name => {
    const depList = { ...service.dependencies };
    delete depList[name];
    setModified(true);
    setService({ ...service, dependencies: depList });
  };

  const handleContainerImageChange = newContainer => {
    setModified(true);
    setService({ ...service, docker_config: newContainer });
  };

  const handleDependencyChange = (newDep, name, newVolumes) => {
    const depList = { ...service.dependencies };
    depList[name] = { container: newDep, volumes: newVolumes };
    setModified(true);
    setService({ ...service, dependencies: depList });
  };

  const handlePrivilegedToggle = () => {
    setModified(true);
    setService({ ...service, privileged: !service.privileged });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">{t('container')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">
          {t('container.channel')}
          <ResetButton
            service={service}
            defaults={defaults}
            field="update_channel"
            reset={() => {
              setModified(true);
              setService({ ...service, update_channel: defaults.update_channel });
            }}
          />
        </Typography>
        {service ? (
          <FormControl size="small" fullWidth>
            <Select
              id="channel"
              fullWidth
              value={service.update_channel}
              onChange={handleChannelChange}
              variant="outlined"
              style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
            >
              <MenuItem value="stable">{t('container.channel.stable')}</MenuItem>
              {/* <MenuItem value="rc">{t('container.channel.rc')}</MenuItem> */}
              {/* <MenuItem value="beta">{t('container.channel.beta')}</MenuItem> */}
              <MenuItem value="dev">{t('container.channel.dev')}</MenuItem>
            </Select>
          </FormControl>
        ) : (
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">
          {t('container.privileged')}
          <ResetButton
            service={service}
            defaults={defaults}
            field="privileged"
            reset={() => {
              setModified(true);
              setService({ ...service, privileged: !!defaults.privileged });
            }}
          />
        </Typography>
        {service ? (
          <RadioGroup value={service.privileged} onChange={handlePrivilegedToggle}>
            <FormControlLabel value control={<Radio />} label={t('container.privileged.true')} />
            <FormControlLabel value={false} control={<Radio />} label={t('container.privileged.false')} />
          </RadioGroup>
        ) : (
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('container.image')}</Typography>
        {service ? (
          <ContainerCard
            container={service.docker_config}
            defaults={defaults ? defaults.docker_config : null}
            onChange={handleContainerImageChange}
          />
        ) : (
          <Skeleton style={{ height: '8rem' }} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('container.dependencies')}</Typography>
        {service ? (
          Object.keys(service.dependencies).length !== 0 ? (
            Object.keys(service.dependencies).map(name => (
              <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ paddingRight: theme.spacing(1), flexGrow: 1 }}>
                  <ContainerCard
                    name={name}
                    container={service.dependencies[name].container}
                    defaults={defaults && defaults.dependencies[name] ? defaults.dependencies[name].container : null}
                    volumes={service.dependencies[name].volumes}
                    onChange={handleDependencyChange}
                  />
                </div>
                <div>
                  <Tooltip title={t('container.dependencies.remove')}>
                    <IconButton
                      style={{
                        color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                      onClick={() => onDependencyDelete(name)}
                      size="large"
                    >
                      <RemoveCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            ))
          ) : (
            <Typography color="textSecondary" variant="caption" component="div">
              {t('container.dependencies.none')}
            </Typography>
          )
        ) : (
          <Skeleton style={{ height: '8rem' }} />
        )}
      </Grid>
      <Grid item xs={12}>
        <ContainerDialog open={dialog} setOpen={setDialog} name="" volumes={{}} onSave={handleDependencyChange} />
        <Button variant="contained" color="primary" onClick={() => setDialog(true)}>
          {t('container.dependencies.add')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ServiceContainer;
