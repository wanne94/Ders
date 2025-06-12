import React from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CardActionArea
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import { formatDateWithDay, generateLectureSlug, generateDaijaSlug, generateOrganizationSlug } from '../utils/dataHelpers';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';

const UniversalCard = ({ data }) => {
  const router = useRouter();

  if (!data) {
    return null;
  }

  const getDisplayData = () => {
    const entityType = data.type?.toLowerCase() || 'unknown';
    
    switch (entityType) {
      case 'predavanje':
        return {
          type: 'lecture',
          title: data.title,
          image: data.image || getDefaultLectureImage(),
          imageStyle: { borderRadius: '8px' },
          infoItems: [
            { icon: <PersonIcon />, text: data.speaker || 'Nepoznat daija' },
            { icon: <BusinessIcon />, text: data.organization || 'Nepoznato udruženje' },
            data.date && { icon: <CalendarTodayIcon />, text: formatDateWithDay(data.date) },
            data.time && { icon: <AccessTimeIcon />, text: data.time },
            data.address && { icon: <LocationOnIcon />, text: data.address },
            data.city && { icon: <LocationCityIcon />, text: data.city }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateLectureSlug(data);
            router.push(`/profile/lecture/${slug}`);
          }
        };
      
      case 'daija':
        return {
          type: 'daija',
          title: data.name,
          titlePrefix: data.title,
          image: data.image || getDefaultDaijaImage(),
          imageStyle: { borderRadius: '50%' },
          infoItems: [
            data.specialization && { icon: <SchoolIcon />, text: data.specialization },
            data.city && { icon: <LocationCityIcon />, text: data.city }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateDaijaSlug(data);
            router.push(`/profile/daija/${slug}`);
          }
        };
      
      case 'udruženje':
        return {
          type: 'organization',
          title: data.name,
          image: data.image || getDefaultOrganizationImage(),
          imageStyle: { borderRadius: '8px' },
          infoItems: [
            data.shortDescription && { icon: <BusinessIcon />, text: data.shortDescription },
            data.address && { icon: <LocationOnIcon />, text: data.address },
            data.city && { icon: <LocationCityIcon />, text: data.city }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateOrganizationSlug(data);
            router.push(`/profile/organization/${slug}`);
          }
        };
      
      default:
        return null;
    }
  };

  const displayData = getDisplayData();
  
  if (!displayData) {
    return null;
  }

  const imageUrl = getImageUrl(displayData.image);

  return (
    <Card 
      sx={{ 
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardActionArea onClick={displayData.onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%', p: 2 }}>
          <Box sx={{ display: 'flex', height: '100%' }}>
            {/* Left side - Information */}
            <Box sx={{ flex: 1, pr: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Title prefix (for daija titles) */}
              {displayData.titlePrefix && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    
                    fontSize: '12px',
                    color: 'text.secondary',
                    mb: 0.5,
                    textTransform: 'lowercase'
                  }}
                >
                  {displayData.titlePrefix}
                </Typography>
              )}

              {/* Main title */}
              <Typography 
                variant="h6" 
                component="h2" 
                sx={{
                  
                  fontSize: '18px',
                  
                  fontWeight: 600,
                  mb: 1,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {displayData.title}
              </Typography>

              {/* Info items */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {displayData.infoItems.map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.8 
                    }}
                  >
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      {React.cloneElement(item.icon, { sx: { fontSize: '16px' } })}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '13px',
                        color: 'text.secondary',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Right side - Image */}
            <Box 
  sx={{
    width: '100px',
    height: '100%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <Box
    sx={{
      width: '100px',
      height: '100px',
      overflow: 'hidden',
      borderRadius: displayData.imageStyle?.borderRadius || '0',
      bgcolor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <img
      src={imageUrl}
      alt={displayData.title}
      onError={(e) => {
        e.target.onerror = null; // Prevent infinite loop
        // Use appropriate default image based on type
        if (displayData.type === 'lecture') {
          e.target.src = getDefaultLectureImage();
        } else if (displayData.type === 'daija') {
          e.target.src = getDefaultDaijaImage();
        } else if (displayData.type === 'organization') {
          e.target.src = getDefaultOrganizationImage();
        }
      }}
      style={{ 
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  </Box>
</Box>

          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default UniversalCard; 