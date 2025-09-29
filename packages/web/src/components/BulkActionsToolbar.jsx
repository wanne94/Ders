import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const BulkActionsToolbar = ({ 
  selectedCount, 
  onApprove, 
  onReject, 
  onDelete, 
  onClear,
  loading = false,
  type = 'items' 
}) => {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: '',
    message: ''
  });

  const handleAction = (action) => {
    let title = '';
    let message = '';
    
    switch(action) {
      case 'approve':
        title = 'Odobri sve selektovane';
        message = `Da li ste sigurni da želite odobriti ${selectedCount} ${getItemName(selectedCount)}?`;
        break;
      case 'reject':
        title = 'Odbaci sve selektovane';
        message = `Da li ste sigurni da želite odbaciti ${selectedCount} ${getItemName(selectedCount)}?`;
        break;
      case 'delete':
        title = 'Obriši sve selektovane';
        message = `Da li ste sigurni da želite obrisati ${selectedCount} ${getItemName(selectedCount)}? Ova akcija se ne može poništiti.`;
        break;
      default:
        return;
    }
    
    setConfirmDialog({
      open: true,
      action,
      title,
      message
    });
  };

  const handleConfirm = () => {
    const { action } = confirmDialog;
    
    switch(action) {
      case 'approve':
        onApprove && onApprove();
        break;
      case 'reject':
        onReject && onReject();
        break;
      case 'delete':
        onDelete && onDelete();
        break;
    }
    
    setConfirmDialog({ open: false, action: null, title: '', message: '' });
  };

  const handleCancel = () => {
    setConfirmDialog({ open: false, action: null, title: '', message: '' });
  };

  const getItemName = (count) => {
    if (type === 'lectures') {
      return count === 1 ? 'predavanje' : count < 5 ? 'predavanja' : 'predavanja';
    } else if (type === 'daije') {
      return count === 1 ? 'daiju' : count < 5 ? 'daije' : 'daija';
    } else if (type === 'organizations') {
      return count === 1 ? 'udruženje' : count < 5 ? 'udruženja' : 'udruženja';
    }
    return count === 1 ? 'stavku' : count < 5 ? 'stavke' : 'stavki';
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: 'sticky',
          top: 70,
          zIndex: 10,
          p: 2,
          mb: 3,
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1" fontWeight="bold">
            {selectedCount} {getItemName(selectedCount)} selektovano
          </Typography>
          
          <Tooltip title="Očisti selekciju">
            <IconButton 
              size="small" 
              onClick={onClear}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ApproveIcon />}
            onClick={() => handleAction('approve')}
            disabled={loading}
            sx={{ 
              backgroundColor: 'success.main',
              '&:hover': { backgroundColor: 'success.dark' }
            }}
          >
            Odobri sve
          </Button>
          
          <Button
            variant="contained"
            color="warning"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RejectIcon />}
            onClick={() => handleAction('reject')}
            disabled={loading}
            sx={{ 
              backgroundColor: 'warning.main',
              '&:hover': { backgroundColor: 'warning.dark' }
            }}
          >
            Odbaci sve
          </Button>
          
          <Button
            variant="contained"
            color="error"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            onClick={() => handleAction('delete')}
            disabled={loading}
            sx={{ 
              backgroundColor: 'error.main',
              '&:hover': { backgroundColor: 'error.dark' }
            }}
          >
            Obriši sve
          </Button>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Otkaži
          </Button>
          <Button 
            onClick={handleConfirm} 
            color={confirmDialog.action === 'delete' ? 'error' : 'primary'}
            variant="contained"
          >
            Potvrdi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkActionsToolbar;