import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ size = 'medium', showTooltip = true }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const button = (
    <IconButton onClick={toggleTheme} color="inherit" size={size}>
      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip title={isDarkMode ? 'Prebaci na svjetlu temu' : 'Prebaci na tamnu temu'}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default ThemeToggle;