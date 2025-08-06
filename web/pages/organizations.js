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