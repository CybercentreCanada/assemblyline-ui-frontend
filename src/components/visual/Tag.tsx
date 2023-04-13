import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SelectAllOutlinedIcon from '@mui/icons-material/SelectAllOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import { Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useSafeResults from 'components/hooks/useSafeResults';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import { safeFieldValueURI } from 'helpers/utils';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import InputDialog from './InputDialog';


const STYLE = { height: 'auto', minHeight: '20px' };
const SEARCH_ICON = <SearchOutlinedIcon style={{ marginRight: '16px' }} />;
const TRAVEL_EXPLORE_ICON = <TravelExploreOutlinedIcon style={{ marginRight: '16px' }} />;
const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const HIGHLIGHT_ICON = <SelectAllOutlinedIcon style={{ marginRight: '16px' }} />;
const SAFELIST_ICON = <PlaylistAddCheckOutlinedIcon style={{ marginRight: '16px' }} />;
const SIGNATURE_ICON = <FingerprintOutlinedIcon style={{ marginRight: '16px' }} />;
const LINK_ICON = <LinkOutlinedIcon style={{ marginRight: '2px' }} />;
const initialMenuState = {
  mouseX: null,
  mouseY: null
};

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
  },
});

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
};

type LookupSourceDetails = {
  link: string;
  count: number;
  classification: string;
};

// TODO: add classification to prevent sending tags to external sources
const WrappedTag: React.FC<TagProps> = ({
  type,
  value,
  lvl = null,
  score = null,
  short_type = null,
  highlight_key = null,
  safelisted = false,
  fullWidth = false,
  force = false
}) => {
  const { t } = useTranslation();
  const [state, setState] = React.useState(initialMenuState);
  const [safelistDialog, setSafelistDialog] = React.useState(false);
  const [safelistReason, setSafelistReason] = React.useState(null);
  const [waitingDialog, setWaitingDialog] = React.useState(false);
  const navigate = useNavigate();
  const { user: currentUser, configuration: currentUserConfig, scoreToVerdict } = useALContext();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showWarningMessage } = useMySnackbar();
  const { isHighlighted, triggerHighlight } = useHighlighter();
  const { copy } = useClipboard();
  const { showSafeResults } = useSafeResults();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const searchTag = useCallback(
    () => navigate(`/search/result?query=result.sections.tags.${type}:${safeFieldValueURI(value)}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, value]
  );

  const externalResults = useRef(null);
  const linkIcon = useRef(null);
  const searchTagExternal = useCallback(() => {
    apiCall({
      method: 'GET',
      url: `/api/v4/federated_lookup/search/${type}/${value}/`,
      onSuccess: api_data => {
        if (Object.keys(api_data.api_response).length !== 0) {
          showSuccessMessage(t('related_external.found'));
          linkIcon.current = LINK_ICON;
          /*let test = {
            'malware_bazaar': {
              'link': 'https://link.com',
              'classification': 'UNRESTRICTED',
              'count': 2
            },
            'virustotal': {
              'link': 'https://linktovt.com',
              'classification': 'UNRESTRICTED',
              'count': 1
            }
          };
          externalResults.current = Object.keys(test).map((sourceName: keyof LookupSourceDetails) => (
              <h3>{sourceName}: <a href={test[sourceName].link}>{test[sourceName].count} results</a></h3>

          */
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
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSuccessMessage, type, value]);

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

  const handleMenuExternalSearch = useCallback(() => {
    searchTagExternal();
    handleClose();
  }, [searchTagExternal, handleClose]);

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
        {currentUser.roles.includes('submission_view') && currentUserConfig.ui.external_sources?.length && (
          /* TODO: convert this into a nested menu with each source available for the user */
          // TODO: enable valid tags to be sent in config so we can only show context menu on supported tags for user
          <MenuItem dense onClick={handleMenuExternalSearch}>
            {TRAVEL_EXPLORE_ICON}
            {t('related_external') + t('related_external.all')}
          </MenuItem>
        )}
        {currentUser.roles.includes('submission_view') && (
          currentUserConfig.ui.external_sources?.map(source =>
            <MenuItem dense onClick={handleMenuExternalSearch}>
              {TRAVEL_EXPLORE_ICON}
              {t('related_external') + source}
            </MenuItem>
          )
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
      </Menu>
      <NoMaxWidthTooltip title={externalResults.current}>
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
          icon={linkIcon.current}
        />
      </NoMaxWidthTooltip>
    </>
  );
};

const Tag = React.memo(WrappedTag);
export default Tag;
