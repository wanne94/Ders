import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Badge,
  Divider,
  Switch,
  Typography,
  Avatar,
  Chip,
  Collapse,
  IconButton,
  useMediaQuery,
  useTheme,
  TextField,
  Button,
  Stack
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/router';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import SuggestionsIcon from '@mui/icons-material/Lightbulb';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SaveIcon from '@mui/icons-material/Save';

const drawerWidth = 280;

const DashSidebar = ({ 
  activeSection, 
  onSectionChange, 
  pendingCount = 0, 
  pendingSuggestionsCount = 0,
  approvalToggles, 
  setApprovalToggles,
  userRole,
  onQuickAdd
}) => {
  const router = useRouter();
  const [isChangingSection, setIsChangingSection] = React.useState(false);
  const [expandedSection, setExpandedSection] = React.useState(null);
  const [quickAddData, setQuickAddData] = React.useState({
    predavanja: { title: '', speaker: '', date: '' },
    organizations: { name: '', description: '' },
    daije: { name: '', title: '' }
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const mainMenuItems = [
    { 
      id: 'predavanja', 
      text: 'Dersovi', 
      icon: <EventIcon />, 
      description: 'Upravljanje predavanjima',
      subItems: isMobile ? [
        { id: 'predavanja-list', text: 'Lista dersova', icon: <ListAltIcon /> },
        { id: 'predavanja-add', text: '+ Dodaj', icon: <AddCircleOutlineIcon />, isForm: true }
      ] : null
    },
    { 
      id: 'organizations', 
      text: 'Udruženja', 
      icon: <BusinessIcon />, 
      description: 'Upravljanje udruženjima',
      subItems: isMobile ? [
        { id: 'organizations-list', text: 'Lista udruženja', icon: <ListAltIcon /> },
        { id: 'organizations-add', text: '+ Dodaj', icon: <AddCircleOutlineIcon />, isForm: true }
      ] : null
    },
    { 
      id: 'daije', 
      text: 'Daije', 
      icon: <PersonIcon />, 
      description: 'Upravljanje daijama',
      subItems: isMobile ? [
        { id: 'daije-list', text: 'Lista daija', icon: <ListAltIcon /> },
        { id: 'daije-add', text: '+ Dodaj', icon: <AddCircleOutlineIcon />, isForm: true }
      ] : null
    },
    { 
      id: 'korisnici', 
      text: 'Korisnici', 
      icon: <PeopleIcon />, 
      description: 'Upravljanje korisnicima' 
    }
  ];

  const approvalMenuItems = [
    {
      id: 'za-odobrenje',
      text: 'Za odobrenje',
      icon: <PendingActionsIcon />,
      description: 'Sadržaj na čekanju',
      count: pendingCount,
      color: 'warning'
    },
    {
      id: 'prijave-otkazivanje',
      text: 'Prijave za otkazivanje',
      icon: <CancelIcon />,
      description: 'Prijave otkazivanja predavanja',
      color: 'warning'
    },
    // Samo super admin može da vidi odbijene stavke
    ...(userRole === 'super_admin' ? [{
      id: 'odbijeno',
      text: 'Odbijeno',
      icon: <CancelIcon />,
      description: 'Odbijeni sadržaj',
      color: 'error'
    }] : []),
    {
      id: 'prijedlozi',
      text: 'Prijedlozi',
      icon: <SuggestionsIcon />,
      description: 'Korisničke sugestije',
      count: pendingSuggestionsCount,
      color: 'info'
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100% - 64px)',
          backgroundColor: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          cursor: 'default'
        },
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #e2e8f0',
        bgcolor: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DashboardIcon sx={{ 
            color: 'primary.main',
            width: 40,
            height: 40
          }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Upravljanje platformom
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Menu */}
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" sx={{ 
          px: 2, 
          py: 1, 
          color: 'text.secondary',
          fontWeight: 'bold',
          fontSize: '0.75rem'
        }}>
          GLAVNI MENI
        </Typography>
        <List sx={{ pt: 1 }}>
          {mainMenuItems?.filter(item => item).map((item) => (
            <Box key={item.id}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (item.subItems && isMobile) {
                      setExpandedSection(expandedSection === item.id ? null : item.id);
                    } else if (!item.disabled && !isChangingSection && onSectionChange) {
                      setIsChangingSection(true);
                      onSectionChange(item.id);
                      setTimeout(() => setIsChangingSection(false), 500);
                    }
                  }}
                  selected={activeSection === item.id && !item.subItems}
                  disabled={item.disabled || isChangingSection}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    bgcolor: item.subItems && isMobile && expandedSection === item.id ? 'rgba(0, 123, 255, 0.08)' : 'transparent',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      }
                    },
                    '&:hover': {
                      bgcolor: activeSection === item.id ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: activeSection === item.id ? 'white' : expandedSection === item.id ? 'primary.main' : 'text.secondary',
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    secondary={!isMobile ? (item?.description || '') : null}
                    primaryTypographyProps={{
                      fontWeight: activeSection === item.id ? 'bold' : 'medium',
                      fontSize: '0.875rem'
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: activeSection === item.id ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                    }}
                  />
                  {item.subItems && isMobile && (
                    <IconButton size="small" sx={{ color: expandedSection === item.id ? 'primary.main' : 'text.secondary' }}>
                      {expandedSection === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                </ListItemButton>
              </ListItem>
              {item.subItems && isMobile && (
                <Collapse in={expandedSection === item.id} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.id} disablePadding sx={{ pl: 2, flexDirection: 'column', alignItems: 'stretch' }}>
                        {subItem.isForm ? (
                          <Box sx={{ p: 2 }}>
                            {/* Predavanja Form */}
                            {item.id === 'predavanja' && subItem.isForm && (
                              <Stack spacing={1.5}>
                                <TextField
                                  size="small"
                                  label="Naziv dersa"
                                  fullWidth
                                  value={quickAddData.predavanja.title}
                                  onChange={(e) => setQuickAddData(prev => ({
                                    ...prev,
                                    predavanja: { ...prev.predavanja, title: e.target.value }
                                  }))}
                                  sx={{ bgcolor: 'white' }}
                                />
                                <TextField
                                  size="small"
                                  label="Predavač"
                                  fullWidth
                                  value={quickAddData.predavanja.speaker}
                                  onChange={(e) => setQuickAddData(prev => ({
                                    ...prev,
                                    predavanja: { ...prev.predavanja, speaker: e.target.value }
                                  }))}
                                  sx={{ bgcolor: 'white' }}
                                />
                                <TextField
                                  size="small"
                                  type="datetime-local"
                                  label="Datum i vrijeme"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  value={quickAddData.predavanja.date}
                                  onChange={(e) => setQuickAddData(prev => ({
                                    ...prev,
                                    predavanja: { ...prev.predavanja, date: e.target.value }
                                  }))}
                                  sx={{ bgcolor: 'white' }}
                                />
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<SaveIcon />}
                                  onClick={() => onQuickAdd && onQuickAdd('predavanja', quickAddData.predavanja)}
                                  fullWidth
                                >
                                  Sačuvaj
                                </Button>
                              </Stack>
                            )}
                            
                            {/* Organizations Form */}
                            {item.id === 'organizations' && subItem.isForm && (
                              <Stack spacing={1.5}>
                                <TextField
                                  size="small"
                                  label="Naziv udruženja"
                                  fullWidth
                                  value={quickAddData.organizations.name}
                                  onChange={(e) => setQuickAddData(prev => ({
                                    ...prev,
                                    organizations: { ...prev.organizations, name: e.target.value }
                                  }))}
                                  sx={{ bgcolor: 'white' }}
                                />
                                <TextField
                                  size="small"
                                  label="Opis"
                                  fullWidth
                                  multiline
                                  rows={2}
                                  value={quickAddData.organizations.description}
                                  onChange={(e) => setQuickAddData(prev => ({
                                    ...prev,
                                    organizations: { ...prev.organizations, description: e.target.value }
                                  }))}
                                  sx={{ bgcolor: 'white' }}
                                />
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<SaveIcon />}
                                  onClick={() => onQuickAdd && onQuickAdd('organizations', quickAddData.organizations)}
                                  fullWidth
                                >
                                  Sačuvaj
                                </Button>
                              </Stack>
                            )}
                            
                            {/* Daije Form */}
                            {item.id === 'daije' && subItem.isForm && (
                              <Stack spacing={1.5}>
                                <TextField
                                  size="small"
                                  label="Ime i prezime"
                                  fullWidth
                                  value={quickAddData.daije.name}
                                  onChange={(e) => setQuickAddData(prev => ({
                                    ...prev,
                                    daije: { ...prev.daije, name: e.target.value }
                                  }))}
                                  sx={{ bgcolor: 'white' }}
                                />
                                <TextField
                                  size="small"
                                  label="Titula"
                                  fullWidth
                                  value={quickAddData.daije.title}
                                  onChange={(e) => setQuickAddData(prev => ({
                                    ...prev,
                                    daije: { ...prev.daije, title: e.target.value }
                                  }))}
                                  sx={{ bgcolor: 'white' }}
                                />
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<SaveIcon />}
                                  onClick={() => onQuickAdd && onQuickAdd('daije', quickAddData.daije)}
                                  fullWidth
                                >
                                  Sačuvaj
                                </Button>
                              </Stack>
                            )}
                          </Box>
                        ) : (
                          <ListItemButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!isChangingSection && onSectionChange) {
                                setIsChangingSection(true);
                                const mainSection = item.id;
                                const action = subItem.id.includes('add') ? 'add' : 'list';
                                onSectionChange(mainSection, action);
                                setTimeout(() => setIsChangingSection(false), 500);
                              }
                            }}
                            sx={{
                              borderRadius: 2,
                              mx: 1,
                              mb: 0.5,
                              bgcolor: 'rgba(33, 150, 243, 0.08)',
                              border: '1px solid',
                              borderColor: 'rgba(33, 150, 243, 0.3)',
                              '&:hover': {
                                bgcolor: 'rgba(33, 150, 243, 0.15)',
                              }
                            }}
                          >
                            <ListItemIcon sx={{ 
                              minWidth: 36,
                              color: 'info.main'
                            }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text}
                              primaryTypographyProps={{
                                fontSize: '0.825rem',
                                fontWeight: 'medium'
                              }}
                            />
                          </ListItemButton>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Box>

      <Divider sx={{ 
        mx: 2,
        my: isMobile ? 2 : 1,
        borderColor: isMobile ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.12)',
        borderWidth: isMobile ? 2 : 1
      }} />

      {/* Approval Menu */}
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" sx={{ 
          px: 2, 
          py: 1, 
          color: 'text.secondary',
          fontWeight: 'bold',
          fontSize: '0.75rem'
        }}>
          ODOBRAVANJE
        </Typography>
        <List sx={{ pt: 1 }}>
          {approvalMenuItems?.filter(item => item).map((item) => (
            <ListItem disablePadding key={item.id} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!item.disabled && !isChangingSection && onSectionChange) {
                    setIsChangingSection(true);
                    onSectionChange(item.id);
                    setTimeout(() => setIsChangingSection(false), 500);
                  }
                }}
                selected={activeSection === item.id}
                disabled={item.disabled || isChangingSection}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    }
                  },
                  '&:hover': {
                    bgcolor: activeSection === item.id ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: activeSection === item.id ? 'white' : 'text.secondary',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  secondary={item?.description || ''}
                  primaryTypographyProps={{
                    fontWeight: activeSection === item.id ? 'bold' : 'medium',
                    fontSize: '0.875rem'
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: activeSection === item.id ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                  }}
                />
                {item.count > 0 && (
                  <Chip
                    label={item.count}
                    size="small"
                    color={activeSection === item.id ? 'default' : item.color}
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      bgcolor: activeSection === item.id ? 'rgba(255,255,255,0.2)' : undefined,
                      color: activeSection === item.id ? 'white' : undefined
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ 
        mx: 2,
        my: isMobile ? 2 : 1,
        borderColor: isMobile ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.12)',
        borderWidth: isMobile ? 2 : 1
      }} />

      {/* Settings */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isChangingSection && onSectionChange) {
                  setIsChangingSection(true);
                  onSectionChange('postavke');
                  setTimeout(() => setIsChangingSection(false), 500);
                }
              }}
              selected={activeSection === 'postavke'}
              disabled={isChangingSection}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  }
                },
                '&:hover': {
                  bgcolor: activeSection === 'postavke' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: activeSection === 'postavke' ? 'white' : 'text.secondary',
                minWidth: 40
              }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Postavke"
                secondary="Konfiguracija sistema"
                primaryTypographyProps={{
                  fontWeight: activeSection === 'postavke' ? 'bold' : 'medium',
                  fontSize: '0.875rem'
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: activeSection === 'postavke' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default DashSidebar; 
