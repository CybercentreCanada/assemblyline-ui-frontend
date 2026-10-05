import React, { useEffect } from 'react';

type CrashTestProps = {
  message?: string;
};

const CrashTest: React.FC<CrashTestProps> = ({ message = null }) => {
  // This page makes the UI crash so we can test the frontend exception handling
  useEffect(() => {
    throw new Error(message || 'This is a test crash !');
  }, [message]);

  return <div />;
};

export default CrashTest;
