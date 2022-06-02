import { Menu, MenuItem } from '@material-ui/core';
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import PlaylistAddCheckOutlinedIcon from '@material-ui/icons/PlaylistAddCheckOutlined';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import SelectAllOutlinedIcon from '@material-ui/icons/SelectAllOutlined';
import useClipboard from 'commons/components/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import { safeFieldValueURI, scoreToVerdict } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import InputDialog from './InputDialog';

const STYLE = { height: 'auto', minHeight: '20px' };
const SEARCH_ICON = <SearchOutlinedIcon style={{ marginRight: '16px' }} />;
const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const SAFELIST_ICON = <PlaylistAddCheckOutlinedIcon style={{ marginRight: '16px' }} />;
const HIGHLIGHT_ICON = <SelectAllOutlinedIcon style={{ marginRight: '16px' }} />;
const initialMenuState = {
  mouseX: null,
  mouseY: null
};

type HeuristicProps = {
  text: string;
  lvl?: string | null;
  score?: number | null;
  signature?: boolean;
  show_type?: boolean;
  highlight_key?: string;
  fullWidth?: boolean;
  safe?: boolean;
};

const WrappedHeuristic: React.FC<HeuristicProps> = ({
  text,
  lvl = null,
  score = null,
  signature = false,
  show_type = false,
  highlight_key = null,
  fullWidth = false,
  safe = false
}) => {
  const { t } = useTranslation();
  const [state, setState] = React.useState(initialMenuState);
  const [safelistDialog, setSafelistDialog] = React.useState(false);
  const [safelistReason, setSafelistReason] = React.useState(null);
  const history = useHistory();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { isHighlighted, triggerHighlight } = useHighlighter();
  const { copy } = useClipboard();
  const { user: currentUser } = useALContext();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const searchHeuristic = useCallback(
    () =>
      history.push(
        `/search/result?query=result.sections.heuristic${signature ? '.signature' : ''}.name:${safeFieldValueURI(text)}`
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature, text]
  );

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
    copy(text, 'clipID');
    handleClose();
  }, [copy, handleClose, text]);

  const handleMenuSearch = useCallback(() => {
    searchHeuristic();
    handleClose();
  }, [searchHeuristic, handleClose]);

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
      signature: {
        name: text
      },
      sources: [
        {
          name: currentUser.username,
          reason: [safelistReason],
          type: 'user'
        }
      ],
      type: 'signature'
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
  }, [safelistReason, t, text]);

  let color: PossibleColors = 'default' as 'default';
  if (safe) {
    color = 'success' as 'success';
  } else if (lvl) {
    color = {
      info: 'default' as 'default',
      safe: 'success' as 'success',
      suspicious: 'warning' as 'warning',
      malicious: 'error' as 'error'
    }[lvl];
  } else if (score) {
    color = {
      suspicious: 'warning' as 'warning',
      malicious: 'error' as 'error',
      safe: 'success' as 'success',
      info: 'default' as 'default',
      highly_suspicious: 'warning' as 'warning'
    }[scoreToVerdict(score)];
  }

  return (
    <>
      {signature && (
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
      )}
      <Menu
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null ? { top: state.mouseY, left: state.mouseX } : undefined
        }
      >
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
        {signature && (
          <MenuItem dense onClick={handleMenuSafelist}>
            {SAFELIST_ICON}
            {t('safelist')}
          </MenuItem>
        )}
      </Menu>
      <CustomChip
        wrap
        variant={safe ? 'outlined' : 'default'}
        size="tiny"
        type="rounded"
        color={highlight_key && isHighlighted(highlight_key) ? ('primary' as 'info') : color}
        label={show_type ? (signature ? `[SIGNATURE] ${text}` : `[HEURISTIC] ${text}`) : text}
        style={STYLE}
        onClick={highlight_key ? handleClick : null}
        fullWidth={fullWidth}
        onContextMenu={handleMenuClick}
      />
    </>
  );
};

const Heuristic = React.memo(WrappedHeuristic);
export default Heuristic;
