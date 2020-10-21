import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import { scoreToVerdict } from 'helpers/utils';
import React from 'react';
import { useHistory } from 'react-router-dom';

type HeuristicProps = {
  text: string;
  lvl?: string | null;
  score?: number | null;
  signature?: boolean;
  show_type?: boolean;
};

const Heuristic: React.FC<HeuristicProps> = ({
  text,
  lvl = null,
  score = null,
  signature = false,
  show_type = false
}) => {
  const history = useHistory();

  const searchAttack = () => {
    history.push(`/search/result?q=result.sections.heuristic${signature ? '.signature' : ''}.name:"${text}"`);
  };

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
      size="tiny"
      type="square"
      color={color}
      label={show_type ? (signature ? `[SIGNATURE] ${text}` : `[HEURISTIC] ${text}`) : text}
      onDelete={searchAttack}
      deleteIcon={<SearchOutlinedIcon style={{ marginLeft: '2px', height: '18px', width: '18px' }} />}
    />
  );
};

export default Heuristic;
