import { Menu, MenuItem } from '@material-ui/core';
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import SelectAllOutlinedIcon from '@material-ui/icons/SelectAllOutlined';
import useClipboard from 'commons/components/hooks/useClipboard';
import useHighlighter from 'components/hooks/useHighlighter';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import { scoreToVerdict } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

const STYLE = { height: 'auto', minHeight: '20px' };
const SEARCH_ICON = <SearchOutlinedIcon style={{ marginRight: '16px' }} />;
const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
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
};

const Heuristic: React.FC<HeuristicProps> = ({
  text,
  lvl = null,
  score = null,
  signature = false,
  show_type = false,
  highlight_key = null,
  fullWidth = false
}) => {
  const [state, setState] = React.useState(initialMenuState);
  const history = useHistory();
  const { isHighlighted, triggerHighlight } = useHighlighter();
  const { copy } = useClipboard();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const searchAttack = useCallback(
    () => history.push(`/search/result?query=result.sections.heuristic${signature ? '.signature' : ''}.name:"${text}"`),
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
    copy(text, 'drawerTop');
    handleClose();
  }, [copy, handleClose, text]);

  const handleMenuSearch = useCallback(() => {
    searchAttack();
    handleClose();
  }, [searchAttack, handleClose]);

  const handleMenuHighlight = useCallback(() => {
    handleClick();
    handleClose();
  }, [handleClick, handleClose]);

  let color: PossibleColors = 'default' as 'default';
  if (lvl) {
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
      <Menu
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null ? { top: state.mouseY, left: state.mouseX } : undefined
        }
      >
        <MenuItem dense onClick={handleMenuCopy}>
          {CLIPBOARD_ICON}Copy to clipboard
        </MenuItem>
        <MenuItem dense onClick={handleMenuSearch}>
          {SEARCH_ICON}Find instances
        </MenuItem>
        <MenuItem dense onClick={handleMenuHighlight}>
          {HIGHLIGHT_ICON}Toggle Highlight
        </MenuItem>
      </Menu>
      <CustomChip
        wrap
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

export default Heuristic;
