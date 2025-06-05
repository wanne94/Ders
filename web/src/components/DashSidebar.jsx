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
  Chip
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

const drawerWidth = 280;

const DashSidebar = ({ 
  activeSection, 
  onSectionChange, 
  pendingCount = 0, 
  pendingSuggestionsCount = 0,
  approvalToggles, 
  setApprovalToggles,
  userRole
}) => {
  const router = useRouter();

  const mainMenuItems = [
    { id: 'predavanja', text: 'Dersovi', icon: <EventIcon />, description: 'Upravljanje predavanjima' },
    { id: 'organizations', text: 'Udruženja', icon: <BusinessIcon />, description: 'Upravljanje udruženjima' },
    { id: 'daije', text: 'Daije', icon: <PersonIcon />, description: 'Upravljanje daijama' },
    { id: 'korisnici', text: 'Korisnici', icon: <PeopleIcon />, description: 'Upravljanje korisnicima' }
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
          {mainMenuItems.map((item) => (
            <ListItem disablePadding key={item.id} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => !item.disabled && onSectionChange(item.id)}
                selected={activeSection === item.id}
                disabled={item.disabled}
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
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontWeight: activeSection === item.id ? 'bold' : 'medium',
                    fontSize: '0.875rem'
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: activeSection === item.id ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ mx: 2 }} />

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
          {approvalMenuItems.map((item) => (
            <ListItem disablePadding key={item.id} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => !item.disabled && onSectionChange(item.id)}
                selected={activeSection === item.id}
                disabled={item.disabled}
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
                  secondary={item.description}
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

      <Divider sx={{ mx: 2 }} />

      {/* Settings */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onSectionChange('postavke')}
              selected={activeSection === 'postavke'}
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
