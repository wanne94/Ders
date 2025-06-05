import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axiosConfig';

const SuggestionForm = ({ open, onClose, onSuccess }) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [referenceType, setReferenceType] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple ObjectId validation function
  const isValidObjectId = (id) => {
    return /^[a-f0-9]{24}$/i.test(id);
  };

  // Auto-detect type and reference ID from current URL
  useEffect(() => {
    const currentPath = window.location.href;
    const currentPathname = window.location.pathname;
    const queryParams = new URLSearchParams(window.location.search);

    let detectedType = null;
    let detectedId = null;

    // Check for daija in query params first
    if (queryParams.has('daija')) {
      const daijaParam = queryParams.get('daija');
      
      if (isValidObjectId(daijaParam)) {
        detectedId = daijaParam;
      } else {
        // Try to resolve slug to ObjectId
        const potentialId = daijaParam;
        
        const fetchDaijaBySlug = async () => {
          try {
            const response = await axiosInstance.get(`/daije/slug/${potentialId}`);
            if (response.data && response.data._id) {
              detectedId = response.data._id;
            } else {
              detectedId = potentialId;
            }
          } catch (error) {
            console.error('Error fetching daija for slug:', error);
            detectedId = potentialId;
          }
        };
        
        fetchDaijaBySlug();
      }
      detectedType = 'daija';
    }
    // Check for daija in URL path
    else if (currentPathname.includes('/profile/daija/')) {
      const pathParts = currentPathname.split('/');
      const daijaIndex = pathParts.indexOf('daija');
      if (daijaIndex !== -1 && pathParts[daijaIndex + 1]) {
        detectedId = pathParts[daijaIndex + 1];
        
        // If it's a slug, fetch the daija to get the ID
        const fetchDaijaBySlug = async () => {
          try {
            const response = await axiosInstance.get('/daije');
            const allDaije = Array.isArray(response.data) ? response.data : [];
            const foundDaija = allDaije.find(daija => {
              const slug = daija.firstName
                ?.toLowerCase()
                .replace(/[čć]/g, 'c')
                .replace(/[đ]/g, 'd')
                .replace(/[š]/g, 's')
                .replace(/[ž]/g, 'z')
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              return slug === detectedId;
            });
            if (foundDaija) {
              setReferenceId(foundDaija._id);
            }
          } catch (error) {
            console.error('Error fetching daija by slug:', error);
          }
        };
        
        fetchDaijaBySlug();
      }
      detectedType = 'daija';
    }
    // Check for organization in query params
    else if (queryParams.has('organization')) {
      detectedId = queryParams.get('organization');
      detectedType = 'organization';
    }
    // Check for organization in URL path
    else if (currentPathname.includes('/profile/organization/')) {
      const pathParts = currentPathname.split('/');
      const orgIndex = pathParts.indexOf('organization');
      if (orgIndex !== -1 && pathParts[orgIndex + 1]) {
        detectedId = pathParts[orgIndex + 1];
        detectedType = 'organization';
      }
    }

    if (detectedType && detectedId) {
      setReferenceType(detectedType);
      setReferenceId(detectedId);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setTitle(value);
    } else if (name === 'description') {
      setDescription(value);
    } else if (name === 'referenceType') {
      setReferenceType(value);
    } else if (name === 'referenceId') {
      setReferenceId(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!title.trim() || !description.trim()) {
        alert('Molimo unesite naslov i opis prijedloga');
        return;
      }

      // Prepare the payload
      let finalReferenceId = referenceId;
      
      // Validate ObjectId if provided
      if (finalReferenceId && !isValidObjectId(finalReferenceId)) {
        console.warn('⚠️ Invalid ObjectId detected:', finalReferenceId);
        console.warn('⚠️ Setting referenceId to null for general suggestion');
        finalReferenceId = null;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        referenceType: finalReferenceId ? referenceType : null,
        referenceId: finalReferenceId,
        status: 'pending'
      };

      const response = await axiosInstance.post('/suggestions', payload);

      // Reset form
      setTitle('');
      setDescription('');
      setReferenceType('');
      setReferenceId('');
      
      // Close modal if it's in a modal
      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('❌ Error submitting suggestion:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || 'Greška pri slanju prijedloga';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setReferenceType('');
    setReferenceId('');
    onClose();
  };

  const typeOptions = [
    { value: 'daija', label: 'Daija' },
    { value: 'udruženje', label: 'Udruženje' },
    { value: 'stranica', label: 'Stranica' },
    { value: 'općenito', label: 'Općeniti prijedlog' }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="div">
            Imaš prijedlog ili izmjenu?
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Tip */}
            <TextField
              select
              label="Čega se prijedlog ili izmjena tiče"
              name="referenceType"
              value={referenceType}
              onChange={handleChange}
              required
              fullWidth
            >
              {typeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Reference ID - hidden for general suggestions */}
            {referenceType !== 'općenito' && referenceId && (
              <TextField
                label="ID reference"
                name="referenceId"
                value={referenceId}
                onChange={handleChange}
                fullWidth
                disabled
                size="small"
                sx={{ 
                  '& .MuiInputBase-input': { 
                    fontSize: '0.875rem',
                    color: 'text.secondary'
                  }
                }}
              />
            )}

            {/* Suggestion text */}
            <TextField
              label="Vaš prijedlog / izmjena"
              name="description"
              value={description}
              onChange={handleChange}
              multiline
              rows={4}
              required
              fullWidth
              placeholder="Opišite vašu izmjenu ili prijedlog..."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Otkaži
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isSubmitting || !description.trim()}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Šalje se...' : 'Pošalji'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SuggestionForm; 