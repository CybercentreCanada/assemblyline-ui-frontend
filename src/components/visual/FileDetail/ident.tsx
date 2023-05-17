import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import {
  Collapse,
  Divider,
  Grid,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Skeleton,
  SvgIconTypeMap,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { bytesToSize } from 'helpers/utils';
import React, { forwardRef, useCallback, useMemo, useRef } from 'react';
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
      backgroundColor: 'inherit',
      color: theme.palette.text.secondary
    }
  }
}));

const EXTERNAL_RESULTS_ICON = forwardRef<SvgIconTypeMap | null, any>((props, ref) => {
  const { success, ...remainingProps } = props;
  return (
    <React.Fragment>
      {success === true && (
        <LinkOutlinedIcon ref={ref} style={{ display: 'inline-flex', height: '18px' }} {...remainingProps} />
      )}
      {success === false && (
        <ErrorOutlineOutlinedIcon ref={ref} style={{ display: 'inline-flex', height: '18px' }} {...remainingProps} />
      )}
    </React.Fragment>
  );
});

type IdentificationSectionProps = {
  fileinfo: any;
};

type LookupSourceDetails = {
  link: string;
  count: number;
  classification: string;
};

type ExternalLookupResults = {
  [digestType: string]: {
    results: {
      [sourceName: string]: {
        link: string;
        count: number;
      };
    };
    errors: {
      [sourceName: string]: string;
    };
    success: null | boolean;
  };
};

