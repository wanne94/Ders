import React from 'react';
import Head from 'next/head';
import ElementPage from './ElementPage';

const LecturesPage = () => {
  return (
    <>
      <Head>
        <title>Predavanja - Ders</title>
        <meta name="description" content="Pregledajte sva dostupna islamska predavanja. Pronađite predavanja po datumu, daiji ili organizaciji." />
        <link rel="canonical" href="https://ders.ba/lectures" />
      </Head>
      <ElementPage type="lectures" />
    </>
  );
};

export default LecturesPage; 

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}