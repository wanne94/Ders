import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { formatDate, generateDaijaSlug } from '../utils/dataHelpers';
import { getImageUrl, getDefaultDaijaImage } from '../utils/imageUtils';

const DaijaCard = ({ daija, lectureCount }) => {
  const router = useRouter();

  // Zaštita protiv undefined daija
  if (!daija) {
    return (
      <Card sx={{ 
        width: '100%',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 0 16px 0',
        padding: '16px',
      }}>
        <Typography color="error" variant="body2">
          Greška: Nema podataka o daiji
        </Typography>
      </Card>
    );
  }

  const formatDaijaName = (daija) => {
    const firstName = daija?.firstName || '';
    const lastName = daija?.lastName || '';
    
    return `${firstName} ${lastName}`.trim();
  };

  const formatDaijaTitle = (daija) => {
    const title = daija?.title || '';
    
    if (title.toLowerCase() === 'prof' || title.toLowerCase() === 'prof.') {
      return 'prof.';
    } else if (title) {
      return title.includes('.') ? title : `${title}.`;
    }
    return '';
  };

  const handleCardClick = () => {
    const slug = generateDaijaSlug(daija);
    router.push(`/profile/daija/${slug}`);
  };

  // Get proper image URL using imageUtils
  const imageUrl = getImageUrl(daija?.image) || getDefaultDaijaImage();

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
          justifyContent: 'space-between',
          height: '100%'
        }}>

          {/* Lijeva strana - sadržaj */}
          <Box sx={{ 
            flex: 1,
            paddingRight: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* Titula - mala slova iznad imena */}
            {formatDaijaTitle(daija) && (
              <Typography 
                variant="body2" 
                component="div" 
                sx={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'lowercase',
                  marginBottom: '2px',
                  textAlign: 'left',
                }}
              >
                {formatDaijaTitle(daija)}
              </Typography>
            )}

            {/* Ime i prezime */}
            <Typography 
              variant="h6" 
              component="div" 
              className="title-daija"
              sx={{
                marginBottom: '4px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
                textAlign: 'left',
                fontWeight: 600,
              }}
            >
              {formatDaijaName(daija)}
            </Typography>

            {/* Broj predavanja ispod imena */}
            {lectureCount !== undefined && (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '13px', 
                  color: '#666',
                  marginBottom: '8px',
                  textAlign: 'left',
                }}
              >
                {lectureCount} predavanja
              </Typography>
            )}

            {/* Info sekcija */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.5,
            }}>
              {/* Specijalizacija */}
              {daija?.specialization && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <SchoolIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {daija.specialization}
                  </Typography>
                </Box>
              )}

              {/* Mjesto */}
              {daija?.city && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <LocationCityIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {daija.city}
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
              alt={daija?.firstName || 'Daija'}
              onError={(e) => {
                e.target.src = getDefaultDaijaImage();
              }}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DaijaCard; 