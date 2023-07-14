import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SelectAllOutlinedIcon from '@mui/icons-material/SelectAllOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import { Divider, Link as MaterialLink, ListSubheader, Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useSafeResults from 'components/hooks/useSafeResults';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import ExternalLinks from 'components/visual/ExternalLookup/ExternalLinks';
import { safeFieldValueURI } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useSearchTagExternal } from './ExternalLookup/useExternalLookup';
import InputDialog from './InputDialog';

const STYLE = { height: 'auto', minHeight: '20px' };
const SEARCH_ICON = <SearchOutlinedIcon style={{ marginRight: '16px' }} />;
const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const HIGHLIGHT_ICON = <SelectAllOutlinedIcon style={{ marginRight: '16px' }} />;
const SAFELIST_ICON = <PlaylistAddCheckOutlinedIcon style={{ marginRight: '16px' }} />;
const SIGNATURE_ICON = <FingerprintOutlinedIcon style={{ marginRight: '16px' }} />;
const SUBMIT_ICON = <PublishOutlinedIcon style={{ marginRight: '16px' }} />;
const TRAVEL_EXPLORE_ICON = <TravelExploreOutlinedIcon style={{ marginRight: '16px' }} />;
const EXTERNAL_ICON = (
  <HiOutlineExternalLink style={{ marginRight: '16px', fontSize: '22px', verticalAlign: 'middle' }} />
);
const initialMenuState = {
  mouseX: null,
  mouseY: null
};

const useStyles = makeStyles(theme => ({
  listSubHeaderRoot: {
    lineHeight: '32px'
  }
}));

type TagProps = {
  type: string;
  value: string;
  lvl?: string | null;
  score?: number | null;
  short_type?: string | null;
  highlight_key?: string;
  safelisted?: boolean;
  fullWidth?: boolean;
  force?: boolean;
  classification?: string | null;
};

