import React from 'react';
import { useRouter } from 'next/router';
import ElementPage from '../ElementPage';

const OrganizationPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return <ElementPage type="organization" id={id} />;
};

export default OrganizationPage; 

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}