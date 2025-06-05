import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  Button,
  CardActions,
  Avatar,
  Tooltip
} from '@mui/material';
import { useRouter } from 'next/router';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Language as WebsiteIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LocationOn as LocationIcon,
  LocationCity as LocationCityIcon
} from '@mui/icons-material';
import { getImageUrl, getDefaultOrganizationImage } from '../utils/imageUtils';
import { generateOrganizationSlug } from '../utils/dataHelpers';

const OrganizationCard = ({ organization, onEdit, onDelete, showActions = true }) => {
  const router = useRouter();
  const {
    _id,
    name,
    description,
    address,
    city,
    website,
    facebook,
    instagram,
    status,
    image
  } = organization;

  const handleLearnMore = () => {
    const slug = generateOrganizationSlug(organization);
    router.push(`/profile/organization/${slug}`);
  };

  return (
    <Card sx={{ 
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      height: '100%',
      position: 'relative',
      '&:hover': {
        boxShadow: 6
      }
    }}>
      {/* Image Section */}
      <CardMedia
        component="img"
        sx={{
          width: { xs: '100%', md: 300 },
          height: { xs: 200, md: 'auto' },
          objectFit: 'cover'
        }}
        image={image || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={name}
      />

      {/* Content Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header with name and actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" component="h2" className="title-organization" gutterBottom>
              {name}
            </Typography>
            {showActions && (
              <Box>
                <IconButton onClick={() => onEdit(organization)} color="primary" size="small">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(organization)} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Status Chip */}
          <Chip
            size="small" 
            label={status === 'approved' ? 'Odobreno' : 'Neaktivno'}
            color={status === 'approved' ? 'success' : 'default'}
            sx={{ mb: 2 }}
          />

          {/* Description */}
          <Typography variant="body1" color="text.secondary" paragraph>
            {description}
          </Typography>

          {/* Contact Information */}
          <Stack spacing={1} sx={{ mb: 2 }}>
            {(address || city) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {address && city ? `${address}, ${city}` : address || city}
                </Typography>
              </Box>
            )}
            
            {website && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WebsiteIcon color="action" fontSize="small" />
                <Typography 
                  variant="body2" 
                  color="primary"
                  component="a"
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {website}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Saznaj više button */}
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleLearnMore}
            sx={{ mt: 'auto' }}
          >
            Saznaj više
          </Button>
        </CardContent>
      </Box>
    </Card>
  );
};

export default OrganizationCard; 