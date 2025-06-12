import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Navigation from '@/components/Navigation';
import { usersService } from '@/services';
import DataTable from '@/components/DataTable';
import UserForm from '@/components/UserForm';
// import { UserForm } from '@shared/dashboard';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await usersService.getAllUsers();
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Došlo je do greške pri dohvaćanju korisnika');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleFormSuccess = () => {
    fetchUsers();
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={fetchUsers} sx={{ mt: 2 }}>
          Pokušaj ponovo
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, width: '100%', mt: '5px' }}>
        <Container maxWidth={false} sx={{ py: 4, width: '100%' }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Korisnici
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upravljajte korisnicima sistema
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddUser}
              startIcon={<AddIcon />}
              sx={{ height: 'fit-content' }}
            >
              Dodaj
            </Button>
          </Box>

          <DataTable
            data={users}
            type="users"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Container>
      </Box>

      <UserForm
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleFormSuccess}
        user={selectedUser}
        showPassword={!selectedUser} // Show password field only for new users
      />
    </Box>
  );
};

export default Users; 