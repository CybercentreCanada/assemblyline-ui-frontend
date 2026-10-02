import React from 'react';

type TitleKeyProps = {
  title: string;
};

const TitleKey: React.FC<TitleKeyProps> = ({ title }) => (
  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{title.replace(/[-_.]/g, ' ')}</span>
);

export default TitleKey;