const WrappedTag: React.FC<TagProps> = ({
  type,
  value,
  lvl = null,
  score = null,
  short_type = null,
  highlight_key = null,
  safelisted = false,
  fullWidth = false,
  force = false,
  classification
}) => {
  const { t } = useTranslation();
  const [state, setState] = React.useState(initialMenuState);
  const [safelistDialog, setSafelistDialog] = React.useState(false);
  const [safelistReason, setSafelistReason] = React.useState(null);
  const [waitingDialog, setWaitingDialog] = React.useState(false);
  const navigate = useNavigate();
  const { user: currentUser, configuration: currentUserConfig, scoreToVerdict } = useALContext();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { isHighlighted, triggerHighlight } = useHighlighter();
  const { copy } = useClipboard();
  const { showSafeResults } = useSafeResults();
  const classes = useStyles();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const searchTag = useCallback(
    () => navigate(`/search/result?query=result.sections.tags.${type}:${safeFieldValueURI(value)}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, value]
  );

  const { lookupState, searchTagExternal, toTitleCase } = useSearchTagExternal({
    [type]: {
      results: {},
      errors: {},
      success: null
    }
  });

  let maliciousness = lvl || scoreToVerdict(score);
  if (safelisted) {
    maliciousness = 'safe';
  }

  const color: PossibleColors = {
    suspicious: 'warning' as 'warning',
    malicious: 'error' as 'error',
    safe: 'success' as 'success',
    info: 'default' as 'default',
    highly_suspicious: 'warning' as 'warning'
  }[maliciousness];

  const handleMenuClick = useCallback(event => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }, []);

  const handleClose = useCallback(() => {
    setState(initialMenuState);
  }, []);

  const handleMenuCopy = useCallback(() => {
    copy(value, 'clipID');
    handleClose();
  }, [copy, handleClose, value]);

  const handleMenuSearch = useCallback(() => {
    searchTag();
    handleClose();
  }, [searchTag, handleClose]);

  const handleMenuExternalSearch = useCallback(
    source => {
      searchTagExternal(source, type, value, classification);
      handleClose();
    },
    [searchTagExternal, handleClose, type, value, classification]
  );

  const handleMenuHighlight = useCallback(() => {
    handleClick();
    handleClose();
  }, [handleClick, handleClose]);

  const handleMenuSafelist = useCallback(() => {
    setSafelistDialog(true);
    handleClose();
  }, [setSafelistDialog, handleClose]);

  const addToSafelist = useCallback(() => {
    const data = {
      tag: {
        type,
        value
      },
      sources: [
        {
          name: currentUser.username,
          reason: [safelistReason],
          type: 'user'
        }
      ],
      type: 'tag'
    };

    apiCall({
      url: `/api/v4/safelist/`,
      method: 'PUT',
      body: data,
      onSuccess: _ => {
        setSafelistDialog(false);
        showSuccessMessage(t('safelist.success'));
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safelistReason, t, type, value]);

  return maliciousness === 'safe' && !showSafeResults && !force ? null : (
    <>
      <InputDialog
        open={safelistDialog}
        handleClose={() => setSafelistDialog(false)}
        handleAccept={addToSafelist}
        handleInputChange={event => setSafelistReason(event.target.value)}
        inputValue={safelistReason}
        title={t('safelist.title')}
        cancelText={t('safelist.cancelText')}
        acceptText={t('safelist.acceptText')}
        inputLabel={t('safelist.input')}
        text={t('safelist.text')}
        waiting={waitingDialog}
      />
      <Menu
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null ? { top: state.mouseY, left: state.mouseX } : undefined
        }
      >
        {type.startsWith('file.rule.') && currentUser.roles.includes('signature_view') && (
          <MenuItem
            id="clipID"
            dense
            component={Link}
            to={`/manage/signature/${type.substring(10)}/${value.substring(0, value.indexOf('.'))}/${value.substring(
              value.indexOf('.') + 1
            )}`}
          >
            {SIGNATURE_ICON}
            {t('goto_signature')}
          </MenuItem>
        )}
        <MenuItem id="clipID" dense onClick={handleMenuCopy}>
          {CLIPBOARD_ICON}
          {t('clipboard')}
        </MenuItem>
        {currentUser.roles.includes('submission_view') && (
          <MenuItem dense onClick={handleMenuSearch}>
            {SEARCH_ICON}
            {t('related')}
          </MenuItem>
        )}
        <MenuItem dense onClick={handleMenuHighlight}>
          {HIGHLIGHT_ICON}
          {t('highlight')}
        </MenuItem>
        {currentUser.roles.includes('safelist_manage') && (
          <MenuItem dense onClick={handleMenuSafelist}>
            {SAFELIST_ICON}
            {t('safelist')}
          </MenuItem>
        )}
        {type.endsWith('uri') && (
          <MenuItem
            dense
            component={Link}
            to="/submit"
            state={{
              hash: value,
              tabContext: '1',
              c12n: classification
            }}
          >
            {SUBMIT_ICON}
            {t('submit_uri')}
          </MenuItem>
        )}
        {!!currentUser.roles.includes('external_query') &&
          !!currentUserConfig.ui.external_sources?.length &&
          !!currentUserConfig.ui.external_source_tags?.hasOwnProperty(type) && (
            <>
              <Divider />
              <ListSubheader disableSticky classes={{ root: classes.listSubHeaderRoot }}>
                {t('related_external')}
              </ListSubheader>

              <MenuItem dense onClick={() => handleMenuExternalSearch(null)}>
                {TRAVEL_EXPLORE_ICON} {t('related_external.all')}
              </MenuItem>

              {currentUserConfig.ui.external_source_tags?.[type]?.sort().map((source, i) => (
                <MenuItem dense key={`source_${i}`} onClick={() => handleMenuExternalSearch(source)}>
                  {TRAVEL_EXPLORE_ICON} {toTitleCase(source)}
                </MenuItem>
              ))}
            </>
          )}
        {!!currentUserConfig.ui.external_links?.tag?.hasOwnProperty(type) && (
          <>
            <Divider />
            <ListSubheader disableSticky classes={{ root: classes.listSubHeaderRoot }}>
              {t('external_link')}
            </ListSubheader>

            {currentUserConfig.ui.external_links?.tag?.[type]?.map((link, i) => (
              <MenuItem dense key={`source_${i}`}>
                <MaterialLink
                  onClick={handleClose}
                  target="_blank"
                  underline="none"
                  rel="noopener noreferrer"
                  color="inherit"
                  href={link.url.replace(
                    link.replace_pattern,
                    encodeURIComponent(link.double_encode ? encodeURIComponent(value) : value)
                  )}
                >
                  {EXTERNAL_ICON} {link.name}
                </MaterialLink>
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
      <CustomChip
        wrap
        variant={safelisted ? 'outlined' : 'filled'}
        size="tiny"
        type="rounded"
        color={highlight_key && isHighlighted(highlight_key) ? ('primary' as 'info') : color}
        label={short_type ? `[${short_type.toUpperCase()}] ${value}` : value}
        style={STYLE}
        onClick={highlight_key ? handleClick : null}
        fullWidth={fullWidth}
        onContextMenu={handleMenuClick}
        icon={
          lookupState && lookupState[type] ? (
            <ExternalLinks
              success={lookupState[type].success}
              results={lookupState[type].results}
              errors={lookupState[type].errors}
              iconStyle={{ marginRight: '-3px', marginLeft: '3px', height: '20px', verticalAlign: 'middle' }}
            />
          ) : null
        }
      />
    </>
  );
};

const Tag = React.memo(WrappedTag);
export default Tag;
