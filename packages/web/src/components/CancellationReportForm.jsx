import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  ReportProblem as ReportIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const CancellationReportForm = ({
  open,
  onClose,
  lectureId,
  lectureTitle = '',
  onSubmitSuccess,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    howFound: '',
    additionalInfo: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Molimo unesite razlog otkazivanja';
    }

    if (!formData.howFound.trim()) {
      newErrors.howFound = 'Molimo unesite kako ste saznali da je otkazano';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submitData = {
      reason: formData.reason.trim(),
      howFound: formData.howFound.trim(),
      additionalInfo: formData.additionalInfo.trim()
    };

    onSubmitSuccess(submitData);
  };

  const handleClose = () => {
    if (loading) return;
    
    // Reset form when closing
    setFormData({
      reason: '',
      howFound: '',
      additionalInfo: ''
    });
    setErrors({});
    onClose();
  };


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          '@media (max-width: 600px)': {
            margin: 1,
            width: 'calc(100% - 16px)',
            maxHeight: 'calc(100% - 16px)'
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ReportIcon color="warning" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Prijava otkazivanja predavanja
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Molimo unesite razlog otkazivanja
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          sx={{ ml: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {/* Lecture Info */}
        {lectureTitle && (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            backgroundColor: 'grey.50', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Predavanje koje prijavljujete:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {lectureTitle}
            </Typography>
          </Box>
        )}

        {/* Info Alert */}
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>Napomena:</strong> Vaša prijava će biti zabilježena. 
            Ako se skupe 3 prijave, predavanje će biti automatski označeno kao otkazano.
          </Typography>
        </Alert>

        {/* Reason Input */}
        <TextField
          fullWidth
          label="Razlog otkazivanja *"
          value={formData.reason}
          onChange={(e) => handleInputChange('reason', e.target.value)}
          error={!!errors.reason}
          helperText={errors.reason}
          multiline
          rows={2}
          sx={{ mb: 3 }}
          required
          placeholder="Unesite razlog zašto je predavanje otkazano..."
        />

        {/* How Found Input */}
        <TextField
          fullWidth
          label="Kako si saznao da je otkazano? *"
          value={formData.howFound}
          onChange={(e) => handleInputChange('howFound', e.target.value)}
          error={!!errors.howFound}
          helperText={errors.howFound}
          multiline
          rows={2}
          sx={{ mb: 3 }}
          required
          placeholder="Unesite kako ste saznali da je predavanje otkazano..."
        />

        {/* Additional Information */}
        <TextField
          fullWidth
          label="Dodatne informacije (opcionalno)"
          value={formData.additionalInfo}
          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 2 }}
          placeholder="Unesite bilo koje dodatne informacije koje smatrate relevantnima..."
        />

        {/* Selected Summary */}
        {(formData.reason || formData.howFound) && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'warning.50', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'warning.200'
          }}>
            <Typography variant="subtitle2" color="warning.800" gutterBottom>
              Sažetak prijave:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {formData.reason && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, minWidth: 60 }}>
                    Razlog:
                  </Typography>
                  <Chip 
                    label={formData.reason} 
                    color="warning" 
                    variant="outlined"
                    size="small"
                  />
                </Box>
              )}
              {formData.howFound && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, minWidth: 60 }}>
                    Izvor:
                  </Typography>
                  <Chip 
                    label={formData.howFound} 
                    color="info" 
                    variant="outlined"
                    size="small"
                  />
                </Box>
              )}
              {formData.additionalInfo && (
                <Typography variant="caption" color="text.secondary">
                  + dodatne informacije
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          Odustani
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={loading || !formData.reason.trim() || !formData.howFound.trim()}
          sx={{ 
            minWidth: 120,
            position: 'relative'
          }}
        >
          {loading && (
            <CircularProgress
              size={20}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginTop: '-10px',
                marginLeft: '-10px',
              }}
            />
          )}
          {loading ? 'Slanje...' : 'Pošalji prijavu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancellationReportForm;