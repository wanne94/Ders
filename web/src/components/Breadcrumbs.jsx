import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  Chip
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { useRouter } from 'next/router';

const Breadcrumbs = ({ items = [], current, showHome = true }) => {
  const router = useRouter();

  const handleClick = (path) => {
    if (path) {
      router.push(path);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {showHome && (
          <Link
            underline="hover"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main'
              }
            }}
            color="inherit"
            onClick={() => handleClick('/')}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Početna
          </Link>
        )}
        
        {items.map((item, index) => (
          <Link
            key={index}
            underline="hover"
            color="inherit"
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main'
              }
            }}
            onClick={() => handleClick(item.path)}
          >
            {item.icon && (
              <Box component="span" sx={{ mr: 0.5, display: 'inline-flex', verticalAlign: 'middle' }}>
                {item.icon}
              </Box>
            )}
            {item.label}
          </Link>
        ))}
        
        {current && (
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            {current.icon && (
              <Box component="span" sx={{ mr: 0.5, display: 'inline-flex' }}>
                {current.icon}
              </Box>
            )}
            {current.label}
            {current.count !== undefined && (
              <Chip 
                label={current.count} 
                size="small" 
                sx={{ ml: 1 }}
                color="primary"
              />
            )}
          </Typography>
        )}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;