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
import { formatDateWithDay, generateLectureSlug, generateDaijaSlug, generateOrganizationSlug, calculateLectureStatus } from '../utils/dataHelpers';
import CancelledOverlay from './CancelledOverlay';
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
        // Use new status calculation utility
        const statusInfo = data.statusInfo || calculateLectureStatus(data);
        const isPastLecture = statusInfo.status === 'past';
        
        return {
          type: 'lecture',
          title: data.title?.toUpperCase() || '',
          image: data.image || getDefaultLectureImage(),
          imageStyle: { borderRadius: '8px' },
          isPastLecture,
          statusInfo,
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
      {/* Weekly lecture badge - left side */}
      {displayData.type === 'lecture' && data.isWeeklyLecture && (
        <Chip
          label="Sedmično"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 3,
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            fontWeight: 'bold',
            fontSize: '0.75rem',
            '& .MuiChip-label': {
              paddingLeft: '6px',
              paddingRight: '6px',
              paddingTop: '4px',
              paddingBottom: '4px'
            }
          }}
        />
      )}

      {/* Enhanced Status badge for lectures */}
      {displayData.type === 'lecture' && displayData.statusInfo && (
        <Chip
          label={displayData.statusInfo.badgeText || 'N/A'}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 3, // Povećan z-index da bude iznad svega
            backgroundColor: 
              displayData.statusInfo.badgeColor === 'green' ? '#e8f5e8' :
              displayData.statusInfo.badgeColor === 'yellow' ? '#fff8e1' :
              displayData.statusInfo.badgeColor === 'red' ? '#ffebee' :
              displayData.statusInfo.badgeColor === 'gray' ? '#f5f5f5' :
              '#f5f5f5',
            color: 
              displayData.statusInfo.badgeColor === 'green' ? '#2e7d32' :
              displayData.statusInfo.badgeColor === 'yellow' ? '#f57f17' :
              displayData.statusInfo.badgeColor === 'red' ? '#c62828' :
              displayData.statusInfo.badgeColor === 'gray' ? '#666666' :
              '#666666',
            fontWeight: 'bold',
            fontSize: '0.75rem',
            maxWidth: '180px',
            height: 'auto',
            whiteSpace: 'normal',
            '@media (max-width: 480px)': {
              maxWidth: '140px',
              fontSize: '0.7rem'
            },
            '& .MuiChip-label': {
              paddingLeft: '6px',
              paddingRight: '6px',
              paddingTop: '4px',
              paddingBottom: '4px',
              lineHeight: '1.2',
              textAlign: 'center'
            }
          }}
        />
      )}
      
      <CardActionArea onClick={displayData.onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
          
          {/* Title section for lectures - full width */}
          {displayData.type === 'lecture' && (
            <>
              <Typography 
                variant="h6" 
                component="h2" 
                sx={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  mb: 0.5,
                  mt: 2.5, // Dodat margin top da naslov bude ispod badge-a
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textAlign: 'left',
                  width: '100%',
                  pr: 10 // Padding right da se tekst ne preklapa sa badge-om
                }}
              >
                {displayData.title}
                {data.lecturePart && ` (dio ${data.lecturePart}.)`}
              </Typography>
              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 0.5 }} />
            </>
          )}

          <Box sx={{ display: 'flex', height: '100%', flex: 1 }}>
            {/* Left side - Information */}
            <Box sx={{ 
              flex: 1, 
              pr: 3, // Povećan padding sa 2 na 3 za veći razmak
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              minWidth: 0,
              overflow: 'hidden'
            }}>
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

              {/* Main title for non-lecture types */}
              {displayData.type !== 'lecture' && (
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{
                    
                    fontSize: '18px',
                    
                    fontWeight: 600,
                    mb: 0.5,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {displayData.title}
                  {data.lecturePart && ` (dio ${data.lecturePart}.)`}
                </Typography>
              )}

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
                        textAlign: 'left',
                        pr: 1, // Dodajemo padding desno za svaku info stavku
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
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
      justifyContent: 'center',
      position: 'relative' // Dodano za relativno pozicioniranje overlay-a
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
    {/* CancelledOverlay - prikazuje se za lecture tip kad je isCancelled true ili status je cancelled */}
    {displayData.type === 'lecture' && (
      <CancelledOverlay 
        show={data.isCancelled === true || data.status === 'cancelled'} 
        text="OTKAZANO"
        variant="diagonal"
      />
    )}
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