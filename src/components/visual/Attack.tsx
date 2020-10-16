import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useHistory } from 'react-router-dom';

type AttackProps = {
  text: string;
  lvl: string;
};

const Attack: React.FC<AttackProps> = ({ text, lvl }) => {
  const history = useHistory();

  const searchAttack = () => {
    history.push(`/search/result?q=result.sections.heuristic.attack.pattern:"${text}"`);
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

export default Attack;
