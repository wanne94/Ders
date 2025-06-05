import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import { useRouter } from 'next/router';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BusinessIcon from '@mui/icons-material/Business';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { getImageUrl, getDefaultOrganizationImage } from '../utils/imageUtils';
import { generateOrganizationSlug } from '../utils/dataHelpers';

const OrganizationCompactCard = ({ organization }) => {
  const router = useRouter();

  // Zaštita protiv undefined organization
  if (!organization) {
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
          Greška: Nema podataka o udruženju
        </Typography>
      </Card>
    );
  }

  const imageUrl = getImageUrl(organization.image) || getDefaultOrganizationImage();

  const handleCardClick = () => {
    const slug = generateOrganizationSlug(organization);
    router.push(`/profile/organization/${slug}`);
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
            {/* Naslov */}
            <Typography 
              variant="h6" 
              component="div" 
              className="title-organization"
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
              {organization?.name || 'Bez naziva'}
            </Typography>

            {/* Info sekcija */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.5,
              marginTop: '8px'
            }}>
              {/* Kratki opis */}
              {organization?.shortDescription && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <BusinessIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {organization.shortDescription}
                  </Typography>
                </Box>
              )}

              {/* Adresa */}
              {organization?.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <LocationOnIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {organization.address}
                  </Typography>
                </Box>
              )}

              {/* Mjesto */}
              {organization?.city && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <LocationCityIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {organization.city}
                  </Typography>
                </Box>
              )}

              {/* Broj predavanja */}
              {organization?.lectureCount !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <RecordVoiceOverIcon sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666' }}>
                    {organization.lectureCount} predavanja
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
              alt={organization?.name || 'Udruženje'}
              onError={(e) => {
                e.target.src = getDefaultOrganizationImage();
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

export default OrganizationCompactCard; 