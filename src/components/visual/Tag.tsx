import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import useHighlighter from 'components/hooks/useHighlighter';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import { scoreToVerdict } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

const STYLE = { height: 'auto', minHeight: '20px' };
const SEARCH_ICON = <SearchOutlinedIcon style={{ marginLeft: '2px', height: '18px', width: '18px' }} />;

type TagProps = {
  type: string;
  value: string;
  lvl?: string | null;
  score?: number | null;
  short_type?: string | null;
  highlight_key?: string;
  fullWidth?: boolean;
};

const Tag: React.FC<TagProps> = ({
  type,
  value,
  lvl = null,
  score = null,
  short_type = null,
  highlight_key = null,
  fullWidth = false
}) => {
  const history = useHistory();
  const { isHighlighted, triggerHighlight } = useHighlighter();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const searchAttack = useCallback(
    () => history.push(`/search/result?query=result.sections.tags.${type}:"${value}"`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, value]
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
      type="rounded"
      color={highlight_key && isHighlighted(highlight_key) ? ('primary' as 'info') : color}
      label={short_type ? `[${short_type.toUpperCase()}] ${value}` : value}
      onDelete={searchAttack}
      deleteIcon={SEARCH_ICON}
      style={STYLE}
      onClick={highlight_key ? handleClick : null}
      fullWidth={fullWidth}
    />
  );
};

export default Tag;
