import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Alert,
    Snackbar,
    TextField,
    Typography,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axiosInstance from '../utils/axiosConfig';
import { daijeService, udruzenjaService } from '@/services';
import { getImageUrl } from '../utils/imageUtils';
import { uploadImage } from '../utils/uploadService';

// Generate time options with 15-minute intervals
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

const LectureForm = ({ open, onClose, onSuccess, approvalEnabled = true, lecture }) => {
  const [formData, setFormData] = useState({
    title: '',
    daijaId: '',
    speaker: '',
    organizationId: '',
    organization: '',
    date: '',
    time: '',
    address: '',
    city: '',
    shortDescription: '',
    image: '',
    status: 'pending'
  });

  const [daije, setDaije] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check if organization is selected (disable address/city fields)
  const isOrganizationSelected = Boolean(formData.organizationId && !useCustomOrganization);

  // Populate form data when editing
  useEffect(() => {
    if (lecture) {
      // Parse date properly - handle different date formats from server
      let parsedDate = '';
      if (lecture.date) {
        try {
          const date = new Date(lecture.date);
          if (!isNaN(date.getTime())) {
            // Format to YYYY-MM-DD for consistency
            parsedDate = date.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Error parsing date:', error);
          parsedDate = lecture.date; // Fallback to original value
        }
      }

      setFormData({
        title: lecture.title || '',
        daijaId: lecture.daijaId || '',
        speaker: lecture.speaker || '',
        organizationId: lecture.organizationId || '',
        organization: lecture.organization || '',
        date: parsedDate,
        time: lecture.time || '',
        address: lecture.address || '',
        city: lecture.city || '',
        shortDescription: lecture.shortDescription || '',
        image: lecture.image || '',
        status: lecture.status || 'pending'
      });

      // Set custom speaker/organization flags
      setUseCustomSpeaker(!lecture.daijaId && !!lecture.speaker);
      setUseCustomOrganization(!lecture.organizationId && !!lecture.organization);

      // Set image preview if editing - use getImageUrl to get proper server URL
      if (lecture.image && lecture.image.trim() !== '') {
        setImagePreview(getImageUrl(lecture.image));
      }
    } else {
      // Reset form when not editing
      setFormData({
        title: '',
        daijaId: '',
        speaker: '',
        organizationId: '',
        organization: '',
        date: '',
        time: '',
        address: '',
        city: '',
        shortDescription: '',
        image: '',
        status: 'pending'
      });
      setUseCustomSpeaker(false);
      setUseCustomOrganization(false);
      setImagePreview(null);
    }
  }, [lecture, open]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [daijeRes, organizationsRes] = await Promise.all([
          daijeService.getAllDaije(),
          udruzenjaService.getAllUdruzenja()
        ]);
        
        setDaije(Array.isArray(daijeRes) ? daijeRes : []);
        setOrganizations(Array.isArray(organizationsRes) ? organizationsRes : []);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setError('Greška pri dohvaćanju podataka');
        setDaije([]);
        setOrganizations([]);
      }
    };
    
    if (open) {
      fetchData();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    console.log('🖼️ IMAGE CHANGE - File selected:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    if (file) {
      try {
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          console.log('❌ File too large:', file.size, 'bytes');
          setError('Slika je prevelika. Maksimalna veličina je 5MB.');
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          console.log('❌ Invalid file type:', file.type);
          setError('Nepodržan format slike. Koristite JPG, PNG, GIF ili WebP.');
          return;
        }

        console.log('✅ File validation passed:', {
          name: file.name,
          size: file.size,
          type: file.type
        });

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('📷 Preview created for:', file.name);
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Store the file object for later upload
        setFormData(prev => {
          const newData = {
            ...prev,
            imageFile: file,
            image: '' // Clear any existing image path
          };
          console.log('💾 FormData updated with image file:', {
            hasImageFile: !!newData.imageFile,
            imageFileName: newData.imageFile?.name,
            clearedImagePath: newData.image
          });
          return newData;
        });
      } catch (error) {
        console.error('❌ Error processing image:', error);
        setError('Greška pri obradi slike');
      }
    } else {
      console.log('📷 No file selected');
    }
  };

  const handleDateChange = (date) => {
    console.log('📅 Date changed:', date);
    setFormData(prev => ({
      ...prev,
      date: date ? date.toISOString().split('T')[0] : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Detaljana validacija
    const errors = [];
    
    if (!formData.title || !formData.title.trim()) {
      errors.push('Naslov predavanja je obavezan');
    } else if (formData.title.trim().length < 3) {
      errors.push('Naslov mora imati najmanje 3 karaktera');
    }
    
    if (!formData.date) {
      errors.push('Datum predavanja je obavezan');
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Only restrict past dates when creating new lectures, not when editing existing ones
      if (!isEditing && selectedDate < today) {
        errors.push('Datum predavanja ne može biti u prošlosti');
      }
    }
    
    if (!formData.time) {
      errors.push('Vreme predavanja je obavezno');
    }
    
    if (!formData.address || !formData.address.trim()) {
      errors.push('Adresa je obavezna');
    } else if (formData.address.trim().length < 3) {
      errors.push('Adresa mora imati najmanje 3 karaktera');
    }
    
    if (!formData.city || !formData.city.trim()) {
      errors.push('Mjesto je obavezno');
    } else if (formData.city.trim().length < 2) {
      errors.push('Mjesto mora imati najmanje 2 karaktera');
    }
    
    // Validacija za daije
    if (!useCustomSpeaker && !formData.daijaId) {
      errors.push('Molimo odaberite daiu ili unesite ime daije');
    }
    
    if (useCustomSpeaker && (!formData.speaker || !formData.speaker.trim())) {
      errors.push('Ime daije je obavezno kada niste izabrali daiju');
    } else if (useCustomSpeaker && formData.speaker && formData.speaker.trim().length < 2) {
      errors.push('Ime daije mora imati najmanje 2 karaktera');
    }
    
    // Validacija za organizaciju
    if (!useCustomOrganization && !formData.organizationId) {
      errors.push('Molimo odaberite udruženje ili unesite naziv organizacije');
    }
    
    if (useCustomOrganization && (!formData.organization || !formData.organization.trim())) {
      errors.push('Naziv organizacije je obavezan kada ne birate udruženje');
    } else if (useCustomOrganization && formData.organization && formData.organization.trim().length < 2) {
      errors.push('Naziv organizacije mora imati najmanje 2 karaktera');
    }
    
    // Validacija kratkog opisa (opciono, bez ograničenja dužine)

    if (errors.length > 0) {
      setError('Molimo ispravite sledeće greške:\n• ' + errors.join('\n• '));
      return;
    }

    try {
      let imagePath = formData.image; // Keep existing image if editing
      
      console.log('🔍 SUBMIT DEBUG - Initial state:', {
        hasImageFile: !!formData.imageFile,
        currentImagePath: formData.image,
        imageFileName: formData.imageFile?.name,
        imageFileSize: formData.imageFile?.size
      });

      // Upload new image if selected - using production server upload service
      if (formData.imageFile) {
        console.log('📤 UPLOAD STARTING - File detected, using production server upload...');
        console.log('📁 File details:', {
          name: formData.imageFile.name,
          size: formData.imageFile.size,
          type: formData.imageFile.type
        });
        
        try {
          // Use new upload service that always goes to production server
          const uploadResponse = await uploadImage(formData.imageFile);

          console.log('✅ Upload response:', uploadResponse);
          if (uploadResponse.success && uploadResponse.path) {
            // Store just the relative path, getImageUrl will handle the full URL
            imagePath = uploadResponse.path;
            console.log('🖼️ Image uploaded successfully to production server:', imagePath);
            console.log('🔄 UPLOAD SUCCESS - New image path:', imagePath);
          } else {
            throw new Error('Upload failed: ' + (uploadResponse.error || 'Unknown error'));
          }
        } catch (uploadError) {
          console.error('❌ Upload error details:', {
            message: uploadError.message
          });
          throw new Error('Upload failed: ' + uploadError.message);
        }
      } else {
        console.log('📷 NO UPLOAD - No image file selected, using existing path:', imagePath);
      }

      // Prepare final form data with uploaded image path
      const finalFormData = {
        ...formData,
        image: imagePath || '/uploads/images/predavanjeslika.jpg' // Use default lecture image if no image provided
      };

      // Remove imageFile from the data sent to server
      delete finalFormData.imageFile;

      let response;
      if (lecture) {
        // Update existing lecture
        response = await axiosInstance.put(`/lectures/${lecture._id}`, finalFormData);
      } else {
        // Create new lecture with approval status based on settings
        const lectureData = {
          ...finalFormData,
          status: approvalEnabled ? 'pending' : 'approved'
        };
        response = await axiosInstance.post('/lectures', lectureData);
      }
      
      setSuccess(true);
      onSuccess(response.data);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Greška pri " + (lecture ? 'ažuriranju' : 'dodavanju') + " predavanja");
    }
  };

  const isEditing = !!lecture;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { cursor: 'default' }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', cursor: 'default' }}>
          {isEditing ? 'Uredi predavanje' : 'Dodaj ders'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Image Upload */}
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Slika predavanja
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  mb: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload" style={{ display: 'block', cursor: 'pointer' }}>
                  {imagePreview ? (
                    <>
                      <Box sx={{ mt: 2 }}>
                        <img
                          src={imagePreview}
                          alt="Pregled"
                          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 4 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                        <CloudUploadIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Kliknite za promjenu slike
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Kliknite za dodavanje slike
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ili prevucite sliku ovdje
                      </Typography>
                    </Box>
                  )}
                </label>
              </Box>

              {/* Upload restrictions info */}
              <Box sx={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 1, 
                p: 2, 
                mb: 2,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                  📋 Automatska optimizacija:
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  • Maksimalna veličina: <strong>5 MB</strong><br/>
                  • Podržani formati: <strong>JPG, PNG, WebP</strong><br/>
                 
                </Typography>
              </Box>

              {/* Title */}
              <TextField
                name="title"
                label="Naslov predavanja"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                inputProps={{
                  maxLength: 80
                }}
                helperText={`${formData.title.length}/80 karaktera`}
              />

              {/* Short Description */}
              <TextField
                name="shortDescription"
                label="Kratki opis (neobavezno)"
                value={formData.shortDescription}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                inputProps={{
                  maxLength: 500
                }}
                helperText={`${formData.shortDescription.length}/500 karaktera`}
                placeholder="Kratki opis predavanja koji će se prikazivati na kartici..."
              />

              {/* Speaker Selection */}
              <FormControl fullWidth margin="normal" required={!useCustomSpeaker}>
                <InputLabel>Odaberi daiju</InputLabel>
                <Select
                  value={useCustomSpeaker ? 'custom' : formData.daijaId}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setUseCustomSpeaker(true);
                      setFormData(prev => ({
                        ...prev,
                        daijaId: '',
                        speaker: ''
                      }));
                    } else {
                      setUseCustomSpeaker(false);
                                    const selectedDaija = daije.find(d => d._id === e.target.value);
              setFormData(prev => ({
                ...prev,
                daijaId: e.target.value,
                speaker: selectedDaija ? `${selectedDaija.title} ${selectedDaija.name}` : ''
              }));
                    }
                  }}
                  label="Odaberi daiju"
                >
                  {Array.isArray(daije) && daije.map((daija) => (
                    <MenuItem key={daija._id} value={daija._id}>
                      {daija.title} {daija.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">➕ Upiši ime daije</MenuItem>
                </Select>
              </FormControl>

              {useCustomSpeaker && (
                <TextField
                  fullWidth
                  label="Ime i prezime daije"
                  name="speaker"
                  value={formData.speaker}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
              )}

              {/* Organization Selection */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Udruženje</InputLabel>
                <Select
                  value={useCustomOrganization ? 'custom' : formData.organizationId}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setUseCustomOrganization(true);
                      setFormData(prev => ({
                        ...prev,
                        organizationId: '',
                        organization: '',
                        city: '',
                        address: ''
                      }));
                    } else {
                      setUseCustomOrganization(false);
                      const selectedOrganization = organizations.find(o => o._id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        organizationId: e.target.value,
                        organization: selectedOrganization ? selectedOrganization.name : '',
                        city: selectedOrganization ? selectedOrganization.city || '' : '',
                        address: selectedOrganization ? selectedOrganization.address || '' : ''
                      }));
                    }
                  }}
                  label="Udruženje"
                >
                  <MenuItem value="">
                    <em>Nije navedeno</em>
                  </MenuItem>
                  {Array.isArray(organizations) && organizations.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">➕ Upiši ime udruženja</MenuItem>
                </Select>
              </FormControl>

              {/* Custom organization name field - appears immediately after organization dropdown */}
              {useCustomOrganization && (
                <TextField
                  fullWidth
                  label="Naziv udruženja"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  margin="normal"
                  required
                  placeholder="Unesite naziv udruženja..."
                />
              )}

              {/* Date and Time */}
              <DatePicker
                label="Datum"
                value={formData.date ? new Date(formData.date) : null}
                onChange={handleDateChange}
                format="dd.MM.yyyy"
                minDate={isEditing ? null : new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal"
                  }
                }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Vrijeme</InputLabel>
                <Select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  label="Vrijeme"
                  required
                >
                  <MenuItem value="">
                    <em>Odaberite vrijeme</em>
                  </MenuItem>
                  {timeOptions.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Address and City - Disabled when organization is selected */}
              <TextField
                name="address"
                label="Adresa"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                required
                disabled={isOrganizationSelected}
                helperText={isOrganizationSelected ? "Adresa se automatski popunjava iz odabranog udruženja" : ""}
              />

              <TextField
                name="city"
                label="Mjesto"
                value={formData.city}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                disabled={isOrganizationSelected}
                helperText={isOrganizationSelected ? "Mjesto se automatski popunjava iz odabranog udruženja" : ""}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '10px' }}>
          <Button 
            onClick={onClose}
            sx={{ '&:hover': { cursor: 'pointer' } }}
          >
            Otkaži
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            color="primary"
            sx={{ '&:hover': { cursor: 'pointer' } }}
          >
            {isEditing ? 'Osvježi' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={8000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error"
          sx={{ 
            cursor: 'default',
            whiteSpace: 'pre-line',
            maxWidth: '500px'
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success"
          sx={{ cursor: 'default' }}
        >
          {isEditing ? 'Ders uspješno uređen' : 'Ders uspješno dodan, nakon odobrenja može biti vidljiv na stranici'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LectureForm; 