const WrappedIdentificationSection: React.FC<IdentificationSectionProps> = ({ fileinfo }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { user: currentUser, configuration: currentUserConfig } = useALContext();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showWarningMessage, showErrorMessage } = useMySnackbar();

  /* External search/lookup */
  const [externalSearchAnchorEl, setExternalSearchMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const openExternaLookupMenu = Boolean(externalSearchAnchorEl);
  const lookupType = useRef(null);
  const lookupValue = useRef(null);
  const [lookupState, setLookupState] = React.useState<ExternalLookupResults>({
    md5: {
      results: {},
      errors: {},
      success: null
    },
    sha1: {
      results: {},
      errors: {},
      success: null
    },
    sha256: {
      results: {},
      errors: {},
      success: null
    },
    ssdeep: {
      results: {},
      errors: {},
      success: null
    }
  });

  const searchTagExternal = useCallback(
    (source: string) => {
      let url = `/api/v4/federated_lookup/search/${lookupType.current}/${encodeURIComponent(lookupValue.current)}/`;
      // construct approporiate query param string
      let qs = `classification=${encodeURIComponent(fileinfo.classification)}`;
      if (!!source) {
        qs += `&sources=${encodeURIComponent(source)}`;
      }
      url += `?${qs}`;

      // use source to append rather than overwrite
      apiCall({
        method: 'GET',
        url: url,
        onSuccess: api_data => {
          if (Object.keys(api_data.api_response).length !== 0) {
            showSuccessMessage(t('related_external.found'));
            let digestType = lookupType.current;
            let newState = {
              success: true,
              results: {},
              errors: {}
            };
            for (let sourceName in api_data.api_response) {
              newState.results[sourceName] = api_data.api_response[sourceName];
            }
            for (let sourceName in api_data.api_error_message as Object) {
              newState.errors[sourceName] = api_data.api_error_message[sourceName];
            }
            setLookupState(prevState => {
              return {
                ...prevState,
                [digestType]: {
                  results: {
                    ...prevState[digestType].results,
                    ...newState.results
                  },
                  errors: {
                    ...prevState[digestType].errors,
                    ...newState.errors
                  },
                  success: newState.success
                }
              };
            });
          } else {
            showWarningMessage(t('related_external.notfound'));
          }
        },
        onFailure: api_data => {
          if (Object.keys(api_data.api_error_message).length !== 0) {
            showErrorMessage(t('related_external.error'));
            let digestType = lookupType.current;
            let newState = {
              errors: {},
              // take existing success from previous source search if available
              success: lookupState[digestType].success || false
            };
            for (let sourceName in api_data.api_error_message as Object) {
              newState.errors[sourceName] = api_data.api_error_message[sourceName];
            }
            setLookupState(prevState => {
              return {
                ...prevState,
                [digestType]: {
                  ...prevState[digestType],
                  errors: {
                    ...prevState[digestType].errors,
                    ...newState.errors
                  },
                  success: newState.success
                }
              };
            });
          }
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lookupType.current, fileinfo]
  );

  /* Display fileinfo hash value.
   If an external search was also performed for this hash, also show returned results via a tooltip*/
  const FileHash: React.FC<any> = useCallback(({ value, lookup }) => {
    let success = lookup?.success;
    let errors = lookup?.errors;
    let results = lookup?.results;
    return (
      <span style={{ display: 'flex' }}>
        {value ? value : <Skeleton />}
        {success !== null ? (
          <Tooltip
            title={
              <>
                {Object.keys(results)?.map((sourceName: keyof LookupSourceDetails, i) => (
                  <h3 key={`success_${i}`}>
                    {sourceName}: <a href={results[sourceName].link}>{results[sourceName].count} results</a>
                  </h3>
                ))}
                {!!Object.keys(errors).length && (
                  <>
                    <h3>Errors</h3>
                    {Object.keys(errors).map((sourceName: keyof LookupSourceDetails, i) => (
                      <p key={`error_${i}`}>{errors[sourceName]}</p>
                    ))}
                  </>
                )}
              </>
            }
          >
            <EXTERNAL_RESULTS_ICON success={success} />
          </Tooltip>
        ) : null}
      </span>
    );
  }, []);

  /* handle showing the external search menu */
  const handleShowExternalSearchMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, type: string, value: string) => {
      setExternalSearchMenuAnchorEl(event.currentTarget);
      lookupType.current = type;
      lookupValue.current = value;
    },
    []
  );

  const ExternalSearchButton: React.FC<any> = useCallback(
    ({ digestType }) => {
      return (
        <>
          {!!currentUser.roles.includes('external_query') &&
            !!currentUserConfig.ui.external_sources?.length &&
            currentUserConfig.ui.external_source_tags?.hasOwnProperty(digestType) && (
              <Tooltip title={t('related_external')} placement="top">
                <IconButton
                  size="small"
                  onClick={e => handleShowExternalSearchMenu(e, digestType, fileinfo[digestType])}
                  //classes={{ root: classes.externalLookupButtonRoot }}
                  children={<TravelExploreOutlinedIcon fontSize="small" />}
                />
              </Tooltip>
            )}
        </>
      );
    },
    [currentUser, currentUserConfig, fileinfo, classes.externalLookupButtonRoot, handleShowExternalSearchMenu, t]
  );

  const handleCloseExternalSearchMenu = useCallback(() => {
    setExternalSearchMenuAnchorEl(null);
  }, [setExternalSearchMenuAnchorEl]);

  /* handle selecting a menu item in the external search menu */
  const handleMenuExternalSearch = useCallback(
    (source: string) => {
      searchTagExternal(source);
      handleCloseExternalSearchMenu();
    },
    [searchTagExternal, handleCloseExternalSearchMenu]
  );

  /* build the external search menu */
  const ExternalSearchMenu: React.FC<any> = useCallback(() => {
    return (
      <Menu open={openExternaLookupMenu} onClose={handleCloseExternalSearchMenu} anchorEl={externalSearchAnchorEl}>
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
    );
  }, [
    handleCloseExternalSearchMenu,
    handleMenuExternalSearch,
    t,
    openExternaLookupMenu,
    externalSearchAnchorEl,
    currentUserConfig.ui.external_source_tags
  ]);

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
      <ExternalSearchMenu />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              <Grid container>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5) }}> MD5 </span>
                  <ExternalSearchButton digestType="md5"></ExternalSearchButton>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash value={fileinfo?.md5} lookup={lookupState?.md5} digestType={'md5'} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5) }}>SHA1</span>
                  <ExternalSearchButton digestType="sha1"></ExternalSearchButton>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash value={fileinfo?.sha1} lookup={lookupState?.sha1} digestType={'sha1'} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5) }}>SHA256</span>
                  <ExternalSearchButton digestType="sha256"></ExternalSearchButton>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash value={fileinfo?.sha256} lookup={lookupState?.sha256} digestType={'sha256'} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5) }}>SSDEEP</span>
                  <ExternalSearchButton digestType="ssdeep"></ExternalSearchButton>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash value={fileinfo?.ssdeep} lookup={lookupState?.ssdeep} digestType={'ssdeep'} />
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
          [fileinfo, lookupState, sp2, t, FileHash, ExternalSearchButton]
        )}
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
