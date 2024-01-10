import {
  Button,
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

export type SafelistAddUpdate = {
  expiry_ts: string;
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
  signature?: {
    name: string;
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

const DEFAULT_SAFELIST = {
  expiry_ts: null,
  sources: [{ type: 'user', name: '', reason: [''], classification: null }],
  type: null
};

const DEFAULT_SAFELIST_SIGNATURE = {
  signature: {
    name: ''
  }
};

const DEFAULT_SAFELIST_TAG = {
  tag: {
    type: '',
    value: ''
  }
};

const DEFAULT_SAFELIST_FILE = {
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

const SafelistNew = () => {
  const { t } = useTranslation(['manageSafelistAdd']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [safelist, setSafelist] = useState<SafelistAddUpdate>(DEFAULT_SAFELIST);
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
    setSafelist({
      ...safelist,
      sources: [{ ...safelist.sources[0], name: currentUser.username, classification: c12nDef.UNRESTRICTED }]
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
    if (!safelist?.type) {
      setReady(false);
      return;
    }

    // Once the user selected the type we will lock the react router
    if (safelist?.type) {
      setModified(true);
    }

    // If there are no reason
    if (safelist?.sources[0].reason[0] === '') {
      setReady(false);
      return;
    }

    //Tag specific checks
    if (safelist?.type === 'tag') {
      // Type not in the list of valid tags
      if (!possibleTags.includes(safelist?.tag.type)) {
        setReady(false);
        return;
      }
      //There are no tag value
      if (!safelist?.tag.value) {
        setReady(false);
        return;
      }
    }
    //Signature specific checks
    if (safelist?.type === 'signature') {
      //There are no signature name
      if (!safelist?.signature.name) {
        setReady(false);
        return;
      }
    }
    //File specific checks
    else if (safelist?.type === 'file') {
      // There is not at least one hash
      if (!safelist?.hashes?.md5 && !safelist?.hashes?.sha1 && !safelist?.hashes?.sha256) {
        setReady(false);
        return;
      }

      // Invalid MD5 hash
      if (safelist?.hashes?.md5 && !safelist.hashes.md5.match(MD5_REGEX)) {
        setReady(false);
        return;
      }

      // Invalid SHA1 hash
      if (safelist?.hashes?.sha1 && !safelist.hashes.sha1.match(SHA1_REGEX)) {
        setReady(false);
        return;
      }

      // Invalid SHA256 hash
      if (safelist?.hashes?.sha256 && !safelist.hashes.sha256.match(SHA256_REGEX)) {
        setReady(false);
        return;
      }

      // Invalid SSDEEP hash
      if (safelist?.hashes?.ssdeep && !safelist.hashes.ssdeep.match(SSDEEP_REGEX)) {
        setReady(false);
        return;
      }

      // Invalid TLSH hash
      if (safelist?.hashes?.tlsh && !safelist.hashes.tlsh.match(TLSH_REGEX)) {
        setReady(false);
        return;
      }
    }

    setReady(true);
  }, [safelist, possibleTags]);

  const cleanSafelist = () => {
    const data = { ...safelist };
    if (data.type === 'tag') {
      delete data.file;
      delete data.hashes;
      delete data.signature;
    } else if (data.type === 'signature') {
      delete data.file;
      delete data.hashes;
      delete data.tag;
    } else if (data.type === 'file') {
      delete data.signature;
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

  const saveSafelist = () => {
    apiCall({
      url: `/api/v4/safelist/`,
      method: 'POST',
      body: cleanSafelist(),
      onSuccess: resp => {
        setModified(false);
        showSuccessMessage(t('add.success'));
        setTimeout(() => {
          navigate(`/manage/safelist#${resp.api_response.hash}`);
          window.dispatchEvent(new CustomEvent('reloadSafelist'));
        }, 1000);
      },
      onEnter: () => setWaiting(true),
      onExit: () => setWaiting(false)
    });
  };

  const handleTypeChange = event => {
    const extras =
      event.target.value === 'tag'
        ? DEFAULT_SAFELIST_TAG
        : event.target.value === 'signature'
        ? DEFAULT_SAFELIST_SIGNATURE
        : DEFAULT_SAFELIST_FILE;
    setSafelist({ ...safelist, ...extras, type: event.target.value });
  };

  return currentUser.roles.includes('safelist_view') ? (
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
        <Button variant="contained" onClick={saveSafelist} disabled={!ready || waiting}>
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
              value={safelist.type}
              onChange={handleTypeChange}
            >
              <FormControlLabel value="file" control={<Radio />} label={t('file')} />
              <FormControlLabel value="tag" control={<Radio />} label={t('tag')} />
              <FormControlLabel value="signature" control={<Radio />} label={t('signature')} />
            </RadioGroup>
          </FormControl>
        </Grid>
        {safelist?.type === 'tag' && (
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
                    onChange={(_, value) => setSafelist({ ...safelist, tag: { ...safelist.tag, type: value } })}
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
                    value={safelist?.tag?.value}
                    onChange={event =>
                      setSafelist({ ...safelist, tag: { ...safelist.tag, value: event.target.value } })
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}
        {safelist?.type === 'signature' && (
          <Grid xs={12}>
            <Typography variant="h6">{t('information.signature')}</Typography>
            <Grid container spacing={1}>
              <Grid xs={12}>
                <FormControl fullWidth required>
                  <FormLabel id="signature-label">{t('signature.name.title')}</FormLabel>
                  <TextField
                    aria-labelledby="signature-name-label"
                    value={safelist?.signature?.name}
                    onChange={event => setSafelist({ ...safelist, signature: { name: event.target.value } })}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}
        {safelist?.type === 'file' && (
          <>
            <Grid xs={12}>
              <Typography variant="h6">{t('file.prop')}</Typography>
              <Grid container spacing={1}>
                <Grid xs={12}>
                  <FormLabel>{t('file.name')}</FormLabel>
                  <TextField
                    value={safelist?.file?.name[0]}
                    onChange={event =>
                      setSafelist({ ...safelist, file: { ...safelist.file, name: [event.target.value] } })
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
                    onChange={(_, value) => setSafelist({ ...safelist, file: { ...safelist.file, type: value } })}
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
                    value={safelist?.file?.size}
                    onChange={event =>
                      setSafelist({ ...safelist, file: { ...safelist.file, size: parseInt(event.target.value) } })
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
                {safelist?.type === 'file' &&
                  HASHES.map((hash, idx) => (
                    <Grid key={idx} xs={12} md={6}>
                      <FormLabel>{hash.toUpperCase()}</FormLabel>
                      <TextField
                        error={!!(safelist?.hashes[hash] && !safelist?.hashes[hash].match(HASH_MAP[hash]))}
                        value={safelist?.hashes[hash]}
                        onChange={event =>
                          setSafelist({ ...safelist, hashes: { ...safelist.hashes, [hash]: event.target.value } })
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
        {safelist?.type && (
          <Grid xs={12}>
            <Typography variant="h6">{t('details')}</Typography>
            <Grid container spacing={1}>
              <Grid xs={12} md={9}>
                <FormControl fullWidth required>
                  <FormLabel id="reason-label">{t('reason.title')}</FormLabel>
                  <TextField
                    aria-labelledby="reason-label"
                    value={safelist.sources[0].reason}
                    onChange={event =>
                      setSafelist({ ...safelist, sources: [{ ...safelist.sources[0], reason: [event.target.value] }] })
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <Classification
                          type="picker"
                          c12n={safelist.sources[0].classification}
                          setClassification={classification =>
                            setSafelist({
                              ...safelist,
                              sources: [{ ...safelist.sources[0], classification: classification }]
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
                    date={safelist.expiry_ts}
                    setDate={date => setSafelist({ ...safelist, expiry_ts: date })}
                    type="input"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

SafelistNew.defaultProps = {
  safelist_id: null,
  close: () => {}
};

export default SafelistNew;
