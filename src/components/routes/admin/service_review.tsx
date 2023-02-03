import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Grid, IconButton, MenuItem, Select, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import LineGraph from 'components/visual/LineGraph';
import { getVersionQuery } from 'helpers/utils';
import 'moment/locale/fr';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';

function getDescendantProp(obj, desc) {
  if (obj == null) return null;

  var arr = desc.split('.');
  while (arr.length && (obj = obj[arr.shift()]));
  return obj;
}

function DiffNumber({ stats, comp, field, variant = 'h4' as 'h4' }) {
  const prop1 = getDescendantProp(stats, field);
  const prop2 = getDescendantProp(comp, field);
  const v1 = Math.round(prop1);
  const v2 = Math.round(prop2);

  return (
    <Typography variant={variant} align="center">
      {prop1 != null ? v1 : <Skeleton width="4rem" style={{ display: 'inline-block' }} />}
      {prop1 != null && prop2 != null ? (
        v1 > v2 ? (
          <ArrowUpwardOutlinedIcon style={{ verticalAlign: 'middle' }} />
        ) : v2 > v1 ? (
          <ArrowDownwardOutlinedIcon style={{ verticalAlign: 'middle' }} />
        ) : null
      ) : null}
    </Typography>
  );
}

function Counter({ stats, comp, field, titleVariant = 'h6' as 'h6', numberVariant = 'h4' as 'h4' }) {
  const { t } = useTranslation(['adminServiceReview']);
  const theme = useTheme();
  return (
    <div style={{ marginBottom: theme.spacing(1) }}>
      <Typography variant={titleVariant} align="center">
        {t(field)}
      </Typography>
      <DiffNumber stats={stats} comp={comp} field={field} variant={numberVariant} />
    </div>
  );
}

function ServiceDetail({ stats, comp, show }) {
  const { t } = useTranslation(['adminServiceReview']);
  const theme = useTheme();
  return (
    show && (
      <div style={{ marginTop: theme.spacing(4), marginBottom: theme.spacing(4) }}>
        <Typography variant="h3" align="center" gutterBottom>
          {stats ? stats.service.version : <Skeleton width="10rem" style={{ display: 'inline-block' }} />}
        </Typography>
        <Counter stats={stats} comp={comp} field={'result.count'} />
        <Counter stats={stats} comp={comp} field={'result.score.avg'} />
        <div style={{ marginBottom: theme.spacing(2) }}>
          <LineGraph
            dataset={stats && stats.result.score.distribution}
            datatype={stats && stats.version}
            height="200px"
            title={t('result.score.distribution')}
            titleSize={20}
          />
        </div>
        <Counter stats={stats} comp={comp} field={'file.extracted.avg'} />
        <Counter stats={stats} comp={comp} field={'file.supplementary.avg'} />
        <div style={{ marginBottom: theme.spacing(2) }}>
          <LineGraph
            dataset={stats && stats.heuristic}
            datatype={stats && stats.version}
            sorter={(a, b) => parseInt(a.split('.', 2)[1]) - parseInt(b.split('.', 2)[1])}
            height="250px"
            title={t('heuristic')}
            titleSize={20}
          />
        </div>
        <div style={{ marginBottom: theme.spacing(2), display: 'flex', flexDirection: 'column' }}>
          {stats ? (
            <Tooltip title={t('errors')}>
              <IconButton
                component={Link}
                style={{ color: theme.palette.action.active, alignSelf: 'self-end' }}
                to={`/admin/errors?tc=1y&filters=response.service_name%3A${
                  stats.service.name
                }&filters=${getVersionQuery(stats.service.version)}`}
                size="large"
              >
                <ErrorOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Skeleton
              component="div"
              variant="circular"
              height="2.5rem"
              width="2.5rem"
              style={{ margin: theme.spacing(0.5), alignSelf: 'self-end' }}
            />
          )}
          <LineGraph
            dataset={stats && stats.error}
            datatype={stats && stats.version}
            height="250px"
            title={t('error')}
            titleSize={20}
          />
        </div>
      </div>
    )
  );
}

