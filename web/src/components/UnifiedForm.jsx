import { useState, useEffect, useCallback } from 'react';
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
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Select,
    MenuItem,
    InputLabel,
    InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import PhoneIcon from '@mui/icons-material/Phone';
import axiosInstance from '../utils/axiosConfig';
import { getImageUrl } from '../utils/imageUtils';
import { uploadImage } from '../utils/uploadService';

const UnifiedForm = ({ 
  open, 
  onClose, 
  onSuccess, 
  type, // 'lecture', 'daija', 'organization'
  data = null, // existing data for editing
  approvalEnabled = true,
  daije = [], // for lecture form
  organizations = [] // for lecture form
}) => {
  // Initialize form data based on type
  const getInitialFormData = useCallback(() => {
    switch (type) {
      case 'lecture':
        return {
          title: '',
          description: '',
          date: '',
          time: '',
          address: '',
          city: '',
          speaker: '',
          daijaId: '',
          organization: '',
          organizationId: '',
          image: ''
        };
      case 'daija':
        return {
          name: '',
          title: 'prof',
          biography: '',
          image: '',
          status: 'pending',
          education: []
        };
      case 'organization':
        return {
          name: '',
          description: '',
          address: '',
          city: '',
          facebook: '',
          instagram: '',
          telegram: '',
          viber: '',
          status: 'pending',
          image: '',
          imageFile: null
        };
      default:
        return {};
    }
  }, [type]);

  const [formData, setFormData] = useState(getInitialFormData());
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lecture-specific states
  const [useCustomSpeaker, setUseCustomSpeaker] = useState(false);
  const [useCustomOrganization, setUseCustomOrganization] = useState(false);
  
  // Daija-specific states
  const [educationInput, setEducationInput] = useState('');

  const titles = [
    { value: 'prof', label: 'Prof.' },
    { value: 'mr', label: 'Mr.' },
    { value: 'dr', label: 'Dr.' }
  ];

  const timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  // Populate form data when editing
  useEffect(() => {
    if (data) {
      switch (type) {
        case 'lecture':
          // Parse date properly - handle different date formats from server
          let parsedDate = '';
          if (data.date) {
            try {
              const date = new Date(data.date);
              if (!isNaN(date.getTime())) {
                // Format to YYYY-MM-DD for consistency
                parsedDate = date.toISOString().split('T')[0];
              }
            } catch (error) {
              console.error('Error parsing date:', error);
              parsedDate = data.date; // Fallback to original value
            }
          }

          setFormData({
            title: data.title || '',
            description: data.description || '',
            date: parsedDate,
            time: data.time || '',
            address: data.address || '',
            city: data.city || '',
            speaker: data.speaker || '',
            daijaId: data.daijaId || '',
            organization: data.organization || '',
            organizationId: data.organizationId || '',
            image: data.image || ''
          });
          setUseCustomSpeaker(!data.daijaId && !!data.speaker);
          setUseCustomOrganization(!data.organizationId && !!data.organization);
          break;
        case 'daija':
          setFormData({
            name: data.name || '',
            title: data.title || 'prof',
            biography: data.biography || '',
            image: data.image || '',
            status: data.status || 'pending',
            education: data.education || []
          });
          break;
        case 'organization':
          setFormData({
            name: data.name || '',
            description: data.description || '',
            address: data.address || '',
            city: data.city || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            telegram: data.telegram || '',
            viber: data.viber || '',
            status: data.status || 'pending',
            image: data.image || '',
            imageFile: null
          });
          break;
      }

      // Set image preview if editing - use getImageUrl to get proper server URL
      if (data.image && data.image.trim() !== '') {
        setImagePreview(getImageUrl(data.image));
      }
    } else {
      // Reset form when not editing
      setFormData(getInitialFormData());
      setImagePreview(null);
      setEducationInput('');
      setUseCustomSpeaker(false);
      setUseCustomOrganization(false);
    }
  }, [data, open, type, getInitialFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, title: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date: date ? date.toISOString().split('T')[0] : '' }));
  };

  // Daija-specific handlers
  const handleAddEducation = () => {
    if (educationInput.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, educationInput.trim()]
      }));
      setEducationInput('');
    }
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    
    if (file) {
      try {
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          setError('Slika je prevelika. Maksimalna veličina je 5MB.');
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          setError('Nepodržan format slike. Koristite JPG, PNG, GIF ili WebP.');
          return;
        }

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Store the file object for later upload
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          image: '' // Clear any existing image path
        }));
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Greška pri obradi slike');
      }
    }
  };

  const validateForm = () => {
    const errors = [];

    switch (type) {
      case 'lecture':
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
          if (selectedDate < today) {
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
          errors.push('Molimo odaberite daiju ili unesite ime daije');
        }

        if (useCustomSpeaker && (!formData.speaker || !formData.speaker.trim())) {
          errors.push('Ime daije je obavezno kada niste odabrali daiju');
        } else if (useCustomSpeaker && formData.speaker && formData.speaker.trim().length < 2) {
          errors.push('Ime daije mora imati najmanje 2 karaktera');
        }
        break;

      case 'daija':
        if (!formData.name || !formData.name.trim()) {
          errors.push('Ime je obavezno');
        } else if (formData.name.trim().length < 2) {
          errors.push('Ime mora imati najmanje 2 karaktera');
        }

        if (!formData.biography || !formData.biography.trim()) {
          errors.push('Biografija je obavezna');
        } else if (formData.biography.trim().length < 10) {
          errors.push('Biografija mora imati najmanje 10 karaktera');
        }
        break;

      case 'organization':
        if (!formData.name || !formData.name.trim()) {
          errors.push('Naziv udruženja je obavezan');
        } else if (formData.name.trim().length < 2) {
          errors.push('Naziv mora imati najmanje 2 karaktera');
        }

        if (!formData.description || !formData.description.trim()) {
          errors.push('Opis je obavezan');
        } else if (formData.description.trim().length < 10) {
          errors.push('Opis mora imati najmanje 10 karaktera');
        }

        if (!formData.city || !formData.city.trim()) {
          errors.push('Mjesto je obavezno');
        } else if (formData.city.trim().length < 2) {
          errors.push('Mjesto mora imati najmanje 2 karaktera');
        }
        break;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setIsSubmitting(false);
        return;
      }

      let imagePath = formData.image; // Keep existing image if editing

      // Upload new image if selected
      if (formData.imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.imageFile);

        try {
          const uploadResponse = await uploadImage(formData.imageFile);
          if (uploadResponse.success) {
            imagePath = uploadResponse.path;
          } else {
            throw new Error('Upload failed: ' + (uploadResponse.error || 'Unknown error'));
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          setError('Greška pri upload-u slike: ' + (uploadError.response?.data?.error || uploadError.message));
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data for submission
      const submitData = { ...formData, image: imagePath };
      delete submitData.imageFile; // Remove file object

      // Determine API endpoint and method
      let endpoint, method;
      switch (type) {
        case 'lecture':
          endpoint = data ? `/predavanja/${data._id}` : '/predavanja';
          method = data ? 'put' : 'post';
          break;
        case 'daija':
          endpoint = data ? `/daije/${data._id}` : '/daije';
          method = data ? 'put' : 'post';
          // name field is already correct, no mapping needed
          break;
        case 'organization':
          endpoint = data ? `/udruzenja/${data._id}` : '/udruzenja';
          method = data ? 'put' : 'post';
          break;
      }

      const response = await axiosInstance[method](endpoint, submitData);
      
      setSuccess(true);
      onSuccess(response.data);
      
      // Reset form
      setFormData(getInitialFormData());
      setImagePreview(null);
      setEducationInput('');
      setUseCustomSpeaker(false);
      setUseCustomOrganization(false);
      
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || `Greška pri ${data ? 'ažuriranju' : 'dodavanju'} ${getTypeDisplayName()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeDisplayName = () => {
    switch (type) {
      case 'lecture': return 'predavanja';
      case 'daija': return 'daije';
      case 'organization': return 'udruženja';
      default: return 'stavke';
    }
  };

  const getDialogTitle = () => {
    const isEditing = !!data;
    switch (type) {
      case 'lecture': return isEditing ? 'Uredi predavanje' : 'Dodaj ders';
      case 'daija': return isEditing ? 'Uredi daiju' : 'Dodaj daiju';
      case 'organization': return isEditing ? 'Uredi udruženje' : 'Dodaj udruženje';
      default: return isEditing ? 'Uredi' : 'Dodaj';
    }
  };

  const renderLectureFields = () => (
    <>
      <TextField
        fullWidth
        label="Naslov predavanja"
        name="title"
        value={formData.title}
        onChange={handleChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Opis predavanja"
        name="description"
        value={formData.description}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={3}
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
        minDate={new Date()}
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

      <TextField
        fullWidth
        label="Adresa"
        name="address"
        value={formData.address}
        onChange={handleChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Mjesto"
        name="city"
        value={formData.city}
        onChange={handleChange}
        margin="normal"
        required
      />
    </>
  );

  const renderDaijaFields = () => (
    <>
      <TextField
        fullWidth
        label="Ime i prezime"
        name="name"
        value={formData.name}
        onChange={handleChange}
        margin="normal"
        required
      />

      <FormControl component="fieldset" margin="normal">
        <FormLabel component="legend">Titula</FormLabel>
        <RadioGroup
          row
          value={formData.title}
          onChange={handleRadioChange}
        >
          {titles.map((title) => (
            <FormControlLabel
              key={title.value}
              value={title.value}
              control={<Radio />}
              label={title.label}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <TextField
        fullWidth
        label="Biografija"
        name="biography"
        value={formData.biography}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={4}
        required
      />

      {/* Education Section */}
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Obrazovanje
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Dodaj obrazovanje"
          value={educationInput}
          onChange={(e) => setEducationInput(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddEducation}>
          Dodaj
        </Button>
      </Box>

      {/* Display added education */}
      {formData.education.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {formData.education.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #ddd',
                borderRadius: 1,
                px: 2,
                py: 1,
                mb: 1
              }}
            >
              <Typography>{item}</Typography>
              <Button
                size="small"
                color="error"
                onClick={() => handleRemoveEducation(index)}
              >
                Ukloni
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </>
  );

  const renderOrganizationFields = () => (
    <>
      <TextField
        fullWidth
        label="Naziv udruženja"
        name="name"
        value={formData.name}
        onChange={handleChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Opis udruženja"
        name="description"
        value={formData.description}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={4}
        required
      />

      <TextField
        fullWidth
        label="Adresa"
        name="address"
        value={formData.address}
        onChange={handleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Mjesto"
        name="city"
        value={formData.city}
        onChange={handleChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Facebook"
        name="facebook"
        value={formData.facebook}
        onChange={handleChange}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FacebookIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Instagram"
        name="instagram"
        value={formData.instagram}
        onChange={handleChange}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <InstagramIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Telegram"
        name="telegram"
        value={formData.telegram}
        onChange={handleChange}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <TelegramIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Viber"
        name="viber"
        value={formData.viber}
        onChange={handleChange}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon />
            </InputAdornment>
          ),
        }}
      />
    </>
  );

  const renderImageUpload = () => (
    <>
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Slika {getTypeDisplayName()}
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
        onClick={() => document.getElementById('image-upload').click()}
      >
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          Kliknite da odaberete sliku
        </Typography>
        <Typography variant="body2" color="text.secondary">
          JPG, PNG, GIF ili WebP (max 5MB)
        </Typography>
      </Box>

      {imagePreview && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Image
            src={imagePreview}
            alt="Preview"
            width={200}
            height={200}
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              objectFit: 'contain'
            }}
          />
        </Box>
      )}
    </>
  );

  const renderFormFields = () => {
    switch (type) {
      case 'lecture':
        return renderLectureFields();
      case 'daija':
        return renderDaijaFields();
      case 'organization':
        return renderOrganizationFields();
      default:
        return null;
    }
  };

  const isEditing = !!data;

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
          {getDialogTitle()}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Image Upload */}
              {renderImageUpload()}

              {/* Form Fields based on type */}
              {renderFormFields()}

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Otkaži
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Čuva...' : (isEditing ? 'Ažuriraj' : 'Dodaj')}
          </Button>
        </DialogActions>
      </Dialog>

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
          {isEditing ? `${getTypeDisplayName()} uspješno ažurirano` : `${getTypeDisplayName()} uspješno dodano`}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UnifiedForm;