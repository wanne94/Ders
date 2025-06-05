import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { formatDate, formatDateWithDay, generateLectureSlug } from '../utils/dataHelpers';
import { getImageUrl, getDefaultLectureImage } from '../utils/imageUtils';

const LectureCard = ({ lecture }) => {
  const router = useRouter();

  // Zaštita protiv undefined lecture
  if (!lecture) {
    return (
      <Card sx={{ 
        width: '100%',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 0 16px 0',
        padding: '16px',
      }}>
        <Typography color="error" variant="body2">
          Greška: Nema podataka o predavanju
        </Typography>
      </Card>
    );
  }

  const imageUrl = getImageUrl(lecture.image) || getDefaultLectureImage();

  const handleCardClick = () => {
    const slug = generateLectureSlug(lecture);
    router.push(`/profile/lecture/${slug}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      sx={{
        height: '100%',
        width: '100%',
        minHeight: '200px',
        marginBottom: '16px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent sx={{ padding: '16px !important', height: '100%' }}>
      <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // ako želiš sliku desno
                height: '100%' // važno
              }}>

          {/* Lijeva strana - sadržaj */}
          <Box sx={{ 
            flex: 1,
            paddingRight: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* Naslov */}
            <Typography 
              variant="h6" 
              component="div" 
              className="title-lecture"
              sx={{
                marginBottom: '4px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
                textAlign: 'left',
              }}
            >
              {lecture?.title || 'Bez naziva'}
            </Typography>

            {/* Info sekcija */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.5,
              marginTop: '8px'
            }}>
              {/* Speaker */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <PersonIcon sx={{ fontSize: '16px', color: '#666' }} />
                <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                  {lecture.speaker || 'Nepoznata daija'}
                </Typography>
              </Box>

              {/* Organization */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <BusinessIcon sx={{ fontSize: '16px', color: '#666' }} />
                <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                  {lecture.organization || 'Nepoznato udruženje'}
                </Typography>
              </Box>

              {/* Date */}
              {lecture?.date && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <CalendarTodayIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {formatDateWithDay(lecture.date)}
                  </Typography>
                </Box>
              )}

              {/* Time */}
              {lecture?.time && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <AccessTimeIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {lecture.time}
                  </Typography>
                </Box>
              )}

              {/* Location */}
              {/* Adresa */}
              {lecture?.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <LocationOnIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {lecture.address}
                  </Typography>
                </Box>
              )}

              {/* Mjesto */}
              {lecture?.city && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <LocationCityIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {lecture.city}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Desna strana - slika */}
          <Box sx={{ 
            width: '100px',
            height: '100px',
            marginLeft: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img
              src={imageUrl}
              alt={lecture?.title || 'Predavanje'}
              onError={(e) => {
                e.target.src = getDefaultLectureImage();
              }}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LectureCard;
