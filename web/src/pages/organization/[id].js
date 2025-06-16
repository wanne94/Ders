import React from 'react';
import { useRouter } from 'next/router';
import ElementPage from '../ElementPage';

const OrganizationPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return <ElementPage type="organization" id={id} />;
};

export default OrganizationPage; 