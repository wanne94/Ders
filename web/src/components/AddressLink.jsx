import React from 'react';
import { Button, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigationIcon from '@mui/icons-material/Navigation';

const AddressLink = ({ address, city, style = {} }) => {
  const fullAddress = `${address}, ${city}`;
  
  const handleAddressClick = () => {
    const encodedAddress = encodeURIComponent(fullAddress);
    
    // Detect user's device/browser
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let mapsUrl;
    
    if (isIOS) {
      // Apple Maps for iOS
      mapsUrl = `maps://maps.apple.com/?q=${encodedAddress}&dirflg=d`;
    } else if (isAndroid) {
      // Google Maps for Android
      mapsUrl = `google.navigation:q=${encodedAddress}`;
    } else {
      // Google Maps web for desktop
      mapsUrl = `https://maps.google.com/maps?q=${encodedAddress}&navigate=yes`;
    }
    
    // Try to open native app first, fallback to web
    const link = document.createElement('a');
    link.href = mapsUrl;
    link.target = '_blank';
    link.click();
    
    // Fallback to Google Maps web if native app doesn't open
    if (!isIOS && !isAndroid) {
      setTimeout(() => {
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        window.open(fallbackUrl, '_blank');
      }, 500);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<LocationOnIcon sx={{ fontSize: 18 }} />}
      endIcon={<NavigationIcon sx={{ fontSize: 16, opacity: 0.7 }} />}
      onClick={handleAddressClick}
      sx={{
        borderColor: '#022C43',
        color: '#022C43',
        borderRadius: 3,
        px: 3,
        py: 1.5,
        fontSize: '0.95rem',
        fontWeight: 500,
        textTransform: 'none',
        transition: 'all 0.2s ease',
        backgroundColor: 'rgba(2, 44, 67, 0.05)',
        justifyContent: 'flex-start',
        '&:hover': {
          borderColor: '#055A87',
          backgroundColor: 'rgba(2, 44, 67, 0.1)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(2, 44, 67, 0.2)'
        },
        '& .MuiButton-startIcon': {
          color: '#022C43',
          marginRight: 1
        },
        '& .MuiButton-endIcon': {
          color: '#022C43',
          opacity: 0.7,
          marginLeft: 0.5,
          transition: 'all 0.2s ease'
        },
        ...style
      }}
    >
      <Typography 
        variant="body1" 
        sx={{ 
          fontSize: 'inherit',
          textAlign: 'left',
          fontWeight: 500
        }}
      >
        {fullAddress}
      </Typography>
    </Button>
  );
};

export default AddressLink;