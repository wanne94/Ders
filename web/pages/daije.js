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