import React from 'react';
import { Box, Checkbox, Paper } from '@mui/material';
import UniversalCard from './UniversalCard';

const SelectableCard = ({ data, isSelected, onSelect, isAdmin }) => {
  if (!isAdmin) {
    return <UniversalCard data={data} />;
  }

  return (
    <Paper 
      sx={{ 
        position: 'relative',
        height: '100%',
        border: isSelected ? '2px solid primary.main' : 'none',
        transition: 'all 0.2s ease'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 10,
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(data._id)}
          onClick={(e) => e.stopPropagation()}
        />
      </Box>
      <UniversalCard data={data} />
    </Paper>
  );
};

export default SelectableCard;