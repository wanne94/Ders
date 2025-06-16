// ActiveDaije Component
const ActiveDaije = ({ daije, lectures }) => {
  const router = useRouter();
  const [displayDaije, setDisplayDaije] = useState([]);

  useEffect(() => {
    if (daije && lectures) {
      // Filtriramo samo odobrene daije
      const approvedDaije = (daije || []).filter(daija => daija.status === 'approved');
      
      // Nasumično mešamo array
      const shuffled = [...approvedDaije].sort(() => Math.random() - 0.5);
      
      // Uzimamo prvih 10
      const randomDaije = shuffled.slice(0, 10);
      setDisplayDaije(randomDaije || []);
    }
  }, [daije, lectures]);

  const handleViewAllDaije = () => {
    router.push('/daije');
  };

  // displayDaije already contains only approved daije from the sorting function
  const approvedDaije = displayDaije;

  return (
    <Box sx={{ mt: 1, textAlign: 'center' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
        Daije
      </Typography>
      <Typography variant="p" component="p" gutterBottom sx={{ mb: 2 }}>
      Upoznaj 10 nasumično odabranih daija.
      </Typography>

      {approvedDaije.length === 0 ? (
        <Typography variant="body1" color="text.secondary" >
          Trenutno nema dostupnih daija.
        </Typography>
      ) : (
        <>
          <DaijeGrid 
            gap={3}
            sx={{
              width: '100%',
            }}
          >
            {approvedDaije.map((daija) => (
              <Box key={daija._id} sx={{ height: '200px' }}>
                <UniversalCard data={{ ...daija, type: 'Daija' }} />
              </Box>
            ))}
          </DaijeGrid>
          <Box sx={{ mt: 4, mb: 0 }}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={handleViewAllDaije}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Prikaži sve daije
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};