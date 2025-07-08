import { Container, Typography, Box, Paper } from '@mui/material';
import PageLayout from '@/components/PageLayout';
import Head from 'next/head';

const PrivacyPolicy = () => {
  return (
    <PageLayout>
      <Head>
        <title>Politika privatnosti - DERS</title>
        <meta name="description" content="Politika privatnosti DERS platforme" />
      </Head>
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 } }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Politika privatnosti
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Dobrodošli na DERS platformu. Vaša privatnost nam je veoma važna. Ova politika privatnosti objašnjava kako prikupljamo, koristimo i štitimo vaše podatke.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            1. Podaci koje prikupljamo
          </Typography>
          <Typography variant="body1" paragraph>
            Kada koristite našu platformu, možemo prikupiti sljedeće podatke:
          </Typography>
          <Box component="ul" sx={{ mb: 3 }}>
            <Typography component="li" variant="body1">Ime i prezime (pri registraciji)</Typography>
            <Typography component="li" variant="body1">Email adresa</Typography>
            <Typography component="li" variant="body1">Broj telefona (opciono)</Typography>
            <Typography component="li" variant="body1">Informacije o predavanjima koja pratite</Typography>
            <Typography component="li" variant="body1">Podatke o vašoj aktivnosti na platformi</Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            2. Kako koristimo vaše podatke
          </Typography>
          <Typography variant="body1" paragraph>
            Vaše podatke koristimo isključivo za:
          </Typography>
          <Box component="ul" sx={{ mb: 3 }}>
            <Typography component="li" variant="body1">Omogućavanje pristupa platformi</Typography>
            <Typography component="li" variant="body1">Obavještavanje o novim predavanjima</Typography>
            <Typography component="li" variant="body1">Poboljšanje korisničkog iskustva</Typography>
            <Typography component="li" variant="body1">Komunikaciju sa vama u vezi sa vašim nalogom</Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            3. Sigurnost podataka
          </Typography>
          <Typography variant="body1" paragraph>
            Preduzimamo sve razumne mjere za zaštitu vaših podataka od neovlaštenog pristupa, izmjene ili brisanja. Vaši podaci se čuvaju na sigurnim serverima sa ograničenim pristupom.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            4. Dijeljenje podataka
          </Typography>
          <Typography variant="body1" paragraph>
            Nikada ne prodajemo, ne iznajmljujemo niti dijelimo vaše lične podatke sa trećim stranama bez vašeg izričitog odobrenja, osim kada je to zakonski obavezno.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            5. Vaša prava
          </Typography>
          <Typography variant="body1" paragraph>
            Imate pravo da:
          </Typography>
          <Box component="ul" sx={{ mb: 3 }}>
            <Typography component="li" variant="body1">Pristupite svojim podacima</Typography>
            <Typography component="li" variant="body1">Ispravite netačne podatke</Typography>
            <Typography component="li" variant="body1">Zahtijevate brisanje svojih podataka</Typography>
            <Typography component="li" variant="body1">Povučete saglasnost za obradu podataka</Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            6. Kolačići
          </Typography>
          <Typography variant="body1" paragraph>
            Koristimo kolačiće za poboljšanje funkcionalnosti platforme i analizu korištenja. Možete podesiti svoj pretraživač da odbije kolačiće, ali to može uticati na funkcionalnost platforme.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            7. Kontakt
          </Typography>
          <Typography variant="body1" paragraph>
            Za sva pitanja u vezi sa politikom privatnosti, možete nas kontaktirati na:
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1">Email: info@ders.ba</Typography>
            <Typography variant="body1">Telefon: 062 092 827</Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
            8. Izmjene politike privatnosti
          </Typography>
          <Typography variant="body1" paragraph>
            Zadržavamo pravo da izmijenimo ovu politiku privatnosti u bilo kom trenutku. O svim promjenama ćemo vas obavijestiti putem platforme.
          </Typography>

          <Typography variant="body2" sx={{ mt: 6, fontStyle: 'italic', textAlign: 'center' }}>
            Posljednja izmjena: Juni 2025
          </Typography>
        </Paper>
      </Container>
    </PageLayout>
  );
};

export default PrivacyPolicy;
