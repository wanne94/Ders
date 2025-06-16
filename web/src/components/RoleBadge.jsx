import React from 'react';
import { Box, Typography } from '@mui/material';

const ROLE_CONFIG = {
  user: { label: 'K', bg: '#BDBDBD', color: '#fff' },
  admin: { label: 'A', bg: '#4CAF50', color: '#fff' },
  'super admin': { label: 'SA', bg: '#800000', color: '#fff' },
  'super_admin': { label: 'SA', bg: '#800000', color: '#fff' },
};

export default function RoleBadge({ role }) {
  const key = role?.toLowerCase() || 'user';
  const { label, bg, color } = ROLE_CONFIG[key] || ROLE_CONFIG.user;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 32,
        height: 32,
        borderRadius: 1,        // theme.spacing(1) = 8px
        bgcolor: bg,
        color,
        fontWeight: 'bold',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </Box>
  );
} 