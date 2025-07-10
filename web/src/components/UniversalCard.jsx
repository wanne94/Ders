import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
    Card,
    CardContent,
    Typography,
    Box,
    CardActionArea,
    Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import { formatDateWithDay, generateLectureSlug, generateDaijaSlug, generateOrganizationSlug } from '../utils/dataHelpers';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';
import { formatDaijaTitle } from '../utils';

const UniversalCard = React.memo(({ data }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (!data) {
    return null;
  }

  const getDisplayData = () => {
    const entityType = data.type?.toLowerCase() || 'unknown';
    
    switch (entityType) {
      case 'predavanje':
        // Determine lecture status based on date and time
        const getLectureStatus = () => {
          if (!data.date) return 'unknown';
          
          const now = new Date();
          const lectureDateTime = new Date(data.date);
          
          // Set lecture time (default to 12:00 if not specified)
          if (data.time) {
            const [hours, minutes] = data.time.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
              lectureDateTime.setHours(hours, minutes, 0, 0);
            } else {
              lectureDateTime.setHours(12, 0, 0, 0);
            }
          } else {
            lectureDateTime.setHours(12, 0, 0, 0);
          }
          
          // Calculate lecture end time (assuming 1 hour duration)
          const lectureEndTime = new Date(lectureDateTime.getTime() + 60 * 60 * 1000);
          
          if (now >= lectureDateTime && now <= lectureEndTime) {
            return 'utoku'; // Currently active
          } else if (lectureDateTime > now) {
            return 'uskoro'; // Future
          } else {
            return 'proslo'; // Past
          }
        };
        
        const lectureStatus = getLectureStatus();
        const isPastLecture = lectureStatus === 'proslo';
        
        return {
          type: 'lecture',
          title: data.title?.toUpperCase() || '',
          image: data.image || getDefaultLectureImage(),
          imageStyle: { borderRadius: '8px' },
          isPastLecture,
          lectureStatus,
          infoItems: [
            { icon: <PersonIcon />, text: 
              data.daija && typeof data.daija === 'object' 
                ? formatDaijaTitle(data.daija.name, data.daija.title) || 'Daija nije unesen'
                : data.speaker || 'Daija nije unesen' 
            },
            { icon: <BusinessIcon />, text: data.organization || 'Nepoznato udruženje' },
            data.date && { icon: <CalendarTodayIcon />, text: formatDateWithDay(data.date) },
            data.time && { icon: <AccessTimeIcon />, text: data.time },
            data.address && { icon: <LocationOnIcon />, text: data.address },
            data.city && { icon: <LocationCityIcon />, text: data.city }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateLectureSlug(data);
            router.push(`/profile/lecture/${data._id}`);
          }
        };
      
      case 'daija':
        return {
          type: 'daija',
          title: formatDaijaTitle(data.name, data.title),
          titlePrefix: null,
          image: data.image || getDefaultDaijaImage(),
          imageStyle: { borderRadius: '50%' },
          infoItems: [
            data.specialization && { icon: <SchoolIcon />, text: data.specialization },
            data.city && { icon: <LocationCityIcon />, text: data.city },
            data.lectureCount !== undefined && { 
              icon: <ClassIcon />, 
              text: `Broj predavanja: ${data.lectureCount || 0}`,           
            }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateDaijaSlug(data);
            router.push(`/profile/daija/${data._id}`);
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
            router.push(`/profile/organization/${data._id}`);
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

  const imageUrl = imageError ? 
    (displayData.type === 'lecture' ? getDefaultLectureImage() :
     displayData.type === 'daija' ? getDefaultDaijaImage() :
     getDefaultOrganizationImage()) : 
    getImageUrl(displayData.image);

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
      {/* Status badge for lectures */}
      {displayData.type === 'lecture' && displayData.lectureStatus && (
        <Chip
          label={
            displayData.lectureStatus === 'utoku' ? '🟢 U toku' :
            displayData.lectureStatus === 'uskoro' ? '🟡 Uskoro' : 
            '🔴 Prošlo'
          }
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 
              displayData.lectureStatus === 'utoku' ? '#e8f5e8' :
              displayData.lectureStatus === 'uskoro' ? '#fff8e1' :
              '#ffebee',
            color: 
              displayData.lectureStatus === 'utoku' ? '#2e7d32' :
              displayData.lectureStatus === 'uskoro' ? '#f57f17' :
              '#c62828',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            padding: '6px 12px',
            '& .MuiChip-label': {
              paddingLeft: '8px',
              paddingRight: '8px'
            }
          }}
        />
      )}
      
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
                  
                  fontWeight: displayData.type === 'lecture' ? 'bold' : 600,
                  mb: 1,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textAlign: displayData.type === 'lecture' ? 'left' : 'inherit',
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
      height: displayData.type === 'lecture' ? '130px' : '100px',
      overflow: 'hidden',
      borderRadius: displayData.imageStyle?.borderRadius || '0',
      bgcolor: 'background.default',
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
});

UniversalCard.displayName = 'UniversalCard';

export default UniversalCard;