import React from 'react';
import { useRouter } from 'next/router';
import ElementPage from '../ElementPage';

const LecturePage = () => {
  const router = useRouter();
  const { id } = router.query;

  return <ElementPage type="lectures" id={id} />;
};

export default LecturePage; 