import { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Button,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    Typography,
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Slide,
    Menu,
    MenuItem
} from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LogoCircle from './LogoCircle.jsx';
import LectureForm from './LectureForm.jsx';
import DaijaForm from './DaijaForm.jsx';
import OrganizationForm from './OrganizationForm.jsx';
import SuggestionForm from './SuggestionForm.jsx';
import { menuItems, adminMenuItems } from '@/config/menuItems';
import { clearAllData, getToken, getUserData } from '@/utils/authHelpers';

const Navigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isDaijaModalOpen, setIsDaijaModalOpen] = useState(false);
  const [isOrganizationModalOpen, setIsOrganizationModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [suggestionFormOpen, setSuggestionFormOpen] = useState(false);
  const [showNavigation, setShowNavigation] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [mobileAddMenuOpen, setMobileAddMenuOpen] = useState(false);

  // Scroll handler za skrivanje/prikazivanje navigacije
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Prikaži navigaciju ako je na vrhu stranice
      if (currentScrollY < 10) {
        setShowNavigation(true);
      }
      // Skrij navigaciju ako skroluje dole
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavigation(false);
      }
      // Prikaži navigaciju ako skroluje gore
      else if (currentScrollY < lastScrollY) {
        setShowNavigation(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Add logging for menu items
  useEffect(() => {
    console.log('Menu Items:', menuItems);
    console.log('Admin Menu Items:', adminMenuItems);
  }, []);

  useEffect(() => {
    const token = getToken();
    const userData = getUserData();
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    clearAllData();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  const handleAddLectureClick = () => {
    if (isLoggedIn) {
      setIsLectureModalOpen(true);
    } else {
      setAuthPromptOpen(true);
    }
  };

  const handleAddDaijaClick = () => {
    if (isLoggedIn) {
      setIsDaijaModalOpen(true);
    } else {
      setAuthPromptOpen(true);
    }
  };

  const handleAddOrganizationClick = () => {
    if (isLoggedIn) {
      setIsOrganizationModalOpen(true);
    } else {
      setAuthPromptOpen(true);
    }
  };

  const handleAuthPromptClose = () => {
    setAuthPromptOpen(false);
  };

  const handleGoToAuth = (mode = 'login') => {
    setAuthPromptOpen(false);
    router.push('/auth');
  };

  const handleSuggestionClick = () => {
    setSuggestionFormOpen(true);
  };

  const handleAddMenuClick = (event) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleAddLectureFromMenu = () => {
    handleAddMenuClose();
    handleAddLectureClick();
  };

  const handleAddDaijaFromMenu = () => {
    handleAddMenuClose();
    handleAddDaijaClick();
  };

  const handleAddOrganizationFromMenu = () => {
    handleAddMenuClose();
    handleAddOrganizationClick();
  };

  const handleSuggestionFromMenu = () => {
    handleAddMenuClose();
    handleSuggestionClick();
  };

  const handleMobileAddMenuToggle = () => {
    setMobileAddMenuOpen(!mobileAddMenuOpen);
  };

  const renderMobileDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => {
        setDrawerOpen(false);
        setMobileAddMenuOpen(false);
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: 'primary.main',
          color: 'white',
          zIndex: (theme) => theme.zIndex.drawer + 2
        }
      }}
    >
      <Box sx={{ pt: 8 }}>
        {/* Logo removed since it's now in the header */}
      </Box>
      
      {/* Osnovni meni */}
      <List>
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link href={item.path} key={item.text || `menu-${index}`} passHref legacyBehavior>
              <ListItem
                button
                onClick={() => setDrawerOpen(false)}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  color: 'white',
                  py: 1.5,
                  px: 2
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  <IconComponent sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            </Link>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      {/* Korisnički meni */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
          Korisnički meni
        </Typography>
      </Box>
      <List sx={{ py: 0 }}>
        {/* Dodaj kao glavna stavka */}
        <ListItem
          button
          onClick={handleMobileAddMenuToggle}
          sx={{
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
            color: 'white',
            py: 1.5,
            px: 2
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
            <AddIcon sx={{ fontSize: '1.2rem' }} />
          </ListItemIcon>
          <ListItemText primary="Dodaj" />
          <IconButton sx={{ color: 'white', p: 0 }}>
            {mobileAddMenuOpen ? <CloseIcon sx={{ fontSize: '1rem' }} /> : <MenuIcon sx={{ fontSize: '1rem' }} />}
          </IconButton>
        </ListItem>
        
        {/* Opcije za dodavanje - prikazane samo kada je meni otvoren */}
        {mobileAddMenuOpen && (
          <>
            <Link href="#" passHref legacyBehavior>
              <ListItem
                button
                onClick={() => {
                  handleAddLectureFromMenu();
                  setDrawerOpen(false);
                  setMobileAddMenuOpen(false);
                }}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  pl: 6 // Uvučeno da izgleda kao sub-opcija
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  <MenuBookIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Dodaj ders" />
              </ListItem>
            </Link>
            
            <Link href="#" passHref legacyBehavior>
              <ListItem
                button
                onClick={() => {
                  handleAddDaijaFromMenu();
                  setDrawerOpen(false);
                  setMobileAddMenuOpen(false);
                }}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  pl: 6 // Uvučeno da izgleda kao sub-opcija
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  <PersonIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Dodaj daiiju" />
              </ListItem>
            </Link>
            
            <Link href="#" passHref legacyBehavior>
              <ListItem
                button
                onClick={() => {
                  handleAddOrganizationFromMenu();
                  setDrawerOpen(false);
                  setMobileAddMenuOpen(false);
                }}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  pl: 6 // Uvučeno da izgleda kao sub-opcija
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  <BusinessIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Dodaj udruženje" />
              </ListItem>
            </Link>
          </>
        )}
        
        {/* Predloži izmjenu kao zasebna stavka */}
        <Link href="#" passHref legacyBehavior>
          <ListItem
            button
            onClick={() => {
              handleSuggestionFromMenu();
              setDrawerOpen(false);
            }}
            sx={{
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
              color: 'white',
              py: 1.5,
              px: 2
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
              <LightbulbIcon sx={{ fontSize: '1.2rem' }} />
            </ListItemIcon>
            <ListItemText primary="Predloži izmjenu" />
          </ListItem>
        </Link>
      </List>

      {/* Admin meni - samo za administratore */}
      {isLoggedIn && (user?.role === 'admin' || user?.role === 'super_admin') && (
        <>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
              Admin meni
            </Typography>
          </Box>
          <List sx={{ py: 0 }}>
            <Link href="/dashboard" passHref legacyBehavior>
              <ListItem
                button
                onClick={() => setDrawerOpen(false)}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  color: 'white',
                  py: 1.5,
                  px: 2
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  <DashboardIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
            </Link>
            {/* Uklonili smo "Korisnici" - samo Dashboard ostaje */}
          </List>
        </>
      )}

      {/* Odjavi se na dnu menija */}
      {isLoggedIn && (
        <>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mt: 2 }} />
          <List sx={{ py: 0 }}>
            <Link href="#" passHref legacyBehavior>
              <ListItem
                button
                onClick={() => {
                  handleLogout();
                  setDrawerOpen(false);
                }}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  color: 'white',
                  py: 1.5,
                  px: 2
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  <LogoutIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Odjavi se" />
              </ListItem>
            </Link>
          </List>
        </>
      )}

      {/* Prijavi se za nelogirane korisnike */}
      {!isLoggedIn && (
        <>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mt: 2 }} />
          <List sx={{ py: 0 }}>
            <Link href="/auth" passHref legacyBehavior>
              <ListItem
                button
                onClick={() => {
                  router.push('/auth');
                  setDrawerOpen(false);
                }}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  color: 'white',
                  py: 1.5,
                  px: 2
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  <LoginIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Prijavi se" />
              </ListItem>
            </Link>
          </List>
        </>
      )}
    </Drawer>
  );

  const renderDesktopHeader = () => (
    <AppBar position="fixed" sx={{ 
      zIndex: (theme) => theme.zIndex.drawer + 1
    }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/" passHref legacyBehavior>
            <Box component="a" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <LogoCircle />
            </Box>
          </Link>
          {/* Osnovni meni */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link href={item.path} key={item.text || index} passHref legacyBehavior>
                  <Button
                    color="inherit"
                    startIcon={<IconComponent />}
                    sx={{ padding: '6px 8px', color: 'white' }}
                  >
                    {item.text}
                  </Button>
                </Link>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* Korisnički meni */}
          {isLoggedIn ? (
            <>
              {/* Dodaj dropdown - za sve korisnike */}
              <Button
                color="inherit"
                startIcon={<AddIcon />}
                onClick={handleAddMenuClick}
                sx={{ padding: '6px 8px', color: 'white' }}
              >
                Dodaj
              </Button>
              {/* Menu moved outside AppBar */}

              {/* Bulb ikona za prijedloge */}
              <Tooltip title="Predloži izmjenu" arrow>
                <IconButton
                  color="inherit"
                  onClick={handleSuggestionFromMenu}
                  sx={{ color: 'white' }}
                >
                  <LightbulbIcon />
                </IconButton>
              </Tooltip>
              
              {/* Admin meni - samo Dashboard */}
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <>
                  <Box sx={{ height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', mx: 1 }} />
                  <Link href="/dashboard" passHref legacyBehavior>
                    <Button
                      color="inherit"
                      startIcon={<DashboardIcon />}
                      sx={{ padding: '6px 8px', color: 'white' }}
                    >
                      Dashboard
                    </Button>
                  </Link>
                </>
              )}
              
              {/* Odjavi se */}
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ padding: '6px 8px', color: 'white' }}
              >
                Odjavi se
              </Button>
            </>
          ) : (
            <>
              {/* Dodaj dropdown - za nelogirane */}
              <Button
                color="inherit"
                startIcon={<AddIcon />}
                onClick={handleAddMenuClick}
                sx={{ padding: '6px 8px', color: 'white' }}
              >
                Dodaj
              </Button>
              {/* Menu moved outside AppBar */}

              {/* Bulb ikona za prijedloge */}
              <Tooltip title="Predloži izmjenu" arrow>
                <IconButton
                  color="inherit"
                  onClick={handleSuggestionFromMenu}
                  sx={{ color: 'white' }}
                >
                  <LightbulbIcon />
                </IconButton>
              </Tooltip>

              {/* Prijavi se */}
              <Link href="/auth" passHref legacyBehavior>
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  sx={{ padding: '6px 8px', color: 'white' }}
                >
                  Prijavi se
                </Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Slide appear={false} direction="down" in={showNavigation}>
            <AppBar position="fixed" sx={{ 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              transition: 'transform 0.3s ease-in-out'
            }}>
              <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Link href="/" passHref legacyBehavior>
                  <Box component="a" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <LogoCircle />
                  </Box>
                </Link>
                <IconButton
                  color="inherit"
                  aria-label={drawerOpen ? "close menu" : "open drawer"}
                  edge="end"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  sx={{ color: 'white' }}
                >
                  {drawerOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
              </Toolbar>
            </AppBar>
          </Slide>
          {renderMobileDrawer()}
        </>
      ) : (
        renderDesktopHeader()
      )}
      <LectureForm
        open={isLectureModalOpen}
        onClose={() => setIsLectureModalOpen(false)}
        onSuccess={(newLecture) => {
          // Just close the modal, no need to refresh data
        }}
      />

      <DaijaForm
        open={isDaijaModalOpen}
        onClose={() => setIsDaijaModalOpen(false)}
        onSuccess={(newDaija) => {
          // Just close the modal, no need to refresh data
        }}
      />

      <OrganizationForm
        open={isOrganizationModalOpen}
        onClose={() => setIsOrganizationModalOpen(false)}
        onSuccess={(newOrganization) => {
          // Just close the modal, success message is shown by OrganizationForm
        }}
      />

      <SuggestionForm
        open={suggestionFormOpen}
        onClose={() => setSuggestionFormOpen(false)}
        onSuccess={() => {
          setSuggestionFormOpen(false);
        }}
      />

      {/* Dialog za nelogirane korisnike */}
      <Dialog
        open={authPromptOpen}
        onClose={handleAuthPromptClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Prijavite se da biste dodali predavanje
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Da biste mogli dodati predavanje, potrebno je da se prijavite.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ako nemate nalog, jednostavno se registrujte.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleAuthPromptClose}
            color="inherit"
          >
            Otkaži
          </Button>
          <Button 
            onClick={() => handleGoToAuth('register')}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Registruj se
          </Button>
          <Button 
            onClick={() => handleGoToAuth('login')}
            variant="contained"
          >
            Prijavi se
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu component moved here for better z-index handling */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        MenuListProps={{
          sx: {
            backgroundColor: 'primary.main',
            color: 'white',
            minWidth: '180px'
          }
        }}
        sx={{
          zIndex: 10000,
          '& .MuiPaper-root': {
            backgroundColor: 'primary.main',
            color: 'white',
            minWidth: '180px',
            zIndex: 10000
          }
        }}
      >
        <MenuItem onClick={handleAddLectureFromMenu} sx={{ color: 'white' }}>
          <ListItemIcon sx={{ color: 'white' }}>
            <MenuBookIcon />
          </ListItemIcon>
          <ListItemText primary="Dodaj ders" />
        </MenuItem>
        <MenuItem onClick={handleAddDaijaFromMenu} sx={{ color: 'white' }}>
          <ListItemIcon sx={{ color: 'white' }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Dodaj daiiju" />
        </MenuItem>
        <MenuItem onClick={handleAddOrganizationFromMenu} sx={{ color: 'white' }}>
          <ListItemIcon sx={{ color: 'white' }}>
            <BusinessIcon />
          </ListItemIcon>
          <ListItemText primary="Dodaj udruženje" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navigation; 