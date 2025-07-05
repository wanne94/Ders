import React from 'react';
import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';

const UniversalCard = ({ 
  data, 
  onEdit, 
  onDelete, 
  onClick,
  showActions = true 
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [imageError, setImageError] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState({});

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Get display data based on type
  const getDisplayData = () => {
    const debug = {
      originalData: data,
      originalImage: data.image,
      dataType: data.type
    };

    let result;
    
    if (data.tip === 'predavanje' || data.type === 'lecture') {
      const defaultImg = getDefaultLectureImage();
      debug.defaultImage = defaultImg;
      debug.finalImage = data.image || defaultImg;
      
      result = {
        title: data.name || data.title,
        subtitle: data.description || data.opis,
        image: data.image || defaultImg,
        location: data.location || data.lokacija,
        date: data.date || data.datum,
        type: 'lecture',
        id: data._id
      };
    } else if (data.tip === 'daija' || data.type === 'daija') {
      const defaultImg = getDefaultDaijaImage();
      debug.defaultImage = defaultImg;
      debug.finalImage = data.image || defaultImg;
      
      result = {
        title: data.name || data.title,
        subtitle: data.description || data.opis,
        image: data.image || defaultImg,
        location: data.location || data.lokacija,
        date: data.date || data.datum,
        type: 'daija',
        id: data._id
      };
    } else if (data.tip === 'udruženje' || data.type === 'organization') {
      const defaultImg = getDefaultOrganizationImage();
      debug.defaultImage = defaultImg;
      debug.finalImage = data.image || defaultImg;
      
      result = {
        title: data.name || data.title,
        subtitle: data.description || data.opis,
        image: data.image || defaultImg,
        location: data.location || data.lokacija,
        date: data.date || data.datum,
        type: 'organization',
        id: data._id
      };
    } else {
      const defaultImg = getDefaultLectureImage();
      debug.defaultImage = defaultImg;
      debug.finalImage = data.image || defaultImg;
      
      result = {
        title: data.name || data.title || 'Unknown',
        subtitle: data.description || data.opis || '',
        image: data.image || defaultImg,
        location: data.location || data.lokacija || '',
        date: data.date || data.datum || '',
        type: 'lecture',
        id: data._id
      };
    }

    setDebugInfo(debug);
    return result;
  };

  const displayData = getDisplayData();
  const imageUrl = getImageUrl(displayData.image);

  // Debug logging
  React.useEffect(() => {
    console.log('🐛 UniversalCard Debug Info:', {
      ...debugInfo,
      processedImageUrl: imageUrl,
      imageError: imageError
    });
  }, [imageUrl, imageError, debugInfo]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'lecture':
        return '#2196F3';
      case 'daija':
        return '#4CAF50';
      case 'organization':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'lecture':
        return 'Predavanje';
      case 'daija':
        return 'Daija';
      case 'organization':
        return 'Udruženje';
      default:
        return 'Nepoznato';
    }
  };

  const handleImageError = (e) => {
    console.log('🚨 Image failed to load:', {
      src: e.target.src,
      displayDataType: displayData.type,
      originalImage: debugInfo.originalImage
    });
    
    e.target.onerror = null; // Prevent infinite loop
    setImageError(true);
    
    // Use appropriate default image based on type
    if (displayData.type === 'lecture') {
      e.target.src = getDefaultLectureImage();
    } else if (displayData.type === 'daija') {
      e.target.src = getDefaultDaijaImage();
    } else if (displayData.type === 'organization') {
      e.target.src = getDefaultOrganizationImage();
    }
  };

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully:', {
      src: e.target.src,
      naturalWidth: e.target.naturalWidth,
      naturalHeight: e.target.naturalHeight
    });
    setImageError(false);
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[8]
        } : {},
        position: 'relative'
      }}
    >
      {/* Debug info overlay (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            fontSize: '10px',
            padding: '2px 4px',
            zIndex: 1000
          }}
        >
          IMG: {imageUrl.substring(imageUrl.lastIndexOf('/') + 1)} 
          {imageError && ' (ERROR)'}
        </Box>
      )}

      {/* Actions Menu */}
      {showActions && (onEdit || onDelete) && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <MenuItem onClick={() => { onEdit(data); handleMenuClose(); }}>
                Uredi
              </MenuItem>
            )}
            {onDelete && (
              <MenuItem onClick={() => { onDelete(data); handleMenuClose(); }}>
                Obriši
              </MenuItem>
            )}
          </Menu>
        </Box>
      )}

      {/* Image */}
      <Box
        sx={{
          width: '100%',
          height: 200,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Image
          src={imageUrl}
          alt={displayData.title}
          width={300}
          height={200}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            border: imageError ? '2px solid red' : 'none'
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        {/* Type chip */}
        <Box sx={{ mb: 1 }}>
          <Chip
            label={getTypeLabel(displayData.type)}
            size="small"
            sx={{
              backgroundColor: getTypeColor(displayData.type),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.2,
            minHeight: '2.4em'
          }}
        >
          {displayData.title}
        </Typography>

        {/* Subtitle/Description */}
        {displayData.subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
              minHeight: '2.8em'
            }}
          >
            {displayData.subtitle}
          </Typography>
        )}

        {/* Location */}
        {displayData.location && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 0.5,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            📍 {displayData.location}
          </Typography>
        )}

        {/* Date */}
        {displayData.date && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            📅 {new Date(displayData.date).toLocaleDateString('bs-BA')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UniversalCard;