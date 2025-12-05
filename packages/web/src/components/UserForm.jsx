import React, { useState, useEffect } from 'react';
import { validateUserForm, sanitizeUserData, isUserFormValid } from '@ders-ba/shared';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Snackbar,
  MenuItem,
  Typography
} from '@mui/material';
import axiosInstance from '@/utils/axiosConfig';

const UserForm = ({ open, onClose, onSuccess, user, currentUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    firstName: '',
    phone: ''
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // Ne prikazujemo postojeću lozinku
        role: user.role || 'user',
        firstName: user.firstName || '',
        phone: user.phone || ''
      });
    } else {
      // Reset form when not editing
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        firstName: '',
        phone: ''
      });
    }
  }, [user, open]);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin';
  const canAssignRoles = isSuperAdmin || isAdmin;

  const handleClose = () => {
    // Resetuj formu i greške kad se zatvara dialog
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validacija forme using shared validation
    const isEditing = !!user;
    const validationErrors = validateUserForm(formData, { isNewUser: !isEditing });
    
    if (Object.keys(validationErrors).length > 0) {
      // Show first error
      const firstErrorField = Object.keys(validationErrors)[0];
      setError(validationErrors[firstErrorField]);
      return;
    }
    
    // Sanitize data
    const sanitizedData = sanitizeUserData(formData);

    try {
      let response;
      if (user) {
        // Update existing user
        const updateData = { ...sanitizedData };
        // Password is already removed in sanitization if empty
        // Ukloni role ako korisnik nije admin ili super_admin
        if (!canAssignRoles) {
          delete updateData.role;
        }
        response = await axiosInstance.put(`/users/${user._id}`, updateData);
      } else {
        // Create new user
        const createData = { ...sanitizedData };
        // Ukloni role ako korisnik nije admin ili super_admin
        if (!canAssignRoles) {
          delete createData.role;
        }
        response = await axiosInstance.post('/users', createData);
      }
      
      if (response) {
        // Resetuj formu
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'user',
          firstName: '',
          phone: ''
        });
        setError(null);
        
        // Pozovi callback funkciju s novim/osvježenim korisnikom
        onSuccess?.(response.data || response);
        
        // Prikaži success poruku
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.message || error.message || "Greška pri " + (user ? 'ažuriranju' : 'dodavanju') + " korisnika");
    }
  };

  const isEditing = !!user;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { cursor: 'default' }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', cursor: 'default' }}>
          {isEditing ? 'Uredi korisnika' : 'Dodaj korisnika'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Korisničko ime"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={isEditing ? "Nova šifra (ostavite prazno da ne mijenjate)" : "Šifra"}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required={!isEditing}
              helperText={isEditing ? "Ostavite prazno ako ne želite mijenjati lozinku" : "Šifra mora imati najmanje 6 karaktera"}
            />

            {/* Personal Information */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
              Lične informacije
            </Typography>
            <TextField
              fullWidth
              label="Ime"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />

            {canAssignRoles && (
              <TextField
                fullWidth
                select
                label="Uloga"
                name="role"
                value={formData.role}
                onChange={handleChange}
                margin="normal"
                required
              >
                <MenuItem value="user">Korisnik</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
                {isSuperAdmin && <MenuItem value="admin">Admin</MenuItem>}
                {isSuperAdmin && <MenuItem value="super_admin">Super Admin</MenuItem>}
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '10px' }}>
          <Button 
            onClick={handleClose}
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
          {isEditing ? 'Korisnik uspješno ažuriran' : 'Korisnik uspješno dodat'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserForm; 