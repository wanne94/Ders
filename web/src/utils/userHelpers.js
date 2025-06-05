// User form validation and helper functions

export const getInitialUserForm = () => ({
  username: '',
  email: '',
  password: '',
  role: 'user'
});

export const validateUserForm = (formData, isEditMode = false) => {
  const errors = [];

  // Validate username
  if (!formData.username?.trim()) {
    errors.push('Korisničko ime je obavezno');
  } else if (formData.username.trim().length < 2) {
    errors.push('Korisničko ime mora imati najmanje 2 karaktera');
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
    errors.push('Korisničko ime može sadržavati samo slova, brojeve i podvlaku');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email?.trim()) {
    errors.push('Email je obavezan');
  } else if (!emailRegex.test(formData.email)) {
    errors.push('Email format nije valjan');
  }

  // Validate password (only required for new users or if provided in edit mode)
  if (!isEditMode) {
    // New user - password is required
    if (!formData.password) {
      errors.push('Lozinka je obavezna');
    } else if (formData.password.length < 6) {
      errors.push('Lozinka mora imati najmanje 6 karaktera');
    }
  } else {
    // Edit mode - password is optional, but if provided must be valid
    if (formData.password && formData.password.length < 6) {
      errors.push('Lozinka mora imati najmanje 6 karaktera');
    }
  }

  // Validate role
  const validRoles = ['user', 'admin', 'super_admin'];
  if (!validRoles.includes(formData.role)) {
    errors.push('Nevaljan tip korisnika');
  }

  return errors;
};

export const formatUserData = (formData) => {
  return {
    username: formData.username.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    role: formData.role,
    isActive: formData.isActive
  };
};

export const getUserDisplayName = (user) => {
  if (!user) return 'Nepoznat korisnik';
  return user.username || user.email || 'Nepoznat korisnik';
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: 'Administrator',
    moderator: 'Moderator',
    user: 'Korisnik'
  };
  return roleNames[role] || 'Nepoznato';
}; 