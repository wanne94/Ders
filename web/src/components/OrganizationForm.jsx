import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField, Box,
    Alert,
    Snackbar,
    Typography,
    InputAdornment
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import PhoneIcon from '@mui/icons-material/Phone';
import axiosInstance from '@/utils/axiosConfig';
import { getImageUrl } from '../utils/imageUtils';

const OrganizationForm = ({ open, onClose, onSuccess, approvalEnabled = true, organization }) => {
  // Deduplikuj gradove za sigurnost - REMOVED
  // const uniqueCities = Array.from(new Set(bosniaCities)); // REMOVED
  const [formData, setFormData] = useState({
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
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        address: organization.address || '',
        city: organization.city || '',
        facebook: organization.facebook || '',
        instagram: organization.instagram || '',
        telegram: organization.telegram || '',
        viber: organization.viber || '',
        status: organization.status || 'pending',
        image: organization.image || '',
        imageFile: null
      });

      // Set image preview if editing - use getImageUrl to get proper server URL
      if (organization.image) {
        setImagePreview(getImageUrl(organization.image));
      }
    } else {
      // Reset form when not editing
      setFormData({
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
      });
      setImagePreview(null);
    }
  }, [organization, open]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imagePath = formData.image; // Keep existing image if editing
      
      console.log('🔍 SUBMIT DEBUG - Initial state:', {
        hasImageFile: !!formData.imageFile,
        currentImagePath: formData.image,
        imageFileName: formData.imageFile?.name,
        imageFileSize: formData.imageFile?.size
      });

      // Upload new image if selected
      if (formData.imageFile) {
        console.log('📤 UPLOAD STARTING - File detected, preparing upload...');
        const imageFormData = new FormData();
        imageFormData.append('image', formData.imageFile);

        console.log('🔄 Starting image upload...');
        console.log('📁 File details:', {
          name: formData.imageFile.name,
          size: formData.imageFile.size,
          type: formData.imageFile.type
        });
        console.log('🌐 Upload URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/upload`);
        
        try {
          const uploadResponse = await axiosInstance.post('/upload', imageFormData, {
            // Remove explicit Content-Type header - let axios set it automatically with boundary
          });

          console.log('✅ Upload response:', uploadResponse.data);
          if (uploadResponse.data.success) {
            imagePath = uploadResponse.data.path; // Koristimo path umjesto filename
            console.log('🖼️ Image uploaded successfully:', imagePath);
            console.log('🔄 UPLOAD SUCCESS - New image path:', imagePath);
          } else {
            throw new Error('Upload failed: ' + (uploadResponse.data.error || 'Unknown error'));
          }
        } catch (uploadError) {
          console.error('❌ Upload error details:', {
            message: uploadError.message,
            status: uploadError.response?.status,
            statusText: uploadError.response?.statusText,
            data: uploadError.response?.data,
            config: uploadError.config
          });
          throw new Error('Upload failed: ' + (uploadError.response?.data?.error || uploadError.message));
        }
      } else {
        console.log('📷 NO UPLOAD - No image file selected, using existing path:', imagePath);
      }

      // Prepare JSON data for organization
      const organizationData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        facebook: formData.facebook,
        instagram: formData.instagram,
        telegram: formData.telegram,
        viber: formData.viber,
        status: formData.status,
        image: imagePath
      };

      // Remove empty fields
      Object.keys(organizationData).forEach(key => {
        if (organizationData[key] === '' || organizationData[key] === null || organizationData[key] === undefined) {
          delete organizationData[key];
        }
      });

      console.log('📤 FINAL DATA - Sending organization data:', organizationData);
      console.log('🖼️ FINAL IMAGE PATH:', organizationData.image);

      let response;
      if (organization) {
        // Update existing organization
        response = await axiosInstance.put(`/organizations/${organization._id}`, organizationData);
      } else {
        // Create new organization
        response = await axiosInstance.post('/organizations', organizationData);
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving organization:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      // Show error through Snackbar
      const errorMessage = error.response?.data?.message || 'Greška pri spremanju organizacije';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!organization;

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
          {isEditing ? 'Uredi udruženje' : 'Dodaj udruženje'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Slika udruženja */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Slika udruženja
            </Typography>
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                mb: 2,
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              <label htmlFor="image-upload" style={{ display: 'block', cursor: 'pointer', width: '100%' }}>
                {imagePreview ? (
                  <Box sx={{ width: '100%', textAlign: 'center' }}>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Pregled"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: 1
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Kliknite za promjenu slike
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" sx={{ mb: 0.5 }}>
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
              rows={3}
              placeholder="Kratki opis udruženja, njegovih aktivnosti i ciljeva..."
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
                    <FacebookIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="https://facebook.com/..."
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
                    <InstagramIcon sx={{ color: '#E1306C' }} />
                  </InputAdornment>
                ),
              }}
              placeholder="https://instagram.com/..."
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
                    <TelegramIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="https://t.me/..."
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
                    <PhoneIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="viber://chat?number=..."
            />
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
            {isEditing ? 'Osvježi udruženje' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error"
          sx={{ cursor: 'default' }}
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
          {isEditing ? 'Udruženje uspješno ažurirano' : 'Udruženje uspješno dodano'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrganizationForm; 