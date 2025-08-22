import React, { useState, useCallback, useMemo } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Chip,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { debounce } from 'lodash';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Pretraži...",
  fullWidth = true,
  showResultCount = false,
  resultCount = 0,
  sx = {}
}) => {
  const [searchValue, setSearchValue] = useState('');
  const theme = useTheme();

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      if (onSearch) {
        onSearch(value);
      }
    }, 300),
    [onSearch]
  );

  // Handle search input change
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Clear search
  const handleClear = useCallback(() => {
    setSearchValue('');
    if (onSearch) {
      onSearch('');
    }
  }, [onSearch]);

  // Handle key press (Enter key)
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      debouncedSearch.cancel();
      if (onSearch) {
        onSearch(searchValue);
      }
    }
  }, [searchValue, onSearch, debouncedSearch]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        ...sx 
      }}
    >
      <TextField
        fullWidth={fullWidth}
        variant="outlined"
        size="small"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            backgroundColor: theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
          }
        }}
        sx={{
          '& .MuiInputBase-input': {
            py: 1,
          }
        }}
      />
      
      {showResultCount && searchValue && (
        <Chip
          label={`${resultCount} rezultata`}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
    </Box>
  );
};

export default SearchBar;