import React from 'react';
import Head from 'next/head';
import ElementPage from './ElementPage';

const OrganizationsPage = () => {
  return (
    <>
      <Head>
        <title>Udruženja - Ders</title>
        <meta name="description" content="Istražite islamska udruženja i njihove aktivnosti. Pronađite informacije o lokalnim džematima i organizacijama." />
        <link rel="canonical" href="https://ders.ba/organizations" />
      </Head>
      <ElementPage type="organizations" />
    </>
  );
};

export default OrganizationsPage; 

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}