import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useHistory } from 'react-router-dom';

type TagProps = {
  lvl: string;
  type: string;
  value: string;
};

const Tag: React.FC<TagProps> = ({ lvl, type, value }) => {
  const history = useHistory();

  const searchAttack = () => {
    history.push(`/search/result?q=result.sections.tags.${type}:"${value}"`);
  };

  return (
    <CustomChip
      wrap
      size="tiny"
      type="square"
      color={{ info: 'default' as 'default', suspicious: 'warning' as 'warning', malicious: 'error' as 'error' }[lvl]}
      label={value}
      onDelete={searchAttack}
      deleteIcon={<SearchOutlinedIcon style={{ marginLeft: '2px', height: '18px', width: '18px' }} />}
      style={{ height: 'auto' }}
    />
  );
};

export default Tag;
