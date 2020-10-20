import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useHistory } from 'react-router-dom';

type HeuristicProps = {
  lvl: string;
  text: string;
  signature?: boolean;
};

const Heuristic: React.FC<HeuristicProps> = ({ lvl, text, signature = false }) => {
  const history = useHistory();

  const searchAttack = () => {
    history.push(`/search/result?q=result.sections.heuristic${signature ? '.signature' : ''}.name:"${text}"`);
  };

  return (
    <CustomChip
      size="tiny"
      type="square"
      color={{ info: 'default' as 'default', suspicious: 'warning' as 'warning', malicious: 'error' as 'error' }[lvl]}
      label={text}
      onDelete={searchAttack}
      deleteIcon={<SearchOutlinedIcon style={{ marginLeft: '2px', height: '18px', width: '18px' }} />}
    />
  );
};

export default Heuristic;
