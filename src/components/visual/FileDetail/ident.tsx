import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import { Collapse, Divider, Grid, IconButton, ListSubheader, Menu, MenuItem, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { bytesToSize } from 'helpers/utils';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  externalLookupButtonRoot: {
    marginLeft: '0px',
    height: '0px',
    '&:hover': {
      backgroundColor: "inherit",
      color: theme.palette.text.secondary
    }
  }
}));

const LINK_ICON = <LinkOutlinedIcon style={{
  display: 'inline-flex',
  height: '18px'
}} />;
const TRAVEL_EXPLORE_ICON = <TravelExploreOutlinedIcon style={{
  display: 'inline-flex',
  height: '18px'
}} />;
const ERROR_ICON = <ErrorOutlineOutlinedIcon style={{
  display: 'inline-flex',
  height: '18px'
}} />;

type IdentificationSectionProps = {
  fileinfo: any;
};

type LookupSourceDetails = {
  link: string;
  count: number;
  classification: string;
};

type DigestExternalLookup = {
  results: null | {
    [sourceName: string]: {
      link: string;
      count: number;
    }
  };
  errors: null | string;
  success: null | boolean;
};


const WrappedIdentificationSection: React.FC<IdentificationSectionProps> = ({ fileinfo }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { user: currentUser, configuration: currentUserConfig } = useALContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openExternaLookup = Boolean(anchorEl);
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showWarningMessage, showErrorMessage } = useMySnackbar();

  //const externalSourcesConfig = React.useMemo(() => {
  //  return currentUserConfig.ui.external_sources;
  //}, [currentUserConfig]);

  const lookupType = useRef(null);
  const lookupValue = useRef(null);

  const [md5LookupState, setMd5LookupState] = React.useState<DigestExternalLookup>(null);
  const [sha1LookupState, setSha1LookupState] = React.useState<DigestExternalLookup>(null);
  const [sha256LookupState, setSha256LookupState] = React.useState<DigestExternalLookup>(null);
  const [ssdeepLookupState, setSsdeepLookupState] = React.useState<DigestExternalLookup>(null);

  const searchTagExternal = useCallback(
    source => {
      let setLookupState = setMd5LookupState;
      switch (lookupType.current) {
        case 'sha1':
          setLookupState = setSha1LookupState;
          break;
        case 'sha256':
          setLookupState = setSha256LookupState;
          break;
        case 'ssdeep':
          setLookupState = setSsdeepLookupState;
          break;
      }
      let url = `/api/v4/federated_lookup/search/${lookupType.current}/${encodeURIComponent(lookupValue.current)}/`;
      // construct approporiate query param string
      let qs = `classification=${encodeURIComponent(fileinfo.classification)}`;
      if (!!source) {
        qs += `&sources=${encodeURIComponent(source)}`;
      }
      url += `?${qs}`;

      apiCall({
        method: 'GET',
        url: url,
        onSuccess: api_data => {
          if (Object.keys(api_data.api_response).length !== 0) {
            showSuccessMessage(t('related_external.found'));
            setLookupState({
              success: true,
              results: api_data.api_response,
              errors: api_data.api_error_message,
            });
          } else {
            showWarningMessage(t('related_external.notfound'));
            setLookupState({
              success: null,
              results: null,
              errors: null,
            });
          }
        },
        onFailure: api_data => {
          if (Object.keys(api_data.api_error_message).length !== 0) {
            showErrorMessage(t('related_external.error'));
            setLookupState({
              success: false,
              results: null,
              errors: api_data.api_error_message,
            });
          }
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lookupType, fileinfo]
  );

  const ExternalLookupResult: React.FC<any> = useCallback(({ results, errors, digestType }) => {
    return (
      <>
        {!!results?.length && Object.keys(results).map((sourceName: keyof LookupSourceDetails, i) => (
          <p key={`success_${digestType}_${i}`}>
            <h3>
              {sourceName}:
              <a href={results[sourceName].link}>
                {results[sourceName].count} results
              </a>
            </h3>
          </p>
        ))}
        {!!errors?.length && <h3>Errors</h3>}
        {errors?.split(new RegExp('\\r?\\n')).map((err, i) => (
          <p key={`error_${digestType}_${i}`}>{err}</p>
        ))}
      </>
    );
  }, []);

  const FileHash: React.FC<any> = useCallback(({ digestType, results, errors, status }) => {
    return (
      <>
        {fileinfo ? fileinfo[digestType] : <Skeleton />}
        {(!!results || !!errors) && (
          <Tooltip title={<ExternalLookupResult results={results} errors={errors} digestType={digestType} />}>
            <>
              {status === true && LINK_ICON}
              {status === false && ERROR_ICON}
            </>
          </Tooltip>
        )}
      </>
    );
  }, [fileinfo]);

  const ExternalSearchButton: React.FC<any> = useCallback(({digestType}) => {
    return (
      <>
        {!!currentUser.roles.includes('external_query') && !!currentUserConfig.ui.external_sources?.length &&
          currentUserConfig.ui.external_source_tags?.hasOwnProperty(digestType) && (
            <Tooltip title={t('related_external')} placement="top">
              <IconButton size="small" onClick={e => handleShowExternalSearch(e, digestType, fileinfo[digestType])} classes={{ root: classes.externalLookupButtonRoot }}>
                {TRAVEL_EXPLORE_ICON}
              </IconButton>
            </Tooltip>
        )}
      </>
    );
  }, [currentUser, currentUserConfig, fileinfo]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuExternalSearch = useCallback(
    source => {
      searchTagExternal(source);
      handleClose();
    },
    [searchTagExternal]
  );

  const handleShowExternalSearch = useCallback((event: React.MouseEvent<HTMLButtonElement>, type: string, value: string) => {
      setAnchorEl(event.currentTarget);
      lookupType.current = type;
      lookupValue.current = value;
  }, []);

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('identification')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Menu open={openExternaLookup} onClose={handleClose} anchorEl={anchorEl}>
        <ListSubheader disableSticky>{t('related_external')}</ListSubheader>
        <MenuItem dense onClick={() => handleMenuExternalSearch(null)}>
          {t('related_external.all')}
        </MenuItem>
        {currentUserConfig.ui.external_source_tags?.[lookupType.current]?.map((source, i) => (
          <MenuItem dense key={`${lookupType.current}_${i}`} onClick={() => handleMenuExternalSearch(source)}>
            {source}
          </MenuItem>
        ))}
      </Menu>
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              <Grid container>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}> MD5 </span>
                  <ExternalSearchButton digestType="md5"></ExternalSearchButton>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash digestType="md5" results={md5LookupState?.results} errors={md5LookupState?.errors} status={md5LookupState?.success} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA1</span>
                  <ExternalSearchButton digestType="sha1"></ExternalSearchButton>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash digestType="sha1" results={sha1LookupState?.results} errors={sha1LookupState?.errors} status={sha1LookupState?.success} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA256</span>
                  <ExternalSearchButton digestType="sha256"></ExternalSearchButton>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash digestType="sha256" results={sha256LookupState?.results} errors={sha256LookupState?.errors} status={sha256LookupState?.success} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SSDEEP</span>
                  <ExternalSearchButton digestType="ssdeep"></ExternalSearchButton>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.ssdeep : <Skeleton />}
                  <FileHash digestType="ssdeep" results={ssdeepLookupState?.results} errors={ssdeepLookupState?.errors} status={ssdeepLookupState?.success} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('size')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? (
                    <span>
                      {fileinfo.size}
                      <span style={{ fontWeight: 300 }}> ({bytesToSize(fileinfo.size)})</span>
                    </span>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('type')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.type : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('mime')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.mime : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('magic')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.magic : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('entropy')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? fileinfo.entropy : <Skeleton />}
                </Grid>
              </Grid>
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [fileinfo]
        )}
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
