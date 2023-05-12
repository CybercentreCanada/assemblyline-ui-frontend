import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import {
  Autocomplete,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Menu, 
  MenuItem, 
  Skeleton,
  TextField,
  Typography,
  useTheme, 
  Tooltip, 
  ListSubheader
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import CustomChip from 'components/visual/CustomChip';
import { bytesToSize } from 'helpers/utils';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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

const LINK_ICON = <LinkOutlinedIcon style={{ marginRight: '2px' }} />;
const TRAVEL_EXPLORE_ICON = <TravelExploreOutlinedIcon style={{
  display: 'inline-flex',
  height: '18px'
}} />;

type IdentificationSectionProps = {
  fileinfo: any;
  isArchive?: boolean;
};

const LABELS_COLOR_MAP = {
  info: 'default',
  technique: 'secondary',
  attribution: 'primary'
};

type LabelCategories = {
  info?: string[];
  technique?: string[];
  attribution?: string[];
};
        
type LookupSourceDetails = {
  link: string;
  count: number;
  classification: string;
};
        
const WrappedIdentificationSection: React.FC<IdentificationSectionProps> = ({ fileinfo, isArchive = false }) => {
  const { user: currentUser, configuration: currentUserConfig } = useALContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openExternaLookup = Boolean(anchorEl);
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showWarningMessage, showErrorMessage } = useMySnackbar();
  
  const externalResults = useRef(null);
  const linkIcon = useRef(null);
  const lookupType = useRef(null);
  const lookupValue = useRef(null);
  const lookupClassification = useRef(null);

  const [labels, setLabels] = useState<LabelCategories>(null);
  const [isEditingLabels, setIsEditingLabels] = useState<boolean>(false);

  const sortingLabels = useCallback(
    (data: LabelCategories): LabelCategories =>
      Object.fromEntries(
        Object.entries(data).map(([category, l]: [string, string[]]) => [
          category,
          l.sort((a, b) => a.localeCompare(b))
        ])
      ),
    []
  );

  useEffect(() => {
    if (!fileinfo || !('label_categories' in fileinfo)) return;
    setLabels(sortingLabels(fileinfo.label_categories));
  }, [fileinfo, sortingLabels]);

  const handleSaveLabels = useCallback(
    data => {
      if (!fileinfo) return;
      apiCall({
        method: 'POST',
        url: `/api/v4/file/label/${fileinfo.sha256}/`,
        body: { ...data },
        onSuccess: api_data => {
          showSuccessMessage(t('labels.success'));
          setLabels(sortingLabels(api_data.api_response?.response?.label_categories));
          setIsEditingLabels(v => !v);
        },
        onFailure(api_data) {
          showErrorMessage(api_data.api_response);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileinfo?.sha256, showErrorMessage, showSuccessMessage, sortingLabels, t]
  );

  const searchTagExternal = useCallback(source => {
    let url = `/api/v4/federated_lookup/search/${lookupType.current}/${encodeURIComponent(lookupValue.current)}/`;

    // construct approporiate query param string
    let qs = '';
    if (lookupClassification.current != null) {
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
          linkIcon.current = LINK_ICON;
          externalResults.current = Object.keys(api_data.api_response).map((sourceName: keyof LookupSourceDetails) => (
            <p>
              <h3>
                {sourceName}:
                <a href={api_data.api_response[sourceName].link}>{api_data.api_response[sourceName].count} results</a>
              </h3>
            </p>
          ));
        }
        else {
          showWarningMessage(t('related_external.notfound'));
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

                  {currentUser.roles.includes('submission_view') && currentUserConfig.ui.external_sources?.length &&
                    currentUserConfig.ui.external_source_tags?.hasOwnProperty('md5') && (
                      <Tooltip title={t('related_external')} placement="top">
                        <IconButton size="small" onClick={e => handleShowExternalSearch(e, 'md5', fileinfo.md5, fileinfo.classification)} classes={{ root: classes.externalLookupButtonRoot }}>
                          {TRAVEL_EXPLORE_ICON}
                        </IconButton>
                      </Tooltip>
                    )}
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? fileinfo.md5 : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA1</span>
                  {currentUser.roles.includes('submission_view') && currentUserConfig.ui.external_sources?.length &&
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
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SHA256</span>
                  {currentUser.roles.includes('submission_view') && currentUserConfig.ui.external_sources?.length &&
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
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>SSDEEP</span>
                  {currentUser.roles.includes('submission_view') && currentUserConfig.ui.external_sources?.length &&
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
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5) }}>{t('labels')}</span>
                  {!isEditingLabels && (
                    <IconButton
                      children={<CreateOutlinedIcon fontSize="small" />}
                      size="small"
                      onClick={() => setIsEditingLabels(v => !v)}
                    />
                  )}
                  {isEditingLabels && (
                    <IconButton
                      children={<SaveOutlinedIcon fontSize="small" />}
                      size="small"
                      onClick={() => handleSaveLabels(labels)}
                    />
                  )}
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? (
                    <>
                      <Collapse in={!isEditingLabels} timeout="auto">
                        <div style={{ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
                          {labels &&
                            ['attribution', 'technique', 'info'].map(
                              category =>
                                category in labels &&
                                labels[category].map((label, i) => (
                                  <CustomChip
                                    key={i}
                                    wrap
                                    variant="outlined"
                                    size="tiny"
                                    type="rounded"
                                    color={category in LABELS_COLOR_MAP ? LABELS_COLOR_MAP[category] : 'primary'}
                                    label={label}
                                    style={{ height: 'auto', minHeight: '20px' }}
                                  />
                                ))
                            )}
                        </div>
                      </Collapse>
                      <Collapse in={isEditingLabels} timeout="auto">
                        <div style={{ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
                          {labels &&
                            ['attribution', 'technique', 'info'].map(category => (
                              <Autocomplete
                                key={category}
                                options={[]}
                                multiple
                                fullWidth
                                freeSolo
                                value={labels[category]}
                                onChange={(e, newValue) => setLabels(l => ({ ...l, [category]: newValue }))}
                                renderInput={p => <TextField {...p} variant="standard" />}
                                renderTags={(value: readonly string[], getTagProps) =>
                                  value.map((option: string, index: number) => (
                                    <CustomChip
                                      key={`${category}-${index}`}
                                      component="div"
                                      wrap
                                      variant="outlined"
                                      size="small"
                                      type="rounded"
                                      color={category in LABELS_COLOR_MAP ? LABELS_COLOR_MAP[category] : 'primary'}
                                      label={option}
                                      style={{ height: 'auto', minHeight: '20px' }}
                                      {...getTagProps({ index })}
                                    />
                                  ))
                                }
                              />
                            ))}
                        </div>
                      </Collapse>
                    </>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>
              </Grid>
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [fileinfo, isEditingLabels, labels, sp2, t, theme]
        )}
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
