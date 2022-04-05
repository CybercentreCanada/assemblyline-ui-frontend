import { Grid, MenuItem, Select, Typography, useTheme } from '@material-ui/core';
import ArrowDownwardOutlinedIcon from '@material-ui/icons/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@material-ui/icons/ArrowUpwardOutlined';
import { Skeleton } from '@material-ui/lab';
import useUser from 'commons/components/hooks/useAppUser';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import LineGraph from 'components/visual/LineGraph';
import 'moment/locale/fr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation } from 'react-router-dom';

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
          {stats ? (
            <LineGraph
              dataset={stats.result.score.distribution}
              datatype={stats.version}
              height="200px"
              title={t('result.score.distribution')}
              titleSize={20}
            />
          ) : (
            <Skeleton variant="rect" height="200px" width="100%" />
          )}
        </div>
        <Counter stats={stats} comp={comp} field={'file.extracted.avg'} />
        <Counter stats={stats} comp={comp} field={'file.supplementary.avg'} />
        <div style={{ marginBottom: theme.spacing(2) }}>
          {stats ? (
            <LineGraph
              dataset={stats.heuristic}
              datatype={stats.version}
              sorter={(a, b) => parseInt(a.split('.', 2)[1]) - parseInt(b.split('.', 2)[1])}
              height="250px"
              title={t('heuristic')}
              titleSize={20}
            />
          ) : (
            <Skeleton variant="rect" height="200px" width="100%" />
          )}
        </div>
        <div style={{ marginBottom: theme.spacing(2) }}>
          {stats ? (
            <LineGraph
              dataset={stats.error}
              datatype={stats.version}
              height="250px"
              title={t('error')}
              titleSize={20}
            />
          ) : (
            <Skeleton variant="rect" height="200px" width="100%" />
          )}
        </div>
      </div>
    )
  );
}

function VersionSelector({ possibleVersions, selectedService, version, setVersion, except }) {
  const theme = useTheme();
  const { t } = useTranslation(['adminServiceReview']);
  return selectedService && possibleVersions ? (
    <Select
      fullWidth
      value={version}
      onChange={event => setVersion(event.target.value)}
      displayEmpty
      variant="outlined"
      margin="dense"
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
  ) : (
    <Skeleton variant="rect" height={theme.spacing(5)} width="100%" />
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
  const { user: currentUser } = useUser<CustomUser>();

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

  useEffect(() => {
    if (currentUser.is_admin) {
      apiCall({
        url: '/api/v4/service/all/',
        onSuccess: api_data => {
          setServices(api_data.api_response.map(srv => srv.name));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <Select
                  id="channel"
                  fullWidth
                  value={selectedService}
                  onChange={handleServiceChange}
                  displayEmpty
                  variant="outlined"
                  margin="dense"
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
              </div>
            </>
          ) : (
            <Skeleton variant="rect" height={theme.spacing(5)} width={theme.spacing(30)} />
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
    <Redirect to="/forbidden" />
  );
}
