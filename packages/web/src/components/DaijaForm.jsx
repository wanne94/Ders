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
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axiosInstance from '../utils/axiosConfig';
import { getDefaultDaijaImage, getImageUrl } from '../utils/imageUtils';
import { uploadImage } from '../utils/uploadService';

const DaijaForm = ({ open, onClose, onSuccess, approvalEnabled = true, daija }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: 'prof',
    biography: '',
    image: '',
    status: approvalEnabled ? 'approved' : 'pending',
    education: []
  });

  const [educationInput, setEducationInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const titles = [
    { value: 'prof', label: 'Prof.' },
    { value: 'mr', label: 'Mr.' },
    { value: 'dr', label: 'Dr.' }
  ];

  // Populate form data when editing
  useEffect(() => {
    if (daija) {
      setFormData({
        name: daija.name || '',
        title: daija.title || 'prof',
        biography: daija.biography || '',
        image: daija.image || '',
        status: daija.status || 'pending',
        education: daija.education || []
      });

      // Set image preview if editing - use getImageUrl to get proper server URL
      if (daija.image && daija.image.trim() !== '') {
        setImagePreview(getImageUrl(daija.image));
      }
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        title: 'prof',
        biography: '',
        image: '',
        status: approvalEnabled ? 'approved' : 'pending',
        education: []
      });
      setImagePreview(null);
      setEducationInput('');
    }
  }, [daija, open, approvalEnabled]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, title: value }));
  };

  const handleAddEducation = () => {
    if (educationInput.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, educationInput.trim()]
      }));
      setEducationInput('');
    }
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
    setError(null);

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
        
        try {
          const uploadResponse = await uploadImage(formData.imageFile);

          console.log('✅ Upload response:', uploadResponse);
          if (uploadResponse.success) {
            imagePath = uploadResponse.path;
            console.log('🖼️ Image uploaded successfully:', imagePath);
            console.log('🔄 UPLOAD SUCCESS - New image path:', imagePath);
          } else {
            throw new Error('Upload failed: ' + (uploadResponse.error || 'Unknown error'));
          }
        } catch (uploadError) {
          console.error('❌ Upload error details:', {
            message: uploadError.message,
            status: uploadError.response?.status,
            statusText: uploadError.response?.statusText,
            data: uploadError.response?.data
          });
          throw new Error('Upload failed: ' + (uploadError.response?.data?.message || uploadError.message));
        }
      } else {
        console.log('📷 NO UPLOAD - No image file selected, using existing path:', imagePath);
      }

      // If no image is provided, use default image
      const finalFormData = {
        name: formData.name,
        title: formData.title,
        biography: formData.biography,
        status: formData.status,
        education: formData.education,
        image: imagePath || getDefaultDaijaImage()
      };

      // Remove imageFile from the data sent to server
      delete finalFormData.imageFile;

      let response;
      if (daija) {
        response = await axiosInstance.put(`/daije/${daija._id}`, finalFormData);
      } else {
        response = await axiosInstance.post('/daije', {
          ...finalFormData,
          status: approvalEnabled ? 'approved' : 'pending'
        });
      }
      
      setSuccess(true);
      onSuccess(response.data);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Greška pri " + (daija ? 'ažuriranju' : 'dodavanju') + " daije");
    }
  };

  const isEditing = !!daija;

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
          {isEditing ? 'Uredi daiju' : 'Dodaj daiju'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Slika */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Slika daije
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

            {/* Puno ime */}
            <TextField
              fullWidth
              label="Ime i prezime"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />

            {/* Titula */}
            <FormControl component="fieldset" margin="normal" fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary' }}>
                Titula
              </FormLabel>
              <RadioGroup
                name="title"
                value={formData.title}
                onChange={handleRadioChange}
                row
                sx={{ 
                  gap: 3,
                  justifyContent: 'flex-start',
                  ml: 1
                }}
              >
                {titles.map((title) => (
                  <FormControlLabel 
                    key={title.value} 
                    value={title.value} 
                    control={<Radio color="primary" />} 
                    label={title.label}
                    sx={{ 
                      mr: 3,
                      '& .MuiFormControlLabel-label': {
                        fontSize: '1rem'
                      }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            
            {/* Biografija */}
            <TextField
              fullWidth
              label="Biografija"
              name="biography"
              value={formData.biography}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              placeholder="Unesite biografiju daije"
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* Obrazovanje */}
            <Typography variant="h6" sx={{ mt: 3 }}>
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

            {/* Prikaz unesenih obrazovanja */}
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
                    <Typography variant="body2">{item}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => {
                          setEducationInput(item);
                          setFormData(prev => ({
                            ...prev,
                            education: prev.education.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        Uredi
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            education: prev.education.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        Obriši
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
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
          {isEditing ? 'Daija uspješno osvježen' : 'Daija uspješno dodan'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DaijaForm; 
