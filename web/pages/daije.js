import Head from 'next/head';
import ElementPage from './ElementPage';

const DaijePage = () => {
  return (
    <>
      <Head>
        <title>Daije - Ders</title>
        <meta name="description" content="Upoznajte naše daije i predavače. Pronađite predavanja vaših omiljenih daija." />
        <link rel="canonical" href="https://ders.ba/daije" />
      </Head>
      <ElementPage type="daije" />
    </>
  );
};

export default DaijePage; 

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}