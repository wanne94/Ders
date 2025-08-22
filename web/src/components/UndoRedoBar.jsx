import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  Fade
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const UndoRedoBar = ({ 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo, 
  onReset,
  lastAction,
  visible = true 
}) => {
  if (!visible) return null;

  return (
    <Fade in={visible}>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          zIndex: 1000,
          backgroundColor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Tooltip title="Poništi" placement="top">
          <span>
            <IconButton
              onClick={onUndo}
              disabled={!canUndo}
              color="primary"
              size="small"
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Ponovi" placement="top">
          <span>
            <IconButton
              onClick={onRedo}
              disabled={!canRedo}
              color="primary"
              size="small"
            >
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>

        {onReset && (
          <Tooltip title="Resetuj" placement="top">
            <IconButton
              onClick={onReset}
              color="secondary"
              size="small"
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        )}

        {lastAction && (
          <Box sx={{ ml: 1, px: 1, borderLeft: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              {lastAction}
            </Typography>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default UndoRedoBar;