import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Chip,
    Avatar,
    Divider,
    Card, CardMedia,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, IconButton,
    Tooltip,
    Stack,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Event as EventIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    CalendarToday as CalendarIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as WebsiteIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';

const DetailViewScreen = ({ 
  item, 
  type, 
  onBack, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject,
  isAdmin = false,
  canEdit = false,
  canDelete = false,
  showApprovalActions = false
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);

  if (!item) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Stavka nije pronađena
        </Typography>
        <Button 
          variant="contained" 
          onClick={onBack}
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Nazad
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'active': return 'success'; // Backward compatibility
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Odobreno';
      case 'active': return 'Odobreno'; // Backward compatibility
      case 'pending': return 'Na čekanju';
      case 'rejected': return 'Odbačeno';
      default: return 'Nepoznato';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'lecture': return 'Predavanje';
      case 'daija': return 'Daija';
      case 'organization': return 'Udruženje';
      case 'user': return 'Korisnik';
      default: return 'Stavka';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lecture': return <EventIcon />;
      case 'daija': return <PersonIcon />;
      case 'organization': return <BusinessIcon />;
      case 'user': return <PersonIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(item);
      setDeleteDialogOpen(false);
      onBack();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action) => {
    setLoading(true);
    try {
      if (action === 'approve') {
        await onApprove(item);
      } else {
        await onReject(item);
      }
      setApprovalDialogOpen(false);
      setApprovalAction(null);
      onBack();
    } catch (error) {
      console.error('Error updating approval status:', error);
    } finally {
      setLoading(false);
    }
  };

  const openApprovalDialog = (action) => {
    setApprovalAction(action);
    setApprovalDialogOpen(true);
  };

  const renderLectureDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        {item.image && (
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              height="200"
              image={item.image}
              alt={item.title}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        )}
      </Grid>
      <Grid item xs={12} md={8}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {item.title}
            </Typography>
            <Chip 
              label={getStatusLabel(item.status)} 
              color={getStatusColor(item.status)}
              sx={{ mb: 2 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="action" />
            <Typography variant="body1">
              <strong>Daija:</strong> {
                item.daija && typeof item.daija === 'object' 
                  ? `${item.daija.title || ''} ${item.daija.name || ''}`.trim() || 'N/A'
                  : item.speaker || 'N/A'
              }
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon color="action" />
            <Typography variant="body1">
              <strong>Udruženje:</strong> {item.organization || 'N/A'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon color="action" />
            <Typography variant="body1">
              <strong>Datum:</strong> {item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon color="action" />
            <Typography variant="body1">
              <strong>Vrijeme:</strong> {item.time || 'N/A'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="action" />
            <Typography variant="body1">
              <strong>Lokacija:</strong> {item.location || 'N/A'}
            </Typography>
          </Box>
        </Stack>
      </Grid>
      
      {item.description && (
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Opis
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {item.description}
          </Typography>
        </Grid>
      )}
    </Grid>
  );

  const renderDaijaDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            src={item.image}
            sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
          >
            {(() => {
              // Get initials from name
              if (item.name) {
                const names = item.name.split(' ');
                return names.length > 1 ? `${names[0][0]}${names[names.length-1][0]}` : item.name[0];
              }
              return 'D';
            })()}
          </Avatar>
          <Chip 
            label={getStatusLabel(item.status)} 
            color={getStatusColor(item.status)}
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={8}>
        <Stack spacing={2}>
          {item.name && (
            <Typography variant="h4" gutterBottom>
              {item.name}
            </Typography>
          )}
          
          {item.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon color="action" />
              <Typography variant="body1">
                <strong>Email:</strong> {item.email}
              </Typography>
            </Box>
          )}
          
          {item.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon color="action" />
              <Typography variant="body1">
                <strong>Telefon:</strong> {item.phone}
              </Typography>
            </Box>
          )}
          
          {item.website && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WebsiteIcon color="action" />
              <Typography variant="body1">
                <strong>Website:</strong> 
                <a href={item.website} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                  {item.website}
                </a>
              </Typography>
            </Box>
          )}
        </Stack>
      </Grid>
      
      {item.bio && (
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Biografija
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {item.bio}
          </Typography>
        </Grid>
      )}
    </Grid>
  );

  const renderOrganizationDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            src={item.logo}
            sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
          >
            {item.name?.[0]}
          </Avatar>
          <Chip 
            label={getStatusLabel(item.status)} 
            color={getStatusColor(item.status)}
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={8}>
        <Stack spacing={2}>
          <Typography variant="h4" gutterBottom>
            {item.name}
          </Typography>
          
          {item.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon color="action" />
              <Typography variant="body1">
                <strong>Email:</strong> {item.email}
              </Typography>
            </Box>
          )}
          
          {item.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon color="action" />
              <Typography variant="body1">
                <strong>Telefon:</strong> {item.phone}
              </Typography>
            </Box>
          )}
          
          {item.website && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WebsiteIcon color="action" />
              <Typography variant="body1">
                <strong>Website:</strong> 
                <a href={item.website} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                  {item.website}
                </a>
              </Typography>
            </Box>
          )}
          
          {item.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="action" />
              <Typography variant="body1">
                <strong>Adresa:</strong> {item.address}
              </Typography>
            </Box>
          )}
        </Stack>
      </Grid>
      
      {item.description && (
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Opis
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {item.description}
          </Typography>
        </Grid>
      )}
    </Grid>
  );

  const renderUserDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
          >
            {item.username?.[0] || item.email?.[0]}
          </Avatar>
        </Box>
      </Grid>
      <Grid item xs={12} md={8}>
        <Stack spacing={2}>
          <Typography variant="h4" gutterBottom>
            {item.username || item.email}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon color="action" />
            <Typography variant="body1">
              <strong>Email:</strong> {item.email}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="action" />
            <Typography variant="body1">
              <strong>Uloga:</strong> {item.role === 'admin' ? 'Administrator' : 'Korisnik'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon color="action" />
            <Typography variant="body1">
              <strong>Kreiran:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </Typography>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );

  const renderDetails = () => {
    switch (type) {
      case 'lecture':
        return renderLectureDetails();
      case 'daija':
        return renderDaijaDetails();
      case 'organization':
        return renderOrganizationDetails();
      case 'user':
        return renderUserDetails();
      default:
        return (
          <Typography variant="body1" color="text.secondary">
            Detalji nisu dostupni za ovaj tip stavke.
          </Typography>
        );
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onBack} size="large">
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getTypeIcon(type)}
            <Typography variant="h5">
              {getTypeLabel(type)} - Detalji
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Approval Actions */}
          {showApprovalActions && item.status === 'pending' && (
            <>
              <Tooltip title="Odobri">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => openApprovalDialog('approve')}
                  disabled={loading}
                >
                  Odobri
                </Button>
              </Tooltip>
              <Tooltip title="Odbaci">
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={() => openApprovalDialog('reject')}
                  disabled={loading}
                >
                  Odbaci
                </Button>
              </Tooltip>
            </>
          )}

          {/* Status Change Actions for Approved Items */}
          {isAdmin && item.status === 'approved' && type !== 'user' && (
            <Tooltip title="Odbaci">
              <Button
                variant="outlined"
                color="warning"
                startIcon={<CloseIcon />}
                onClick={() => openApprovalDialog('reject')}
                disabled={loading}
              >
                Odbaci
              </Button>
            </Tooltip>
          )}

          {/* Status Change Actions for Rejected Items */}
          {isAdmin && item.status === 'rejected' && type !== 'user' && (
            <Tooltip title="Aktiviraj">
              <Button
                variant="outlined"
                color="success"
                startIcon={<CheckIcon />}
                onClick={() => openApprovalDialog('approve')}
                disabled={loading}
              >
                Aktiviraj
              </Button>
            </Tooltip>
          )}
          
          {/* Edit Action */}
          {canEdit && (
            <Tooltip title="Uredi">
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onEdit(item)}
                disabled={loading}
              >
                Uredi
              </Button>
            </Tooltip>
          )}
          
          {/* Delete Action */}
          {canDelete && (
            <Tooltip title="Obriši">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                Obriši
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Paper sx={{ p: 3 }}>
        {renderDetails()}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Potvrda brisanja</DialogTitle>
        <DialogContent>
          <Typography>
            Da li ste sigurni da želite obrisati ovu stavku?
            Ova akcija se ne može poništiti.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Otkaži
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {loading ? 'Brisanje...' : 'Obriši'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Potvrda {approvalAction === 'approve' ? 'odobrenja' : 'odbacivanja'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Da li ste sigurni da želite {approvalAction === 'approve' ? 'odobriti' : 'odbaciti'} ovu stavku?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setApprovalDialogOpen(false)} 
            disabled={loading}
          >
            Otkaži
          </Button>
          <Button
            onClick={() => handleApproval(approvalAction)}
            color={approvalAction === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : 
              (approvalAction === 'approve' ? <CheckIcon /> : <CloseIcon />)}
          >
            {loading ? 
              (approvalAction === 'approve' ? 'Odobravanje...' : 'Odbacivanje...') : 
              (approvalAction === 'approve' ? 'Odobri' : 'Odbaci')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetailViewScreen; 