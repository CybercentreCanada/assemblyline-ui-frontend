import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Collapse, Divider, Grid, IconButton, Menu, MenuItem, Skeleton, Typography, useTheme, Tooltip, ListSubheader } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { bytesToSize } from 'helpers/utils';
import React, { useCallback, useMemo, useRef } from 'react';
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

  const lookupType = useRef(null);
  const lookupValue = useRef(null);
  const lookupClassification = useRef(null);

  const [md5LinkIcon, setMd5LinkIcon] = React.useState(null);
  const [md5ExternalResults, setMd5ExternalResults] = React.useState(null);
  const [sha1LinkIcon, setSha1LinkIcon] = React.useState(null);
  const [sha1ExternalResults, setSha1ExternalResults] = React.useState(null);
  const [sha256LinkIcon, setSha256LinkIcon] = React.useState(null);
  const [sha256ExternalResults, setSha256ExternalResults] = React.useState(null);
  const [ssdeepLinkIcon, setSsdeepLinkIcon] = React.useState(null);
  const [ssdeepExternalResults, setSsdeepExternalResults] = React.useState(null);

  const searchTagExternal = useCallback(source => {
    let setIcon = setMd5LinkIcon;
    let setResults = setMd5ExternalResults;
    switch (lookupType.current) {
      case 'sha1':
        setIcon = setSha1LinkIcon;
        setResults = setSha1ExternalResults;
        break;
      case 'sha256':
        setIcon = setSha256LinkIcon;
        setResults = setSha256ExternalResults;
        break;
      case 'ssdeep':
        setIcon = setSsdeepLinkIcon;
        setResults = setSsdeepExternalResults;
        break;
    }
    let url = `/api/v4/federated_lookup/search/${lookupType.current}/${encodeURIComponent(lookupValue.current)}/`;
    // construct approporiate query param string
    let qs = '';
    if (!!lookupClassification.current) {
      qs += `classification=${encodeURIComponent(lookupClassification.current)}`;
    }
    if (!!source) {
      if (!!qs) {
        qs += '&';
      }
      qs += `sources=${encodeURIComponent(source)}`;
    }
    if (!!qs) {
      url += `?${qs}`;
    }

    apiCall({
      method: 'GET',
      url: url,
      onSuccess: api_data => {
        if (Object.keys(api_data.api_response).length !== 0) {
          showSuccessMessage(t('related_external.found'));
          setIcon(LINK_ICON);
          setResults((
            <div>
              {Object.keys(api_data.api_response).map((sourceName: keyof LookupSourceDetails, i) => (
                <p key={`success_${i}`}>
                  <h3>
                    {sourceName}:
                    <a href={api_data.api_response[sourceName].link}>{api_data.api_response[sourceName].count} results</a>
                  </h3>
                </p>
              ))}
              {!!api_data.api_error_message.length && (
                <h3>Errors</h3>
              )}
              {api_data.api_error_message?.split(new RegExp('\\r?\\n')).map((err, i) => (
                <p key={`error_${i}`}>
                  {err}
                </p>
              ))}
            </div>
          ));
        }
        else {
          showWarningMessage(t('related_external.notfound'));
          setIcon(null);
          setResults(null);
        }
      },
      onFailure: api_data => {
        if (Object.keys(api_data.api_error_message).length !== 0) {
          showErrorMessage(t('related_external.error'));
          setIcon(ERROR_ICON);
          setResults((
            <div>
              <h3>Errors</h3>
              {api_data.api_error_message.split(new RegExp('\\r?\\n')).map((err, i) => (
                <p key={`error_${i}`}>
                  {err}
                </p>
              ))}
            </div>
          ));
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupType, lookupClassification]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuExternalSearch = useCallback(source => {
    searchTagExternal(source);
    handleClose();
  }, [searchTagExternal]);

  const handleShowExternalSearch = useCallback((event: React.MouseEvent<HTMLButtonElement>, type: string, value: string, classification: string) => {
    setAnchorEl(event.currentTarget);
    lookupType.current = type;
    lookupValue.current = value;
    lookupClassification.current = classification;
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
      <Menu
        open={openExternaLookup}
        onClose={handleClose}
        anchorEl={anchorEl}
      >
        <ListSubheader disableSticky>
          {t('related_external')}
        </ListSubheader>
        <MenuItem dense onClick={() => handleMenuExternalSearch(null)}>
          {t('related_external.all')}
        </MenuItem>
        {currentUserConfig.ui.external_source_tags?.[lookupType.current]?.map((source, i) =>
          <MenuItem dense key={i} onClick={() => handleMenuExternalSearch(source)}>
            {source}
          </MenuItem>
        )}
      </Menu>
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              <Grid container>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>MD5</span>

                  {!!currentUser.roles.includes('external_query') && !!currentUserConfig.ui.external_sources?.length &&
                    currentUserConfig.ui.external_source_tags?.hasOwnProperty('md5') && (
                      <Tooltip title={t('related_external')} placement="top">
                        <IconButton size="small" onClick={e => handleShowExternalSearch(e, 'md5', fileinfo.md5, fileinfo.classification)} classes={{ root: classes.externalLookupButtonRoot }}>
                          {TRAVEL_EXPLORE_ICON}
                        </IconButton>
                      </Tooltip>
                    )}
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {!!md5ExternalResults && (
                    <Tooltip title={md5ExternalResults}>
                      {md5LinkIcon}
                    </Tooltip>
                  )}
                  {fileinfo ? fileinfo.md5 : <Skeleton />}
                  {md5ExternalResults}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA1</span>
                  {!!currentUser.roles.includes('external_query') && !!currentUserConfig.ui.external_sources?.length &&
                    currentUserConfig.ui.external_source_tags?.hasOwnProperty('sha1') && (
                      <Tooltip title={t('related_external')} placement="top">
                        <IconButton size="small" onClick={e => handleShowExternalSearch(e, 'sha1', fileinfo.sha1, fileinfo.classification)} classes={{ root: classes.externalLookupButtonRoot }}>
                          {TRAVEL_EXPLORE_ICON}
                        </IconButton>
                      </Tooltip>
                    )}
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.sha1 : <Skeleton />}
                  {sha1ExternalResults}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA256</span>
                  {!!currentUser.roles.includes('external_query') && !!currentUserConfig.ui.external_sources?.length &&
                    currentUserConfig.ui.external_source_tags?.hasOwnProperty('sha256') && (
                      <Tooltip title={t('related_external')} placement="top">
                        <IconButton size="small" onClick={e => handleShowExternalSearch(e, 'sha256', fileinfo.sha256, fileinfo.classification)} classes={{ root: classes.externalLookupButtonRoot }}>
                          {TRAVEL_EXPLORE_ICON}
                        </IconButton>
                      </Tooltip>
                    )}
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.sha256 : <Skeleton />}
                  {sha256ExternalResults}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SSDEEP</span>
                  {!!currentUser.roles.includes('external_query') && !!currentUserConfig.ui.external_sources?.length &&
                    currentUserConfig.ui.external_source_tags?.hasOwnProperty('ssdeep') && (
                      <Tooltip title={t('related_external')} placement="top">
                        <IconButton size="small" onClick={e => handleShowExternalSearch(e, 'ssdeep', fileinfo.ssdeep, fileinfo.classification)} classes={{ root: classes.externalLookupButtonRoot }}>
                          {TRAVEL_EXPLORE_ICON}
                        </IconButton>
                      </Tooltip>
                    )}
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.ssdeep : <Skeleton />}
                  {ssdeepExternalResults}
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
