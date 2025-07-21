import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AndroidIcon from '@mui/icons-material/Android';
import GetAppIcon from '@mui/icons-material/GetApp';

const AndroidAppModal = ({ open, onClose }) => {
  const handleDownloadClick = () => {
    window.open('https://play.google.com/store/apps/details?id=com.daije.mobile', '_blank');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          textAlign: 'center',
        }
      }}
    >
      <DialogTitle sx={{ position: 'relative', pb: 1 }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
          <AndroidIcon color="success" fontSize="large" />
          <Typography variant="h6" component="div" fontWeight="bold">
            DERS Android Aplikacija
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <DialogContentText sx={{ mb: 2, color: 'text.primary', fontSize: '1rem' }}>
          Preuzmite našu Android aplikaciju za bolje korisničko iskustvo!
        </DialogContentText>
        <DialogContentText sx={{ color: 'text.secondary' }}>
          • Brži pristup svim funkcijama
          • Optimizovana za mobilne uređaje
          • Push notifikacije
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Ne hvala
        </Button>
        <Button 
          onClick={handleDownloadClick}
          variant="contained"
          color="success"
          startIcon={<GetAppIcon />}
          sx={{ 
            minWidth: 140,
            backgroundColor: '#01875F',
            color: 'white',
            '&:hover': {
              backgroundColor: '#016B4A',
              color: 'white'
            }
          }}
        >
          Preuzmi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AndroidAppModal;