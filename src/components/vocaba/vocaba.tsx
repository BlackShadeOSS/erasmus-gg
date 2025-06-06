
import React from 'react';

type Props = {
  title: string;
};

const Vocaba: React.FC<Props> = ({ title }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>This is a vocaba component test.</p>
    </div>
  );
};

export default Vocaba;