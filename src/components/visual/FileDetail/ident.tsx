import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import {
  Autocomplete,
  Collapse,
  Divider,
  Grid,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import CustomChip from 'components/visual/CustomChip';
import ExternalLinks from 'components/visual/ExternalLookup/ExternalLinks';
import { bytesToSize } from 'helpers/utils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchTagExternal } from '../ExternalLookup/useExternalLookup';

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
  labels: {
    display: 'flex',
    alignItems: 'center'
  }
}));

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

const WrappedIdentificationSection: React.FC<IdentificationSectionProps> = ({ fileinfo, isArchive = false }) => {
  const { user: currentUser, configuration: currentUserConfig } = useALContext();
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  /* External search/lookup */
  const [externalSearchAnchorEl, setExternalSearchMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const openExternaLookupMenu = Boolean(externalSearchAnchorEl);
  const lookupType = useRef(null);
  const lookupValue = useRef(null);
  const { lookupState, searchTagExternal } = useSearchTagExternal({
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

  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();
  const [labels, setLabels] = useState<LabelCategories>(null);
  const [isEditingLabels, setIsEditingLabels] = useState<boolean>(false);
  const prevLabels = useRef<LabelCategories>(null);

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

  const handleEditingLabels = useCallback((data: LabelCategories) => {
    setIsEditingLabels(true);
    prevLabels.current = data;
  }, []);

  const handleSaveLabels = useCallback(
    (data: LabelCategories) => {
      if (!fileinfo) return;
      apiCall({
        method: 'POST',
        url: `/api/v4/file/label/${fileinfo.sha256}/`,
        body: { ...data },
        onSuccess: api_data => {
          showSuccessMessage(t('labels.success'));
          setLabels(sortingLabels(api_data.api_response?.response?.label_categories));
          setIsEditingLabels(false);
        },
        onFailure(api_data) {
          showErrorMessage(api_data.api_response);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileinfo?.sha256, showErrorMessage, showSuccessMessage, sortingLabels, t]
  );

  const handleCancelLabels = useCallback(() => {
    setLabels(prevLabels.current);
    setIsEditingLabels(false);
  }, []);

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
          <ExternalLinks
            success={success}
            errors={errors}
            results={results}
            iconStyle={{ marginRight: '-3px', marginLeft: '3px', height: '18px' }}
          />
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
                  children={<TravelExploreOutlinedIcon fontSize="small" />}
                  style={{ height: '18px' }}
                />
              </Tooltip>
            )}
        </>
      );
    },
    [currentUser, currentUserConfig, fileinfo, handleShowExternalSearchMenu, t]
  );

  const handleCloseExternalSearchMenu = useCallback(() => {
    setExternalSearchMenuAnchorEl(null);
  }, [setExternalSearchMenuAnchorEl]);

  /* handle selecting a menu item in the external search menu */
  const handleMenuExternalSearch = useCallback(
    (source: string) => {
      searchTagExternal(source, lookupType.current, lookupValue.current, fileinfo.classification);
      handleCloseExternalSearchMenu();
    },
    [handleCloseExternalSearchMenu, searchTagExternal, fileinfo]
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
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>
                    MD5
                    <ExternalSearchButton digestType="md5"></ExternalSearchButton>
                  </span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash value={fileinfo?.md5} lookup={lookupState.md5} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>
                    SHA1
                    <ExternalSearchButton digestType="sha1"></ExternalSearchButton>
                  </span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash value={fileinfo?.sha1} lookup={lookupState.sha1} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>
                    SHA256
                    <ExternalSearchButton digestType="sha256"></ExternalSearchButton>
                  </span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash value={fileinfo?.sha256} lookup={lookupState.sha256} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5), display: 'flex' }}>
                    SSDEEP
                    <ExternalSearchButton digestType="ssdeep"></ExternalSearchButton>
                  </span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  <FileHash value={fileinfo?.ssdeep} lookup={lookupState.ssdeep} />
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>TLSH</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {fileinfo ? (
                    fileinfo.tlsh || <span style={{ color: theme.palette.text.disabled }}>{t('not_available')}</span>
                  ) : (
                    <Skeleton />
                  )}
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
                  <div className={classes.labels}>
                    <span style={{ fontWeight: 500, marginRight: theme.spacing(0.5) }}>{t('labels')}</span>
                    {!isEditingLabels && (
                      <IconButton
                        children={<CreateOutlinedIcon fontSize="small" />}
                        size="small"
                        onClick={() => handleEditingLabels(labels)}
                      />
                    )}
                    {isEditingLabels && (
                      <IconButton
                        children={<SaveOutlinedIcon fontSize="small" />}
                        size="small"
                        onClick={() => handleSaveLabels(labels)}
                      />
                    )}
                    {isEditingLabels && (
                      <IconButton
                        children={<ClearOutlinedIcon fontSize="small" />}
                        size="small"
                        onClick={() => handleCancelLabels()}
                      />
                    )}
                  </div>
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
          [
            ExternalSearchButton,
            FileHash,
            classes,
            fileinfo,
            handleCancelLabels,
            handleEditingLabels,
            handleSaveLabels,
            isEditingLabels,
            labels,
            lookupState,
            sp2,
            t,
            theme
          ]
        )}
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
