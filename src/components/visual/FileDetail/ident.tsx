import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
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
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import ExternalLinks from 'components/visual/ExternalLookup/ExternalLinks';
import { bytesToSize } from 'helpers/utils';
import React, { useCallback, useRef } from 'react';
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
  }
}));

type IdentificationSectionProps = {
  fileinfo: any;
};

const initialLookupState = {
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
};

const WrappedIdentificationSection: React.FC<IdentificationSectionProps> = ({ fileinfo }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { user: currentUser, configuration: currentUserConfig } = useALContext();

  /* External search/lookup */
  const [externalSearchAnchorEl, setExternalSearchMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const openExternaLookupMenu = Boolean(externalSearchAnchorEl);
  const lookupType = useRef(null);
  const lookupValue = useRef(null);
  const { lookupState, searchTagExternal, toTitleCase } = useSearchTagExternal(initialLookupState, fileinfo);

  /* Display fileinfo hash value.
   If an external search was also performed for this hash, also show returned results via a popover*/
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
            iconStyle={{ marginRight: '-3px', marginLeft: '3px', height: '20px', verticalAlign: 'text-bottom' }}
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
                  style={{ height: '16px', width: '16px', marginLeft: '8px' }}
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
        {currentUserConfig.ui.external_source_tags?.[lookupType.current]?.sort().map((source, i) => (
          <MenuItem dense key={`${lookupType.current}_${i}`} onClick={() => handleMenuExternalSearch(source)}>
            {toTitleCase(source)}
          </MenuItem>
        ))}
      </Menu>
    );
  }, [
    handleCloseExternalSearchMenu,
    handleMenuExternalSearch,
    t,
    toTitleCase,
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
          </Grid>
        </div>
      </Collapse>
    </div>
  );
};

const IdentificationSection = React.memo(WrappedIdentificationSection);
export default IdentificationSection;
