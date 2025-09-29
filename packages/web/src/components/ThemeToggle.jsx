import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ size = 'default', showTooltip = true }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const buttonSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'icon';

  const button = (
    <Button 
      onClick={toggleTheme} 
      variant="ghost" 
      size={buttonSize}
      className="relative"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Promijeni temu</span>
    </Button>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{isDarkMode ? 'Prebaci na svjetlu temu' : 'Prebaci na tamnu temu'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

export default ThemeToggle;