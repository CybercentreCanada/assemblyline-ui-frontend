import {
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
  useTheme
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import makeStyles from '@mui/styles/makeStyles';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import DatePicker from 'components/visual/DatePicker';
import { RouterPrompt } from 'components/visual/RouterPrompt';

import 'moment/locale/fr';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import ForbiddenPage from '../403';

type ParamProps = {
  id: string;
};

export type BadlistAddUpdate = {
  expiry_ts: string;
  attribution: {
    actor: string[];
    campaign: string[];
    category: string[];
    exploit: string[];
    implant: string[];
    family: string[];
    network: string[];
  };
  hashes?: {
    md5: string | null;
    sha1: string | null;
    sha256: string | null;
    ssdeep: string | null;
    tlsh: string | null;
  };
  file?: {
    name: string[];
    size: number | null;
    type: string | null;
  };
  sources: {
    classification: string;
    name: string;
    reason: string[];
    type: string;
  }[];
  tag?: {
    type: string;
    value: string;
  };
  type: string | null;
};

const DEFAULT_BADLIST = {
  attribution: {
    actor: [],
    campaign: [],
    category: [],
    exploit: [],
    implant: [],
    family: [],
    network: []
  },
  expiry_ts: null,
  sources: [{ type: 'user', name: '', reason: [''], classification: null }],
  type: null
};

const DEFAULT_BADLIST_TAG = {
  tag: {
    type: '',
    value: ''
  }
};

const DEFAULT_BADLIST_FILE = {
  hashes: {
    sha256: '',
    md5: '',
    sha1: '',
    ssdeep: '',
    tlsh: ''
  },
  file: {
    name: [''],
    size: 0,
    type: ''
  }
};

const ATTRIBUTION_TYPES = ['actor', 'campaign', 'category', 'exploit', 'implant', 'family', 'network'];
const HASHES = ['md5', 'sha1', 'sha256', 'ssdeep', 'tlsh'];
const MD5_REGEX = /^[a-f0-9]{32}$/i;
const SHA1_REGEX = /^[a-f0-9]{40}$/i;
const SHA256_REGEX = /^[a-f0-9]{64}$/i;
const SSDEEP_REGEX = /^[0-9]{1,18}:[a-zA-Z0-9/+]{0,64}:[a-zA-Z0-9/+]{0,64}$/;
const TLSH_REGEX = /^((?:T1)?[0-9a-fA-F]{70})$/;
const HASH_MAP = {
  md5: MD5_REGEX,
  sha1: SHA1_REGEX,
  sha256: SHA256_REGEX,
  ssdeep: SSDEEP_REGEX,
  tlsh: TLSH_REGEX
};

const useStyles = makeStyles(theme => ({
  endAdornment: {
    paddingRight: theme.spacing(0.5)
  }
}));

const BadlistNew = () => {
  const { t } = useTranslation(['manageBadlistAdd']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [badlist, setBadlist] = useState<BadlistAddUpdate>(DEFAULT_BADLIST);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const [modified, setModified] = useState<boolean>(false);
  const [possibleTags, setPossibleTags] = useState<string[]>([]);
  const [fileTypes, setFileTypes] = useState<string[]>([]);

  const { user: currentUser, c12nDef, indexes } = useALContext();
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const navigate = useNavigate();
  const classes = useStyles();

  useEffectOnce(() => {
    const tempTags = Object.keys(indexes.result)
      .filter(k => k.indexOf('result.sections.tags') !== -1)
      .map(k => k.slice(21));
    setPossibleTags(tempTags);
    setBadlist({
      ...badlist,
      sources: [{ ...badlist.sources[0], name: currentUser.username, classification: c12nDef.UNRESTRICTED }]
    });
    apiCall({
      url: `/api/v4/help/constants/`,
      onSuccess: response => {
        setFileTypes(response.api_response.file_types.filter(item => item[0] !== '*').map(item => item[0]));
      },
      onEnter: () => setWaiting(true),
      onExit: () => setWaiting(false)
    });
  });

  useEffect(() => {
    // If there are no type selected
    if (!badlist?.type) {
      setReady(false);
      return;
    }

    // Once the user selected the type we will lock the react router
    if (badlist?.type) {
      setModified(true);
    }

    // If there are no reason
    if (badlist?.sources[0].reason[0] === '') {
      setReady(false);
      return;
    }

    //Tag specific checks
    if (badlist?.type === 'tag') {
      // Type not in the list of valid tags
      if (!possibleTags.includes(badlist?.tag.type)) {
        setReady(false);
        return;
      }
      //There are no tag value
      if (!badlist?.tag.value) {
        setReady(false);
        return;
      }
    }
    //File specific checks
    else if (badlist?.type === 'file') {
      // There is not at least one hash
      if (!badlist?.hashes?.md5 && !badlist?.hashes?.sha1 && !badlist?.hashes?.sha256) {
        setReady(false);
        return;
      }

      // Invalid MD5 hash
      if (badlist?.hashes?.md5 && !badlist.hashes.md5.match(MD5_REGEX)) {
        setReady(false);
        return;
      }

      // Invalid SHA1 hash
      if (badlist?.hashes?.sha1 && !badlist.hashes.sha1.match(SHA1_REGEX)) {
        setReady(false);
        return;
      }

      // Invalid SHA256 hash
      if (badlist?.hashes?.sha256 && !badlist.hashes.sha256.match(SHA256_REGEX)) {
        setReady(false);
        return;
      }

      // Invalid SSDEEP hash
      if (badlist?.hashes?.ssdeep && !badlist.hashes.ssdeep.match(SSDEEP_REGEX)) {
        setReady(false);
        return;
      }

      // Invalid TLSH hash
      if (badlist?.hashes?.tlsh && !badlist.hashes.tlsh.match(TLSH_REGEX)) {
        setReady(false);
        return;
      }
    }

    setReady(true);
  }, [badlist, possibleTags]);

  const cleanBadlist = () => {
    const data = { ...badlist };
    if (data.type === 'tag') {
      delete data.hashes;
      delete data.file;
    } else if (data.type === 'file') {
      delete data.tag;
      if (data.file.name[0] === '') {
        data.file.name = [];
      }
      if (data.file.type === '') {
        data.file.type = null;
      }
      for (const k in data.hashes) {
        if (data.hashes[k] === '') {
          data.hashes[k] = null;
        }
      }
    }
    return data;
  };

  const saveBadlist = () => {
    apiCall({
      url: `/api/v4/badlist/`,
      method: 'POST',
      body: cleanBadlist(),
      onSuccess: resp => {
        setModified(false);
        showSuccessMessage(t('add.success'));
        setTimeout(() => {
          navigate(`/manage/badlist#${resp.api_response.hash}`);
          window.dispatchEvent(new CustomEvent('reloadBadlist'));
        }, 1000);
      },
      onEnter: () => setWaiting(true),
      onExit: () => setWaiting(false)
    });
  };

  const handleTypeChange = event => {
    const extras = event.target.value === 'tag' ? DEFAULT_BADLIST_TAG : DEFAULT_BADLIST_FILE;
    setBadlist({ ...badlist, ...extras, type: event.target.value });
  };

  return currentUser.roles.includes('badlist_view') ? (
    <PageFullWidth margin={!id ? 2 : 4}>
      <RouterPrompt when={modified} />
      <div
        style={{
          alignItems: 'start',
          display: 'flex',
          float: 'right',
          marginTop: theme.spacing(-8),
          marginRight: theme.spacing(-1),
          position: 'sticky',
          top: theme.spacing(2),
          zIndex: 10
        }}
      >
        <Button variant="contained" onClick={saveBadlist} disabled={!ready || waiting}>
          {t('save')}
          {waiting && (
            <CircularProgress
              size={24}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: -12,
                marginLeft: -12
              }}
            />
          )}
        </Button>
      </div>
      <Grid container spacing={2}>
        <Grid xs>
          <Typography variant="h4">{t('title')}</Typography>
        </Grid>
        <Grid xs={12} md="auto" alignSelf="end">
          <FormControl required>
            <FormLabel id="type-radio-buttons-group-label">{t('type.title')}</FormLabel>
            <RadioGroup
              row
              aria-labelledby="type-radio-buttons-group-label"
              name="type-radio-buttons-group"
              value={badlist.type}
              onChange={handleTypeChange}
            >
              <FormControlLabel value="file" control={<Radio />} label={t('file')} />
              <FormControlLabel value="tag" control={<Radio />} label={t('tag')} />
            </RadioGroup>
          </FormControl>
        </Grid>
        {badlist?.type === 'tag' && (
          <Grid xs={12}>
            <Typography variant="h6">{t('information.tag')}</Typography>
            <Grid container spacing={1}>
              <Grid xs={12} md={6}>
                <FormControl fullWidth required>
                  <FormLabel id="tag-type-label">{t('tag.type.title')}</FormLabel>
                  <Autocomplete
                    disablePortal
                    aria-labelledby="tag-type-label"
                    options={possibleTags}
                    fullWidth
                    onChange={(_, value) => setBadlist({ ...badlist, tag: { ...badlist.tag, type: value } })}
                    clearIcon={false}
                    size="small"
                    renderInput={params => <TextField {...params} />}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth required>
                  <FormLabel id="tag-value-label">{t('tag.value.title')}</FormLabel>
                  <TextField
                    aria-labelledby="tag-value-label"
                    value={badlist?.tag?.value}
                    onChange={event => setBadlist({ ...badlist, tag: { ...badlist.tag, value: event.target.value } })}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}
        {badlist?.type === 'file' && (
          <>
            <Grid xs={12}>
              <Typography variant="h6">{t('file.prop')}</Typography>
              <Grid container spacing={1}>
                <Grid xs={12}>
                  <FormLabel>{t('file.name')}</FormLabel>
                  <TextField
                    value={badlist?.file?.name[0]}
                    onChange={event =>
                      setBadlist({ ...badlist, file: { ...badlist.file, name: [event.target.value] } })
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <FormLabel>{t('file.type')}</FormLabel>
                  <Autocomplete
                    options={fileTypes}
                    fullWidth
                    onChange={(_, value) => setBadlist({ ...badlist, file: { ...badlist.file, type: value } })}
                    clearOnBlur
                    disableClearable
                    size="small"
                    freeSolo
                    renderInput={params => <TextField {...params} />}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <FormLabel>{t('file.size')}</FormLabel>
                  <TextField
                    type="number"
                    value={badlist?.file?.size}
                    onChange={event =>
                      setBadlist({ ...badlist, file: { ...badlist.file, size: parseInt(event.target.value) } })
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid xs={12}>
              <Typography variant="h6">{t('file.hashes')}</Typography>
              <Grid container spacing={1}>
                {badlist?.type === 'file' &&
                  HASHES.map((hash, idx) => (
                    <Grid key={idx} xs={12} md={6}>
                      <FormLabel>{hash.toUpperCase()}</FormLabel>
                      <TextField
                        error={!!(badlist?.hashes[hash] && !badlist?.hashes[hash].match(HASH_MAP[hash]))}
                        value={badlist?.hashes[hash]}
                        onChange={event =>
                          setBadlist({ ...badlist, hashes: { ...badlist.hashes, [hash]: event.target.value } })
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          </>
        )}
        {badlist?.type && (
          <Grid xs={12}>
            <Typography variant="h6">{t('details')}</Typography>
            <Grid container spacing={1}>
              <Grid xs={12} md={9}>
                <FormControl fullWidth required>
                  <FormLabel id="reason-label">{t('reason.title')}</FormLabel>
                  <TextField
                    aria-labelledby="reason-label"
                    value={badlist.sources[0].reason}
                    onChange={event =>
                      setBadlist({ ...badlist, sources: [{ ...badlist.sources[0], reason: [event.target.value] }] })
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <Classification
                          type="picker"
                          c12n={badlist.sources[0].classification}
                          setClassification={classification =>
                            setBadlist({
                              ...badlist,
                              sources: [{ ...badlist.sources[0], classification: classification }]
                            })
                          }
                        />
                      ),
                      classes: {
                        adornedEnd: classes.endAdornment
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} md={3}>
                <FormControl fullWidth>
                  <FormLabel id="expiry_ts-label">{t('expiry.title')}</FormLabel>
                  <DatePicker
                    aria-labelledby="expiry_ts-label"
                    date={badlist.expiry_ts}
                    setDate={date => setBadlist({ ...badlist, expiry_ts: date })}
                    type="input"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}
        {badlist?.type && (
          <>
            <Grid xs={12}>
              <Typography variant="h6">{t('attribution')}</Typography>
              <Grid container spacing={1}>
                {ATTRIBUTION_TYPES.map((atype, idx) => (
                  <Grid key={idx} xs={12} md={6}>
                    <FormLabel id="tag-value-label">{t(`attribution.${atype}.title`)}</FormLabel>
                    <Autocomplete
                      size="small"
                      multiple
                      freeSolo
                      options={[]}
                      value={badlist.attribution[atype]}
                      renderInput={params => <TextField {...params} />}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip size="small" variant="outlined" label={option} {...getTagProps({ index })} />
                        ))
                      }
                      onChange={(_, value) =>
                        setBadlist({
                          ...badlist,
                          attribution: {
                            ...badlist.attribution,
                            [atype]: [...new Set(value.map(x => x.toUpperCase()))]
                          }
                        })
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

BadlistNew.defaultProps = {
  badlist_id: null,
  close: () => {}
};

export default BadlistNew;
