import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import useHighlighter from 'components/hooks/useHighlighter';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import { scoreToVerdict } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

const STYLE = { height: 'auto', minHeight: '20px' };
const SEARCH_ICON = <SearchOutlinedIcon style={{ marginLeft: '2px', height: '18px', width: '18px' }} />;

type HeuristicProps = {
  text: string;
  lvl?: string | null;
  score?: number | null;
  signature?: boolean;
  show_type?: boolean;
  highlight_key?: string;
};

const Heuristic: React.FC<HeuristicProps> = ({
  text,
  lvl = null,
  score = null,
  signature = false,
  show_type = false,
  highlight_key = null
}) => {
  const history = useHistory();
  const { isHighlighted, triggerHighlight } = useHighlighter();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const searchAttack = useCallback(
    () => history.push(`/search/result?q=result.sections.heuristic${signature ? '.signature' : ''}.name:"${text}"`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature, text]
  );

  let color: PossibleColors = 'default' as 'default';
  if (lvl) {
    color = {
      info: 'default' as 'default',
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
    <CustomChip
      wrap
      size="tiny"
      type="square"
      color={highlight_key && isHighlighted(highlight_key) ? ('primary' as 'info') : color}
      label={show_type ? (signature ? `[SIGNATURE] ${text}` : `[HEURISTIC] ${text}`) : text}
      onDelete={searchAttack}
      deleteIcon={SEARCH_ICON}
      style={STYLE}
      onClick={highlight_key ? handleClick : null}
    />
  );
};

export default Heuristic;
