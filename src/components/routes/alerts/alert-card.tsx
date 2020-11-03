import { Button, Grid, Hidden, IconButton, Paper, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import MoodIcon from '@material-ui/icons/Mood';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { AlertItem } from 'components/routes/alerts/hooks/useAlerts';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import ExtendedScan from 'components/visual/ExtendedScan';
import Verdict from 'components/visual/Verdict';
import VerdictBar from 'components/visual/VerdictBar';
import { bytesToSize } from 'helpers/utils';
import 'moment-timezone';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';

type AlertCardItemProps = {
  item: AlertItem;
  setItem?: (item: AlertItem) => null;
};

const AlertCardItem: React.FC<AlertCardItemProps> = ({ item, setItem = null }) => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const isDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const apiCall = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { user: currentUser } = useAppContext();

  function setVerdict(verdict) {
    if (item.verdict[verdict].indexOf(currentUser.username) !== -1) {
      showSuccessMessage(t(`verdict.success.${verdict}`));
      return;
    }

    apiCall({
      method: 'PUT',
      url: `/api/v4/alert/verdict/${item.alert_id}/${verdict}/`,
      onSuccess: api_data => {
        if (setItem !== null) {
          const newVerdict = { ...item.verdict };
          if (verdict === 'malicious') {
            if (newVerdict.malicious.indexOf(currentUser.username) === -1) {
              newVerdict.malicious.push(currentUser.username);
            }
            if (newVerdict.non_malicious.indexOf(currentUser.username) !== -1) {
              newVerdict.non_malicious.splice(newVerdict.non_malicious.indexOf(currentUser.username), 1);
            }
          } else {
            if (newVerdict.non_malicious.indexOf(currentUser.username) === -1) {
              newVerdict.non_malicious.push(currentUser.username);
            }
            if (newVerdict.malicious.indexOf(currentUser.username) !== -1) {
              newVerdict.malicious.splice(newVerdict.malicious.indexOf(currentUser.username), 1);
            }
          }

          setItem({ ...item, verdict: newVerdict });
        }
        showSuccessMessage(t(`verdict.success.${verdict}`));
      }
    });
  }

  function takeOwnership() {
    apiCall({
      url: `/api/v4/alert/ownership/${item.alert_id}/`,
      onSuccess: api_data => {
        if (setItem !== null) {
          setItem({ ...item, owner: currentUser.username });
        }
        showSuccessMessage(t('take_ownership.success'));
      }
    });
  }

  return (
    <Paper
      style={{
        marginTop: sp2,
        marginBottom: sp2,
        padding: sp2,
        backgroundColor: item.owner !== null ? '#00f2000f' : item.al.attrib.length !== 0 ? '#f200000f' : null
      }}
    >
      <Hidden mdUp>
        <Classification c12n={item.classification} size="tiny" type="outlined" />
      </Hidden>
      <Grid container spacing={2}>
        <Grid
          item
          xs={12}
          md={2}
          lg={1}
          style={{
            display: isDownSM ? 'flex' : null,
            flexDirection: 'row',
            justifyContent: 'space-between',
            textAlign: 'center',
            paddingTop: isDownSM ? sp4 : 0,
            paddingBottom: isDownSM ? sp2 : 0
          }}
        >
          <div
            style={{
              paddingTop: isDownSM ? 0 : sp1
            }}
          >
            <Verdict score={item.al.score} />
          </div>
          {!isDownSM && item.group_count && (
            <div style={{ paddingTop: sp2, color: theme.palette.primary.main }}>
              <h2>{`${item.group_count}x`}</h2>
            </div>
          )}
          {!isDownSM && item.extended_scan && (
            <div style={{ paddingTop: sp2 }}>
              <ExtendedScan state={item.extended_scan} />
            </div>
          )}
          <div style={{ paddingTop: isDownSM ? 0 : sp4, width: '100%', maxWidth: '120px', display: 'inline-block' }}>
            <VerdictBar verdicts={item.verdict} />
            <Grid container>
              <Grid item xs={5} style={{ textAlign: 'left' }}>
                <IconButton size="small" onClick={() => setVerdict('malicious')}>
                  <MoodBadIcon />
                </IconButton>
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={5} style={{ textAlign: 'right' }}>
                <IconButton size="small" onClick={() => setVerdict('non_malicious')}>
                  <MoodIcon />
                </IconButton>
              </Grid>
            </Grid>
          </div>
        </Grid>

        <Grid item xs={12} md={10} lg={11}>
          <Grid container spacing={1}>
            <Grid item xs={3} md={2}>
              <b>{item.type}</b>
            </Grid>
            <Grid item xs={9} md={6}>
              <Moment format="YYYY-MM-DD HH:mm:ss.SSS (zz)" tz="utc">
                {item.ts}
              </Moment>
            </Grid>
            <Hidden smDown>
              <Grid item md={4} style={{ textAlign: 'right' }}>
                <Classification c12n={item.classification} size="tiny" type="outlined" inline />
              </Grid>
            </Hidden>

            {item.filtered && (
              <>
                <Grid item xs="auto" md={2} />
                <Grid item xs={12} md={10}>
                  <b>{t('data_filtered_msg')}</b>
                </Grid>
              </>
            )}
          </Grid>

          <Hidden mdUp>
            <Grid container style={{ paddingTop: sp2 }}>
              <Grid item xs={3}>
                <b>{t('group_count')}</b>
              </Grid>
              <Grid item xs={9}>
                {item.group_count}
              </Grid>
              <Grid item xs={3}>
                <b>{t('extended')}</b>
              </Grid>
              <Grid item xs={9} style={{ textTransform: 'capitalize' }}>
                {item.extended_scan}
              </Grid>
            </Grid>
          </Hidden>

          <Grid container style={{ paddingTop: sp2 }}>
            <Grid item xs={3} md={2}>
              <b>{t('label')}</b>
            </Grid>
            <Grid item xs={9} md={10}>
              {item.label.map((l, i) => {
                return <CustomChip key={i} label={l} size="tiny" type="square" />;
              })}
            </Grid>

            <Grid item xs={3} md={2}>
              <b>{t('priority')}</b>
            </Grid>
            <Grid item xs={9} md={10}>
              <CustomChip label={item.priority} size="tiny" type="square" />
            </Grid>

            <Grid item xs={3} md={2}>
              <b>{t('status')}</b>
            </Grid>
            <Grid item xs={9} md={10}>
              <CustomChip label={item.status} size="tiny" type="square" />
            </Grid>
          </Grid>

          <Grid container style={{ paddingTop: sp2 }}>
            <Grid item xs={12} md={2}>
              <b>{t('file_info')}</b>
            </Grid>
            <Grid item xs={12} md={10}>
              <span style={{ color: theme.palette.primary.main, fontWeight: 500 }}>{item.file.name}</span>
            </Grid>
            <Grid item xs="auto" md={2} />
            <Grid item xs={12} md={10}>
              {item.file.type}
            </Grid>
            <Grid item xs="auto" md={2} />
            <Grid item xs={12} md={10}>
              <b>{item.file.size} </b>
              <span style={{ fontWeight: 300 }}>({bytesToSize(item.file.size)})</span>
            </Grid>
            <Hidden smDown>
              <Grid item md={2}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>MD5</span>
              </Grid>
            </Hidden>
            <Grid item xs={12} md={10}>
              <span style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>{item.file.md5}</span>
            </Grid>
            <Hidden smDown>
              <Grid item md={2}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>SHA1</span>
              </Grid>
            </Hidden>
            <Grid item xs={12} md={10}>
              <span style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>{item.file.sha1}</span>
            </Grid>
            <Hidden smDown>
              <Grid item md={2}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>SHA256</span>
              </Grid>
            </Hidden>
            <Grid item xs={12} md={10}>
              <span style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>{item.file.sha256}</span>
            </Grid>
          </Grid>

          {(item.owner || item.hint_owner) && (
            <Grid container style={{ paddingTop: sp2 }}>
              <Grid item xs={12} md={2}>
                <b>{t('ownership')}</b>
              </Grid>
              <Grid item xs={12} md={10}>
                <b>{item.owner || t('hint_owner')}</b>
              </Grid>
            </Grid>
          )}

          {Object.keys(item.metadata).length !== 0 && (
            <div style={{ paddingTop: sp2 }}>
              {Object.keys(item.metadata).map((key, i) => {
                return (
                  <Grid container key={i}>
                    <Grid item xs={12} md={2}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {key.replace('.', ' ').replace('_', ' ')}
                      </span>
                    </Grid>
                    <Grid item xs={12} md={10}>
                      {item.metadata[key]}
                    </Grid>
                  </Grid>
                );
              })}
            </div>
          )}

          <Grid container style={{ paddingTop: sp2 }}>
            <Grid item xs={12} md={2}>
              <b>{t('category')}</b>
            </Grid>
            <Grid item xs={12} md={10}>
              <span style={{ color: theme.palette.primary.light, fontWeight: 500 }}>
                {item.attack.category.join(' | ')}
              </span>
            </Grid>
            <Grid item xs={12} md={2}>
              <b>{t('patterns')}</b>
            </Grid>
            <Grid item xs={12} md={10}>
              <span style={{ color: theme.palette.primary.light, fontWeight: 500 }}>
                {item.attack.pattern.join(' | ')}
              </span>
            </Grid>
            <Grid item xs={12} md={2}>
              <b>{t('heuristic')}</b>
            </Grid>
            <Grid item xs={12} md={10}>
              <span style={{ color: theme.palette.primary.light, fontWeight: 300 }}>
                {item.heuristic.name.join(' | ')}
              </span>
            </Grid>
            <Grid item xs={12} md={2}>
              <b>{t('behaviors')}</b>
            </Grid>
            <Grid item xs={12} md={10}>
              <span style={{ color: theme.palette.primary.light, fontWeight: 300 }}>
                {item.al.behavior.join(' | ')}
              </span>
            </Grid>
            <Grid item xs={12} md={2}>
              <b>{t('attributions')}</b>
            </Grid>
            <Grid item xs={12} md={10}>
              <span style={{ color: theme.palette.error.dark, fontWeight: 500 }}>{item.al.attrib.join(' | ')}</span>
            </Grid>
            <Grid item xs={12} md={2}>
              <b>{t('avhits')}</b>
            </Grid>
            <Grid item xs={12} md={10}>
              <span style={{ color: theme.palette.secondary.dark, fontWeight: 500 }}>{item.al.av.join(' | ')}</span>
            </Grid>
            <Grid item xs={12} md={2}>
              <b>{t('ip')}</b>
            </Grid>
            <Grid item xs={12} md={10} style={{ color: theme.palette.success.dark }}>
              <span style={{ fontWeight: 500 }}>{item.al.ip_dynamic.join(' | ')}</span>
              <span>
                {item.al.ip_dynamic.length !== 0 && ' | '}
                {item.al.ip_static.join(' | ')}
              </span>
            </Grid>
            <Grid item xs={12} md={2}>
              <b>{t('domain')}</b>
            </Grid>
            <Grid item xs={12} md={10} style={{ color: theme.palette.success.dark }}>
              <span style={{ fontWeight: 500 }}>{item.al.domain_dynamic.join(' | ')}</span>
              <span>
                {item.al.domain_dynamic.length !== 0 && ' | '}
                {item.al.domain_static.join(' | ')}
              </span>
            </Grid>
            <Grid item xs={12} md={2}>
              <b>{t('yara')}</b>
            </Grid>
            <Grid item xs={12} md={10}>
              {item.al.yara.join(' | ')}
            </Grid>
          </Grid>
          <div style={{ paddingTop: sp2 }}>
            <Button
              component={Link}
              size="small"
              variant="outlined"
              style={{ fontSize: '80%', marginBottom: '4px', marginRight: '4px' }}
              to={`/submission/${item.sid}`}
            >
              {t('btn.submission')}
            </Button>
            <Button
              component={Link}
              size="small"
              variant="outlined"
              style={{ fontSize: '80%', marginBottom: '4px', marginRight: '4px' }}
              to={`/search/?q=${item.file.sha256}`}
            >
              {t('btn.sha256')}
            </Button>
            <Button
              disabled={item.owner !== null}
              size="small"
              variant="outlined"
              style={{ fontSize: '80%', marginBottom: '4px', marginRight: '4px' }}
              onClick={() => takeOwnership()}
            >
              {t('btn.ownership')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              style={{ fontSize: '80%', marginBottom: '4px', marginRight: '4px' }}
              onClick={() => alert('NOT DONE YET')}
            >
              {t('btn.workflow')}
            </Button>
          </div>
        </Grid>

        <Grid item xs={12} style={{ textAlign: 'right' }}>
          <Typography variant="caption" color="secondary" style={{ fontSize: '80%' }}>
            {`${item.alert_id} :: `}
            <Moment fromNow>{item.reporting_ts}</Moment>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

//
export default AlertCardItem;
