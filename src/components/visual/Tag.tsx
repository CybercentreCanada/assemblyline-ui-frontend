import { Menu, MenuItem } from '@material-ui/core';
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';
import PlaylistAddCheckOutlinedIcon from '@material-ui/icons/PlaylistAddCheckOutlined';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import SelectAllOutlinedIcon from '@material-ui/icons/SelectAllOutlined';
import useClipboard from 'commons/components/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useSafeResults from 'components/hooks/useSafeResults';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import { safeFieldValueURI, scoreToVerdict } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import InputDialog from './InputDialog';

const STYLE = { height: 'auto', minHeight: '20px' };
const SEARCH_ICON = <SearchOutlinedIcon style={{ marginRight: '16px' }} />;
const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const HIGHLIGHT_ICON = <SelectAllOutlinedIcon style={{ marginRight: '16px' }} />;
const SAFELIST_ICON = <PlaylistAddCheckOutlinedIcon style={{ marginRight: '16px' }} />;
const SIGNATURE_ICON = <FingerprintOutlinedIcon style={{ marginRight: '16px' }} />;
const initialMenuState = {
  mouseX: null,
  mouseY: null
};

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
  const history = useHistory();
  const { user: currentUser } = useALContext();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { isHighlighted, triggerHighlight } = useHighlighter();
  const { copy } = useClipboard();
  const { showSafeResults } = useSafeResults();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const searchTag = useCallback(
    () => history.push(`/search/result?query=result.sections.tags.${type}:${safeFieldValueURI(value)}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, value]
  );

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
      }
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
      />
      <Menu
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null ? { top: state.mouseY, left: state.mouseX } : undefined
        }
      >
        {type.startsWith('file.rule.') && (
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
        <MenuItem dense onClick={handleMenuSearch}>
          {SEARCH_ICON}
          {t('related')}
        </MenuItem>
        <MenuItem dense onClick={handleMenuHighlight}>
          {HIGHLIGHT_ICON}
          {t('highlight')}
        </MenuItem>
        <MenuItem dense onClick={handleMenuSafelist}>
          {SAFELIST_ICON}
          {t('safelist')}
        </MenuItem>
      </Menu>
      <CustomChip
        wrap
        variant={safelisted ? 'outlined' : 'default'}
        size="tiny"
        type="rounded"
        color={highlight_key && isHighlighted(highlight_key) ? ('primary' as 'info') : color}
        label={short_type ? `[${short_type.toUpperCase()}] ${value}` : value}
        style={STYLE}
        onClick={highlight_key ? handleClick : null}
        fullWidth={fullWidth}
        onContextMenu={handleMenuClick}
      />
    </>
  );
};

const Tag = React.memo(WrappedTag);
export default Tag;
