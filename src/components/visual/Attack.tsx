import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SelectAllOutlinedIcon from '@mui/icons-material/SelectAllOutlined';
import { Divider, ListSubheader, Menu, MenuItem } from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import type { CustomUser } from 'components/models/ui/user';
import type { PossibleColors } from 'components/visual/CustomChip';
import CustomChip from 'components/visual/CustomChip';
import { safeFieldValueURI } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const STYLE = { height: 'auto', minHeight: '20px' };
const SEARCH_ICON = <SearchOutlinedIcon style={{ marginRight: '16px' }} />;
const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const HIGHLIGHT_ICON = <SelectAllOutlinedIcon style={{ marginRight: '16px' }} />;
const initialMenuState = {
  mouseX: null,
  mouseY: null
};

type AttackProps = {
  text: string;
  lvl?: string | null;
  score?: number | null;
  show_type?: boolean;
  highlight_key?: string;
  fullWidth?: boolean;
  force?: boolean;
};

const WrappedAttack: React.FC<AttackProps> = ({
  text,
  lvl = null,
  score = null,
  show_type = false,
  highlight_key = null,
  fullWidth = false,
  force = false
}) => {
  const { t } = useTranslation();
  const [state, setState] = React.useState(initialMenuState);
  const { isHighlighted, triggerHighlight, getHighlightedValues } = useHighlighter();
  const { copy } = useClipboard();
  const { showSafeResults } = useSafeResults();
  const { scoreToVerdict } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const maliciousness = lvl || scoreToVerdict(score);
  const color: PossibleColors = {
    suspicious: 'warning' as const,
    malicious: 'error' as const,
    safe: 'success' as const,
    info: 'default' as const,
    highly_suspicious: 'warning' as const
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
    copy(text, 'clipID');
    handleClose();
  }, [copy, handleClose, text]);

  const handleMenuHighlight = useCallback(() => {
    handleClick();
    handleClose();
  }, [handleClick, handleClose]);

  return maliciousness === 'safe' && !showSafeResults && !force ? null : (
    <>
      <Menu
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null ? { top: state.mouseY, left: state.mouseX } : undefined
        }
      >
        {currentUser.roles.includes('submission_view') && (
          <MenuItem
            component={Link}
            dense
            onClick={handleClose}
            to={`/search/result?query=result.sections.heuristic.attack.pattern:${safeFieldValueURI(text)}`}
          >
            {SEARCH_ICON}
            {t('related')}
          </MenuItem>
        )}
        <MenuItem dense onClick={handleMenuHighlight}>
          {HIGHLIGHT_ICON}
          {t('highlight')}
        </MenuItem>
        <div>
          <Divider />
          <ListSubheader disableSticky sx={{ lineHeight: '32px' }}>
            {t('clipboard')}
          </ListSubheader>
          <MenuItem
            id="clipID.value"
            dense
            onClick={async () => {
              await copy(text, 'clipID.value');
              handleClose();
            }}
          >
            {CLIPBOARD_ICON}
            {t('clipboard')}
          </MenuItem>
          <MenuItem
            id="clipID.highlighted_values"
            dense
            onClick={async () => {
              await copy(getHighlightedValues().join('\n'), 'clipID.highlighted_values');
              handleClose();
            }}
          >
            {CLIPBOARD_ICON}
            {t('clipboard.highlighted_values')}
          </MenuItem>
        </div>
      </Menu>
      <CustomChip
        wrap
        size="tiny"
        type="rounded"
        variant="outlined"
        color={highlight_key && isHighlighted(highlight_key) ? 'primary' : color}
        label={show_type ? `[ATT&CK] ${text}` : text}
        style={STYLE}
        onClick={highlight_key ? handleClick : null}
        fullWidth={fullWidth}
        onContextMenu={handleMenuClick}
      />
    </>
  );
};

const Attack = React.memo(WrappedAttack);
export default Attack;