function VersionSelector({ possibleVersions, selectedService, version, setVersion, except }) {
  const theme = useTheme();
  const { t } = useTranslation(['adminServiceReview']);
  return selectedService && possibleVersions ? (
    <FormControl size="small" fullWidth>
      <Select
        fullWidth
        value={version}
        onChange={event => setVersion(event.target.value)}
        displayEmpty
        variant="outlined"
        style={{ minWidth: theme.spacing(30), color: version === '' ? theme.palette.text.disabled : null }}
      >
        <MenuItem value="" disabled>
          {t('service.version')}
        </MenuItem>
        {possibleVersions
          .filter(item => item !== except)
          .map((v, id) => (
            <MenuItem key={id} value={v}>
              {`${selectedService}: ${v}`}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  ) : (
    <Skeleton variant="rectangular" height={theme.spacing(5)} width="100%" />
  );
}

export default function ServiceReview() {
  const { t } = useTranslation(['adminServiceReview']);
  const theme = useTheme();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultSelectedService = params.get('service') || '';
  const defaultVersion1 = params.get('v1') || '';
  const defaultVersion2 = params.get('v2') || '';

  const [services, setServices] = useState(null);
  const [selectedService, setSelectedService] = useState(defaultSelectedService);
  const [possibleVersions, setPossibleVersions] = useState(null);
  const [version1, setVersion1] = useState(defaultVersion1);
  const [version2, setVersion2] = useState(defaultVersion2);
  const [stats1, setStats1] = useState(null);
  const [stats2, setStats2] = useState(null);

  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();

  const handleServiceChange = event => {
    setVersion1('');
    setVersion2('');
    setSelectedService(event.target.value);
  };

  useEffect(() => {
    if (selectedService !== '' && version1) {
      setStats1(null);
      apiCall({
        url: `/api/v4/service/stats/${selectedService}/?version=${version1}`,
        onSuccess: api_data => {
          setStats1(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version1]);

  useEffect(() => {
    if (selectedService !== '' && version2) {
      setStats2(null);
      apiCall({
        url: `/api/v4/service/stats/${selectedService}/?version=${version2}`,
        onSuccess: api_data => {
          setStats2(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version2]);

  useEffect(() => {
    if (selectedService !== '') {
      apiCall({
        url: `/api/v4/service/versions/${selectedService}/`,
        onSuccess: api_data => {
          setPossibleVersions(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  useEffectOnce(() => {
    if (currentUser.is_admin) {
      apiCall({
        url: '/api/v4/service/all/',
        onSuccess: api_data => {
          setServices(api_data.api_response.map(srv => srv.name));
        }
      });
    }
  });

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        spacing={3}
        style={{ paddingBottom: theme.spacing(2) }}
      >
        <Grid item xs={12} md>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography variant="subtitle1">{t('subtitle')}</Typography>
        </Grid>
        <Grid item xs={12} md style={{ flexGrow: 0 }}>
          {services ? (
            <>
              <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
                <FormControl size="small" fullWidth>
                  <Select
                    id="channel"
                    fullWidth
                    value={selectedService}
                    onChange={handleServiceChange}
                    displayEmpty
                    variant="outlined"
                    style={{
                      minWidth: theme.spacing(30),
                      color: selectedService === '' ? theme.palette.text.disabled : null
                    }}
                  >
                    <MenuItem value="" disabled>
                      {t('service.selection')}
                    </MenuItem>
                    {services.map((srv, id) => (
                      <MenuItem key={id} value={srv}>
                        {srv}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </>
          ) : (
            <Skeleton variant="rectangular" height={theme.spacing(5)} width={theme.spacing(30)} />
          )}
        </Grid>
      </Grid>
      {selectedService && selectedService !== '' && (
        <>
          <Typography variant="h3" align="center" gutterBottom style={{ marginTop: theme.spacing(2) }}>
            {selectedService}
          </Typography>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
            style={{ paddingTop: theme.spacing(2), paddingBottom: theme.spacing(2) }}
          >
            <Grid item xs={12} md={6}>
              <VersionSelector
                possibleVersions={possibleVersions}
                selectedService={selectedService}
                version={version1}
                except={version2}
                setVersion={setVersion1}
              />
              <ServiceDetail stats={stats1} comp={stats2} show={version1 !== ''} />
            </Grid>
            <Grid item xs={12} md={6}>
              <VersionSelector
                possibleVersions={possibleVersions}
                selectedService={selectedService}
                version={version2}
                except={version1}
                setVersion={setVersion2}
              />
              <ServiceDetail stats={stats2} comp={stats1} show={version2 !== ''} />
            </Grid>
          </Grid>
        </>
      )}
    </PageFullWidth>
  ) : (
    <Navigate to="/forbidden" replace />
  );
}
