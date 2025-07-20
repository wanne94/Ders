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
import { useLectureStatusWithCountdown } from '../hooks/useLectureStatus';

const EnhancedUniversalCard = React.memo(({ data }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  
  // Use real-time status and countdown for lectures
  const lectureStatus = useLectureStatusWithCountdown(
    data?.type?.toLowerCase() === 'predavanje' ? data : null,
    {
      statusUpdateInterval: 60000, // Update status every minute
      countdownUpdateInterval: 1000 // Update countdown every second
    }
  );

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
        // Use real-time status info or fallback to provided statusInfo
        const statusInfo = lectureStatus.statusInfo || data.statusInfo;
        const isPastLecture = statusInfo?.status === 'past';
        
        return {
          type: 'lecture',
          title: data.title?.toUpperCase() || '',
          image: data.image || getDefaultLectureImage(),
          imageStyle: { borderRadius: '8px' },
          isPastLecture,
          statusInfo,
          countdown: lectureStatus.countdown,
          isLive: lectureStatus.isLive,
          isUpcoming: lectureStatus.isUpcoming,
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

  // Enhanced badge text with countdown
  const getEnhancedBadgeText = () => {
    if (displayData.type !== 'lecture' || !displayData.statusInfo) {
      return 'N/A';
    }

    const { statusInfo, countdown } = displayData;
    
    if (statusInfo.status === 'upcoming' && countdown) {
      return `Uskoro • ${countdown.formatted}`;
    } else if (statusInfo.status === 'active' && countdown) {
      return `U toku • ${countdown.formatted}`;
    } else {
      return statusInfo.badgeText || 'N/A';
    }
  };

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
      {/* Enhanced Status badge for lectures with countdown */}
      {displayData.type === 'lecture' && displayData.statusInfo && (
        <Chip
          label={getEnhancedBadgeText()}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            background: 
              displayData.statusInfo.badgeColor === 'green' ? 
                'linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%)' :
              displayData.statusInfo.badgeColor === 'yellow' ? 
                'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)' :
              displayData.statusInfo.badgeColor === 'red' ? 
                'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' :
                'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            color: 
              displayData.statusInfo.badgeColor === 'green' ? '#1b5e20' :
              displayData.statusInfo.badgeColor === 'yellow' ? '#e65100' :
              displayData.statusInfo.badgeColor === 'red' ? '#b71c1c' :
              '#424242',
            border: 
              displayData.statusInfo.badgeColor === 'green' ? '1px solid #4caf50' :
              displayData.statusInfo.badgeColor === 'yellow' ? '1px solid #ff9800' :
              displayData.statusInfo.badgeColor === 'red' ? '1px solid #f44336' :
              '1px solid #bdbdbd',
            boxShadow: 
              displayData.statusInfo.badgeColor === 'green' ? '0 2px 4px rgba(76, 175, 80, 0.2)' :
              displayData.statusInfo.badgeColor === 'yellow' ? '0 2px 4px rgba(255, 152, 0, 0.2)' :
              displayData.statusInfo.badgeColor === 'red' ? '0 2px 4px rgba(244, 67, 54, 0.2)' :
              '0 2px 4px rgba(0, 0, 0, 0.1)',
            fontWeight: 'bold',
            fontSize: '0.75rem',
            maxWidth: '180px',
            height: 'auto',
            whiteSpace: 'normal',
            '@media (max-width: 480px)': {
              maxWidth: '140px',
              fontSize: '0.7rem'
            },
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            // Add animation for live updates
            animation: displayData.isLive ? 'pulse 2s infinite' : 'none',
            transform: 'translateZ(0)', // Enable hardware acceleration
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05) translateZ(0)',
              boxShadow: 
                displayData.statusInfo.badgeColor === 'green' ? '0 4px 12px rgba(76, 175, 80, 0.3)' :
                displayData.statusInfo.badgeColor === 'yellow' ? '0 4px 12px rgba(255, 152, 0, 0.3)' :
                displayData.statusInfo.badgeColor === 'red' ? '0 4px 12px rgba(244, 67, 54, 0.3)' :
                '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            '& .MuiChip-label': {
              paddingLeft: '8px',
              paddingRight: '8px',
              paddingTop: '5px',
              paddingBottom: '5px',
              lineHeight: '1.2',
              textAlign: 'center',
              fontWeight: '600',
              letterSpacing: '0.02em',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            },
            '@keyframes pulse': {
              '0%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.8,
              },
              '100%': {
                opacity: 1,
              },
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

              {/* Live indicator for active lectures */}
              {displayData.isLive && (
                <Box sx={{ mb: 1 }}>
                  <Chip
                    label="🔴 UŽIVO"
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #ff1744 0%, #d50000 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(255, 23, 68, 0.4)',
                      animation: 'livePulse 1.5s infinite',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      '& .MuiChip-label': {
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                      },
                      '@keyframes livePulse': {
                        '0%': {
                          boxShadow: '0 2px 8px rgba(255, 23, 68, 0.4)',
                          transform: 'scale(1)'
                        },
                        '50%': {
                          boxShadow: '0 4px 16px rgba(255, 23, 68, 0.7)',
                          transform: 'scale(1.02)'
                        },
                        '100%': {
                          boxShadow: '0 2px 8px rgba(255, 23, 68, 0.4)',
                          transform: 'scale(1)'
                        }
                      }
                    }}
                  />
                </Box>
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

EnhancedUniversalCard.displayName = 'EnhancedUniversalCard';

export default EnhancedUniversalCard;