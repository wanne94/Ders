import { useState, useEffect } from 'react';
import Image from 'next/image';
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
    Select,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axiosInstance from '../utils/axiosConfig';
import { daijeService, udruzenjaService } from '@/services';
import { getImageUrl } from '../utils/imageUtils';
import { uploadImage } from '../utils/uploadService';
import { 
  parseLocalDateString, 
  formatDateToLocalString, 
  getTodayStartOfDay,
  handleDatePickerChange 
} from '../utils/datePickerUtils';

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
  // Calculate remaining weeks for existing weekly lectures
  const calculateRemainingWeeks = (totalWeeks, weekNumber) => {
    if (!totalWeeks || !weekNumber) return 0;
    return Math.max(0, totalWeeks - weekNumber + 1);
  };
  
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
    isWeeklyLecture: false,
    totalWeeks: 2,
    weekNumber: null,
    weeklySeriesId: '',
    lecturePart: null
  });

  const [daije, setDaije] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [remainingWeeks, setRemainingWeeks] = useState(0);

  // Check if organization is selected (disable address/city fields)
  const isOrganizationSelected = Boolean(formData.organizationId && !useCustomOrganization);

  // Populate form data when editing
  useEffect(() => {
    if (lecture) {
      // Parse date properly - handle different date formats from server
      let parsedDate = '';
      if (lecture.date) {
        try {
          // Create date object ensuring local timezone interpretation
          const dateStr = lecture.date;
          let date;
          
          // If date string is in ISO format (contains 'T'), parse it properly
          if (dateStr.includes('T')) {
            // ISO string - extract just the date part to avoid timezone issues
            parsedDate = dateStr.split('T')[0];
          } else if (dateStr.includes('-')) {
            // Already in YYYY-MM-DD format
            parsedDate = dateStr;
          } else {
            // Fallback: create Date object and use local methods
            date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              parsedDate = `${year}-${month}-${day}`;
            }
          }
          console.log('📅 Parsed date for editing:', parsedDate, 'from:', dateStr);
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
        isWeeklyLecture: lecture.isWeeklyLecture || false,
        totalWeeks: lecture.totalWeeks || 2,
        weekNumber: lecture.weekNumber || 1,
        weeklySeriesId: lecture.weeklySeriesId || '',
        lecturePart: lecture.lecturePart || null
      });

      // Set custom speaker/organization flags
      setUseCustomSpeaker(!lecture.daijaId && !!lecture.speaker);
      setUseCustomOrganization(!lecture.organizationId && !!lecture.organization);

      // Set image preview if editing - use getImageUrl to get proper server URL
      if (lecture.image && lecture.image.trim() !== '') {
        setImagePreview(getImageUrl(lecture.image));
      }
      
      // Calculate remaining weeks for existing weekly lectures
      if (lecture.isWeeklyLecture && lecture.weekNumber && lecture.totalWeeks) {
        setRemainingWeeks(calculateRemainingWeeks(lecture.totalWeeks, lecture.weekNumber));
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
        isWeeklyLecture: false,
        totalWeeks: 2,
        weekNumber: null,
        weeklySeriesId: '',
        lecturePart: null
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
    // Use utility function to safely handle date conversion
    const formattedDate = handleDatePickerChange(date);
    console.log('📅 Date change result:', { 
      input: date, 
      formatted: formattedDate 
    });
    
    setFormData(prev => ({
      ...prev,
      date: formattedDate
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
      
      // Generate weeklySeriesId if converting to weekly lecture
      if (finalFormData.isWeeklyLecture && !finalFormData.weeklySeriesId) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substr(2, 9);
        finalFormData.weeklySeriesId = `WL_${timestamp}_${randomString}`;
      }

      let response;
      if (lecture) {
        // Update existing lecture
        response = await axiosInstance.put(`/lectures/${lecture._id}`, finalFormData);
      } else {
        // Create new lecture - requires authentication
        response = await axiosInstance.post('/lectures', finalFormData);
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
                        <Image
                          src={imagePreview}
                          alt="Pregled"
                          width={400}
                          height={200}
                          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 4, objectFit: 'contain' }}
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
                value={parseLocalDateString(formData.date)}
                onChange={handleDateChange}
                format="dd.MM.yyyy"
                minDate={isEditing ? null : getTodayStartOfDay()}
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

              {/* Weekly lecture checkbox and weeks input */}
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isWeeklyLecture}
                      onChange={(e) => setFormData(prev => ({ ...prev, isWeeklyLecture: e.target.checked }))}
                    />
                  }
                  label="Sedmično predavanje"
                />
                {formData.isWeeklyLecture && (
                  <>
                    {isEditing && formData.weeklySeriesId ? (
                      // For existing weekly lectures, show remaining weeks
                      <>
                        <Typography variant="body2" sx={{ mt: 1, mb: 1, color: 'text.secondary' }}>
                          Sedmica {formData.weekNumber} od {formData.totalWeeks}
                        </Typography>
                        <TextField
                          name="remainingWeeks"
                          label="Preostalo sedmica za održati"
                          type="number"
                          value={remainingWeeks}
                          onChange={(e) => {
                            const newRemaining = parseInt(e.target.value) || 0;
                            setRemainingWeeks(newRemaining);
                            // Calculate new totalWeeks
                            const newTotalWeeks = formData.weekNumber + newRemaining - 1;
                            setFormData(prev => ({ ...prev, totalWeeks: newTotalWeeks }));
                          }}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            inputProps: { 
                              min: 0, 
                              max: 12 - formData.weekNumber + 1
                            }
                          }}
                          helperText={`Koliko još sedmica želite kreirati nakon sedmice ${formData.weekNumber}?`}
                        />
                      </>
                    ) : (
                      // For new weekly lectures or converting regular to weekly
                      <TextField
                        name="totalWeeks"
                        label="Broj sedmica"
                        type="number"
                        value={formData.totalWeeks}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          inputProps: { 
                            min: 2, 
                            max: 12 
                          }
                        }}
                        helperText="Unesite ukupan broj sedmica (min: 2, max: 12)"
                      />
                    )}
                    
                    {/* Lecture part field */}
                    <TextField
                      name="lecturePart"
                      label={isEditing && formData.weeklySeriesId ? "Broj dijela" : "Početni broj dijela"}
                      type="number"
                      value={formData.lecturePart || ''}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        inputProps: { 
                          min: 1
                        }
                      }}
                      helperText={
                        isEditing && formData.weeklySeriesId 
                          ? "Broj dijela ovog predavanja (npr. 26)"
                          : "Od kojeg dijela počinje serija (npr. 155)"
                      }
                    />
                  </>
                )}
              </Box>
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