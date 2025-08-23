import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Checkbox,
  Chip,
  Switch,
  FormControlLabel,
  Typography
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';

const DraggableDataTable = ({
  data = [],
  type,
  onEdit,
  onDelete,
  onDuplicate,
  onCancel,
  onStatusChange,
  onBulkStatusChange,
  onBulkDelete,
  onReorder,
  hideActions = false,
  showActions = true,
  showStatus = true,
  showRejectionReason = false,
  dragEnabled = false
}) => {
  const [localData, setLocalData] = useState(data);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDragMode, setIsDragMode] = useState(dragEnabled);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalData(items);
    
    if (onReorder) {
      onReorder(items);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedItems(localData.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Odobreno';
      case 'pending':
        return 'Na čekanju';
      case 'rejected':
        return 'Odbijeno';
      case 'cancelled':
        return 'Otkazano';
      default:
        return status;
    }
  };

  const renderTableHeaders = () => {
    const headers = [];
    
    if (isDragMode) {
      headers.push(<TableCell key="drag" width={50}></TableCell>);
    }
    
    if (showActions) {
      headers.push(
        <TableCell key="select" padding="checkbox">
          <Checkbox
            indeterminate={selectedItems.length > 0 && selectedItems.length < localData.length}
            checked={localData.length > 0 && selectedItems.length === localData.length}
            onChange={handleSelectAll}
          />
        </TableCell>
      );
    }

    // Add type-specific headers
    switch (type) {
      case 'lecture':
      case 'lectures':
        headers.push(
          <TableCell key="title">Naslov</TableCell>,
          <TableCell key="speaker">Predavač</TableCell>,
          <TableCell key="date">Datum</TableCell>,
          <TableCell key="organization">Organizacija</TableCell>
        );
        break;
      case 'daija':
      case 'daije':
        headers.push(
          <TableCell key="title">Ime</TableCell>,
          <TableCell key="description">Opis</TableCell>,
          <TableCell key="createdAt">Kreiran</TableCell>
        );
        break;
      case 'organization':
      case 'organizations':
        headers.push(
          <TableCell key="name">Naziv</TableCell>,
          <TableCell key="city">Grad</TableCell>,
          <TableCell key="address">Adresa</TableCell>
        );
        break;
      case 'user':
      case 'users':
        headers.push(
          <TableCell key="username">Korisničko ime</TableCell>,
          <TableCell key="email">Email</TableCell>,
          <TableCell key="role">Uloga</TableCell>
        );
        break;
      default:
        headers.push(<TableCell key="info">Informacije</TableCell>);
    }

    if (showStatus) {
      headers.push(<TableCell key="status" align="center">Status</TableCell>);
    }

    if (showRejectionReason) {
      headers.push(<TableCell key="reason">Razlog odbijanja</TableCell>);
    }

    if (showActions && !hideActions) {
      headers.push(<TableCell key="actions" align="right">Akcije</TableCell>);
    }

    return headers;
  };

  const renderTableRow = (item, index) => {
    const cells = [];

    if (isDragMode) {
      cells.push(
        <TableCell key="drag">
          <DragIndicatorIcon color="action" />
        </TableCell>
      );
    }

    if (showActions) {
      cells.push(
        <TableCell key="select" padding="checkbox">
          <Checkbox
            checked={selectedItems.includes(item._id)}
            onChange={() => handleSelectItem(item._id)}
          />
        </TableCell>
      );
    }

    // Add type-specific cells
    switch (type) {
      case 'lecture':
      case 'lectures':
        cells.push(
          <TableCell key="title">{item.title}</TableCell>,
          <TableCell key="speaker">{item.speaker}</TableCell>,
          <TableCell key="date">
            {item.date ? new Date(item.date).toLocaleDateString('bs-BA') : '-'}
          </TableCell>,
          <TableCell key="organization">{item.organization || '-'}</TableCell>
        );
        break;
      case 'daija':
      case 'daije':
        cells.push(
          <TableCell key="title">{item.title || item.name}</TableCell>,
          <TableCell key="description">
            {item.description ? item.description.substring(0, 100) + '...' : '-'}
          </TableCell>,
          <TableCell key="createdAt">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('bs-BA') : '-'}
          </TableCell>
        );
        break;
      case 'organization':
      case 'organizations':
        cells.push(
          <TableCell key="name">{item.name}</TableCell>,
          <TableCell key="city">{item.city || '-'}</TableCell>,
          <TableCell key="address">{item.address || '-'}</TableCell>
        );
        break;
      case 'user':
      case 'users':
        cells.push(
          <TableCell key="username">{item.username}</TableCell>,
          <TableCell key="email">{item.email}</TableCell>,
          <TableCell key="role">
            <Chip 
              label={item.role} 
              size="small" 
              color={item.role === 'super_admin' ? 'error' : item.role === 'admin' ? 'warning' : 'default'}
            />
          </TableCell>
        );
        break;
      default:
        cells.push(
          <TableCell key="info">{JSON.stringify(item).substring(0, 100)}</TableCell>
        );
    }

    if (showStatus && item.status) {
      cells.push(
        <TableCell key="status" align="center">
          <Chip
            label={getStatusText(item.status)}
            color={getStatusColor(item.status)}
            size="small"
          />
        </TableCell>
      );
    }

    if (showRejectionReason) {
      cells.push(
        <TableCell key="reason">{item.rejectionReason || '-'}</TableCell>
      );
    }

    if (showActions && !hideActions) {
      cells.push(
        <TableCell key="actions" align="right">
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
            {onEdit && (
              <Tooltip title="Uredi">
                <IconButton size="small" onClick={() => onEdit(item, type)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDuplicate && (
              <Tooltip title="Dupliciraj">
                <IconButton size="small" onClick={() => onDuplicate(item, type)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onCancel && item.status !== 'cancelled' && (
              <Tooltip title="Otkaži">
                <IconButton size="small" onClick={() => onCancel(item)}>
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onStatusChange && item.status === 'pending' && (
              <>
                <Tooltip title="Odobri">
                  <IconButton 
                    size="small" 
                    color="success"
                    onClick={() => onStatusChange(item, type, 'approved')}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Odbij">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onStatusChange(item, type, 'rejected')}
                  >
                    <BlockIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {onDelete && (
              <Tooltip title="Obriši">
                <IconButton size="small" color="error" onClick={() => onDelete(item, type)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      );
    }

    return cells;
  };

  if (!isDragMode) {
    // Regular table without drag & drop
    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={
              <Switch
                checked={isDragMode}
                onChange={(e) => setIsDragMode(e.target.checked)}
              />
            }
            label="Način reorganizacije"
          />
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>{renderTableHeaders()}</TableRow>
            </TableHead>
            <TableBody>
              {localData.map((item, index) => (
                <TableRow key={item._id} hover>
                  {renderTableRow(item, index)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedItems.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="body2">
              {selectedItems.length} stavki selektovano
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              {onBulkStatusChange && (
                <>
                  <IconButton 
                    size="small" 
                    color="success"
                    onClick={() => onBulkStatusChange(selectedItems, 'approved')}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onBulkStatusChange(selectedItems, 'rejected')}
                  >
                    <BlockIcon />
                  </IconButton>
                </>
              )}
              {onBulkDelete && (
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => onBulkDelete(selectedItems)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // Drag & Drop mode
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Povucite stavke da promijenite redoslijed
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isDragMode}
              onChange={(e) => setIsDragMode(e.target.checked)}
            />
          }
          label="Način reorganizacije"
        />
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="table">
          {(provided) => (
            <TableContainer 
              component={Paper}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <Table>
                <TableHead>
                  <TableRow>{renderTableHeaders()}</TableRow>
                </TableHead>
                <TableBody>
                  {localData.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          hover
                          sx={{
                            backgroundColor: snapshot.isDragging ? 'action.hover' : 'inherit',
                            ...(snapshot.isDragging && {
                              display: 'table',
                              tableLayout: 'fixed',
                              width: '100%'
                            })
                          }}
                        >
                          {renderTableRow(item, index)}
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default DraggableDataTable;