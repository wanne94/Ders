import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';

const KeyboardShortcutsDialog = ({ open, onClose, shortcuts = {} }) => {
  const formatKey = (key) => {
    return key
      .split('+')
      .map(part => {
        switch(part) {
          case 'ctrl': return 'Ctrl';
          case 'shift': return 'Shift';
          case 'alt': return 'Alt';
          case 'escape': return 'Esc';
          default: return part.toUpperCase();
        }
      })
      .map((part, index) => (
        <Chip 
          key={index} 
          label={part} 
          size="small" 
          sx={{ mr: index < key.split('+').length - 1 ? 0.5 : 0 }}
        />
      ));
  };

  const categorizeShortcuts = () => {
    const categories = {
      navigation: [],
      actions: [],
      view: [],
      selection: [],
      other: []
    };

    Object.entries(shortcuts).forEach(([key, value]) => {
      const shortcut = { key, ...value };
      
      if (key.includes('alt+') || /^\d$/.test(key)) {
        categories.navigation.push(shortcut);
      } else if (key.includes('ctrl+n') || key.includes('ctrl+e') || key.includes('ctrl+d') || key.includes('ctrl+s')) {
        categories.actions.push(shortcut);
      } else if (key.includes('ctrl+shift+')) {
        categories.view.push(shortcut);
      } else if (key.includes('ctrl+a') || key === 'escape') {
        categories.selection.push(shortcut);
      } else {
        categories.other.push(shortcut);
      }
    });

    return categories;
  };

  const categories = categorizeShortcuts();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <KeyboardIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Keyboard Shortcuts</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {Object.entries(categories).map(([category, categoryShortcuts]) => (
          categoryShortcuts.length > 0 && (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'capitalize' }}>
                {category === 'other' ? 'Ostalo' : category}
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Prečica</TableCell>
                      <TableCell>Opis</TableCell>
                      <TableCell align="center">Ikona</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryShortcuts.map((shortcut) => (
                      <TableRow key={shortcut.key}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {formatKey(shortcut.key)}
                          </Box>
                        </TableCell>
                        <TableCell>{shortcut.description || shortcut.key}</TableCell>
                        <TableCell align="center">
                          {shortcut.icon && (
                            <Typography variant="h6">{shortcut.icon}</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )
        ))}
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            💡 Savjet: Pritisnite <Chip label="Ctrl" size="small" /> + <Chip label="/" size="small" /> bilo kada da otvorite ovaj dijalog
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Zatvori</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyboardShortcutsDialog;