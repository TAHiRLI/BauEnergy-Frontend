import React from 'react';

const StatusButton = ({ text, color }) => {
  return (
    <button
      className={`border-2 rounded-full px-3 text-base cursor-pointer`}
      style={{ borderColor: color, color: color }}
    >
      {text}
    </button>
  );
};

export default StatusButton;
