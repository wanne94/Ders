import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const AuthPromptDialog = ({ 
  open, 
  onClose, 
  onGoToAuth,
  title = "Prijavite se da biste dodali sadržaj",
  message = "Da biste mogli dodati sadržaj, potrebno je da se prijavite."
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ako nemate nalog, jednostavno se registrujte.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          color="inherit"
        >
          Otkaži
        </Button>
        <Button 
          onClick={() => onGoToAuth('register')}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Registruj se
        </Button>
        <Button 
          onClick={() => onGoToAuth('login')}
          variant="contained"
        >
          Prijavi se
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthPromptDialog; 