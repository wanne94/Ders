import { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import UnifiedForm from './UnifiedForm';

const UnifiedFormExample = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState('lecture');
  const [editData, setEditData] = useState(null);

  // Mock data for dropdowns
  const mockDaije = [
    { _id: '1', title: 'Prof.', name: 'Marko Petrović' },
    { _id: '2', title: 'Dr.', name: 'Ana Jovanović' },
    { _id: '3', title: 'Mr.', name: 'Stefan Nikolić' }
  ];

  const mockOrganizations = [
    { _id: '1', name: 'Islamska zajednica Sarajevo', city: 'Sarajevo', address: 'Ferhadija 1' },
    { _id: '2', name: 'Medžlis Tuzla', city: 'Tuzla', address: 'Turalibegova 15' },
    { _id: '3', name: 'Džemat Zenica', city: 'Zenica', address: 'Bosanska 10' }
  ];

  const handleOpenForm = (type, data = null) => {
    setFormType(type);
    setEditData(data);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditData(null);
  };

  const handleSuccess = (newData) => {
    console.log(`${formType} successfully ${editData ? 'updated' : 'created'}:`, newData);
    handleCloseForm();
    // Here you would typically update your state or refetch data
  };

  return (
    <Paper sx={{ p: 4, m: 2 }}>
      <Typography variant="h4" gutterBottom>
        UnifiedForm Primjer Korištenja
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Ova komponenta demonstrira kako koristiti UnifiedForm za sve tri tipa: predavanja, daije i udruženja.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleOpenForm('lecture')}
        >
          Dodaj Predavanje
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={() => handleOpenForm('daija')}
        >
          Dodaj Daiju
        </Button>
        
        <Button 
          variant="contained" 
          color="success"
          onClick={() => handleOpenForm('organization')}
        >
          Dodaj Udruženje
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Primjer uređivanja (sa postojećim podacima):
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => handleOpenForm('lecture', {
            _id: 'lecture-1',
            title: 'Islamska etika u modernom svijetu',
            description: 'Predavanje o primjeni islamskih vrijednosti u svakodnevnom životu',
            date: '2024-01-15',
            time: '19:00',
            address: 'Ferhadija 1',
            city: 'Sarajevo',
            speaker: 'Prof. Marko Petrović',
            daijaId: '1',
            organization: 'Islamska zajednica Sarajevo',
            organizationId: '1',
            image: '',
            status: 'approved'
          })}
        >
          Uredi Predavanje
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={() => handleOpenForm('daija', {
            _id: 'daija-1',
            name: 'Marko Petrović',
            title: 'prof',
            biography: 'Profesor islamskih nauka sa dugogodišnjim iskustvom u predavanju i istraživanju.',
            image: '',
            status: 'approved',
            education: ['Fakultet islamskih nauka', 'Doktorat iz islamske teologije']
          })}
        >
          Uredi Daiju
        </Button>
        
        <Button 
          variant="outlined" 
          color="success"
          onClick={() => handleOpenForm('organization', {
            _id: 'org-1',
            name: 'Islamska zajednica Sarajevo',
            description: 'Glavna islamska organizacija u Sarajevu koja organizuje vjerske aktivnosti.',
            address: 'Ferhadija 1',
            city: 'Sarajevo',
            facebook: 'https://facebook.com/iz-sarajevo',
            instagram: 'https://instagram.com/iz_sarajevo',
            telegram: 'https://t.me/iz_sarajevo',
            viber: '+38761123456',
            status: 'approved',
            image: ''
          })}
        >
          Uredi Udruženje
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        <strong>Napomena:</strong> Ova komponenta zamjenjuje potrebu za tri odvojene forme (LectureForm, DaijaForm, OrganizationForm) 
        i omogućava lakše održavanje koda kroz jednu unificiranu komponentu.
      </Typography>

      {/* Unified Form */}
      <UnifiedForm
        open={formOpen}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        type={formType}
        data={editData}
        approvalEnabled={true}
        daije={mockDaije}
        organizations={mockOrganizations}
      />
    </Paper>
  );
};

export default UnifiedFormExample; 