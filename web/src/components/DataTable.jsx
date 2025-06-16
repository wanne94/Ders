import { useState, useMemo, memo, useEffect } from 'react';
import { formatDaijaTitle } from '../utils';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton, Chip,
    Typography, MenuItem,
    TablePagination,
    Menu,
    ListItemIcon,
    ListItemText,
    TableSortLabel,
    Checkbox,
    Toolbar,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RoleBadge from './RoleBadge.jsx';
import { getValue as getValueHelper, formatDate } from '@/utils/dataHelpers.js';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils.js';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import ArchiveIcon from '@mui/icons-material/Archive';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// Optimizirana komponenta za slike - koristi background-image (nema broken icon)
const ImageCell = memo(({ src, alt, defaultSrc }) => {
  const [imageSrc, setImageSrc] = useState(getImageUrl(src) || defaultSrc);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    setImageSrc(getImageUrl(src) || defaultSrc);
    setHasError(false);
  }, [src, defaultSrc]);
  
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(defaultSrc);
    }
  };
  
  return (
    <Box
      component="img"
      src={imageSrc}
      alt={alt}
      onError={handleError}
      sx={{
        width: 50,
        height: 50,
        objectFit: 'cover',
        borderRadius: 1,
        border: '1px solid #e0e0e0'
      }}
    />
  );
});
ImageCell.displayName = 'ImageCell';

// Komponenta za akcije sa dropdown menijem
const ActionsMenu = memo(({ item, type, onEdit, onDelete, onDuplicate, onArchive }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(item, type);
    handleClose();
  };

  const handleDelete = () => {
    onDelete(item, type);
    handleClose();
  };

  const handleDuplicate = () => {
    onDuplicate(item, type);
    handleClose();
  };

  const handleArchive = () => {
    onArchive(item);
    handleClose();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ 
          '&:hover': { 
            backgroundColor: 'rgba(0, 0, 0, 0.04)' 
          }
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {onEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Uredi</ListItemText>
          </MenuItem>
        )}
        {onDuplicate && type !== 'users' && type !== 'suggestion' && (
          <MenuItem onClick={handleDuplicate}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dupliraj</ListItemText>
          </MenuItem>
        )}
        {onArchive && type === 'suggestion' && (
          <MenuItem onClick={handleArchive}>
            <ListItemIcon>
              <ArchiveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Arhiviraj</ListItemText>
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Obriši</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
});
ActionsMenu.displayName = 'ActionsMenu';

// Komponenta za red u tabeli
const TableRowMemo = memo(({ 
  item, 
  columns, 
  hideActions, 
  showActions, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onArchive, 
  type,
  isSelected,
  onSelectItem,
  showSelection = false,
  onRowClick
}) => {
  const itemId = item._id || item.id;
  
  const handleRowClick = (event) => {
    // Don't trigger row click if clicking on checkbox or actions
    if (event.target.closest('.MuiCheckbox-root') || 
        event.target.closest('.MuiIconButton-root') ||
        event.target.closest('[role="button"]')) {
      return;
    }
    
    if (onRowClick) {
      onRowClick(item);
    }
  };
  
  return (
    <TableRow 
      key={itemId} 
      selected={isSelected}
      onClick={handleRowClick}
      sx={{ 
        cursor: onRowClick ? 'pointer' : 'default',
        '&:hover': onRowClick ? {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        } : {}
      }}
    >
      {showSelection && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected}
            onChange={() => onSelectItem(itemId)}
            color="primary"
          />
        </TableCell>
      )}
      {columns.map((column) => (
        <TableCell key={column.id} sx={{ cursor: onRowClick ? 'pointer' : 'default' }}>
          {column.getValue(item)}
        </TableCell>
      ))}
      {showActions && !hideActions && (onEdit || onDelete || onDuplicate || onArchive) && (
        <TableCell>
          <ActionsMenu 
            item={item}
            type={type}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
          />
        </TableCell>
      )}
    </TableRow>
  );
});
TableRowMemo.displayName = 'TableRowMemo';

// Komponenta za bulk akcije
const BulkActionsToolbar = memo(({ 
  selectedItems, 
  onBulkStatusChange, 
  onBulkDelete, 
  onClearSelection, 
  type 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleBulkAction = (action, value = null) => {
    if (action === 'status' && value) {
      onBulkStatusChange(selectedItems, value, type);
    } else if (action === 'delete') {
      onBulkDelete(selectedItems, type);
    }
    handleMenuClose();
  };

  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        bgcolor: 'rgba(25, 118, 210, 0.08)',
        borderRadius: 1,
        mb: 1
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%' }}
        color="inherit"
        variant="subtitle1"
        component="div"
      >
        {selectedItems.length} odabrano
      </Typography>
      
      {type !== 'users' && onBulkStatusChange && (
        <Tooltip title="Promijeni status">
          <IconButton onClick={handleMenuOpen}>
            <CheckIcon />
          </IconButton>
        </Tooltip>
      )}
      
      {onBulkDelete && (
        <Tooltip title="Obriši odabrane">
          <IconButton onClick={() => handleBulkAction('delete')}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
      
      <Tooltip title="Očisti odabir">
        <IconButton onClick={onClearSelection}>
          <CloseIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleBulkAction('status', 'approved')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Odobri odabrane</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('status', 'pending')}>
          <ListItemIcon>
            <PendingIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Stavi na čekanje</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('status', 'rejected')}>
          <ListItemIcon>
            <CloseIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Odbaci odabrane</ListItemText>
        </MenuItem>
      </Menu>
    </Toolbar>
  );
});
BulkActionsToolbar.displayName = 'BulkActionsToolbar';

const DataTable = ({ 
  data, 
  type, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onArchive,
  onStatusChange,
  onBulkStatusChange,
  onBulkDelete,
  hideActions = false,
  showActions = true,
  showStatus = true,
  showRejectionReason = false,
  onRowClick
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);

  const getDefaultSort = () => {
    switch (type) {
      case 'lecture':
      case 'lectures':
        return { key: 'date', direction: 'desc' };
      case 'users':
        return { key: 'createdAt', direction: 'desc' };
      case 'daija':
      case 'daije':
        return { key: 'name', direction: 'asc' };
      case 'organization':
      case 'organizations':
        return { key: 'name', direction: 'asc' };
      case 'suggestion':
      case 'suggestions':
        return { key: 'createdAt', direction: 'desc' };
      default:
        return { key: null, direction: 'asc' };
    }
  };

  useEffect(() => {
    const defaultSort = getDefaultSort();
    setSortConfig(defaultSort);
  }, [type]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((item) => item._id || item.id);
      setSelectedItems(newSelected);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    const selectedIndex = selectedItems.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedItems, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedItems.slice(1));
    } else if (selectedIndex === selectedItems.length - 1) {
      newSelected = newSelected.concat(selectedItems.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedItems.slice(0, selectedIndex),
        selectedItems.slice(selectedIndex + 1),
      );
    }

    setSelectedItems(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const isSelected = (id) => selectedItems.indexOf(id) !== -1;
  const isAllSelected = data.length > 0 && selectedItems.length === data.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  // Status icons with actions
  const getStatusIcons = (item) => {
    if (!onStatusChange) return null;
    
    const currentStatus = item.status || 'pending';
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Current status indicator */}
          <Chip
            size="small"
            label={
              currentStatus === 'approved' ? 'Odobreno' :
              currentStatus === 'pending' ? 'Na čekanju' :
              currentStatus === 'rejected' ? 'Odbačeno' : 'Nepoznato'
            }
            color={
              currentStatus === 'approved' ? 'success' :
              currentStatus === 'pending' ? 'warning' :
              currentStatus === 'rejected' ? 'error' : 'default'
            }
            sx={{ minWidth: 80 }}
          />
          
          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {currentStatus !== 'approved' && (
              <Tooltip title="Odobri">
                <IconButton
                  size="small"
                  onClick={() => onStatusChange(item, 'approved')}
                  sx={{ 
                    color: 'success.main',
                    '&:hover': { bgcolor: 'success.light', color: 'white' }
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {currentStatus !== 'rejected' && (
              <Tooltip title="Odbaci">
                <IconButton
                  size="small"
                  onClick={() => onStatusChange(item, 'rejected')}
                  sx={{ 
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.light', color: 'white' }
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {currentStatus !== 'pending' && (
              <Tooltip title="Stavi na čekanje">
                <IconButton
                  size="small"
                  onClick={() => onStatusChange(item, 'pending')}
                  sx={{ 
                    color: 'warning.main',
                    '&:hover': { bgcolor: 'warning.light', color: 'white' }
                  }}
                >
                  <PendingIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const getColumns = useMemo(() => {
    let columns = [];
    
    switch (type) {
      case 'users':
        columns = [
          { id: 'username', label: 'Korisničko ime', sortable: true, getValue: (item) => item.username || item.email },
          { id: 'email', label: 'Email', sortable: true, getValue: (item) => item.email },
          { id: 'role', label: 'Uloga', sortable: true, getValue: (item) => <RoleBadge role={item.role || 'user'} /> },
          { id: 'createdAt', label: 'Kreiran', sortable: true, getValue: (item) => new Date(item.createdAt).toLocaleDateString('hr-HR') }
        ];
        break;
      case 'lecture':
      case 'lectures':
        columns = [
          { 
            id: 'image', 
            label: 'Slika', 
            sortable: false,
            getValue: (item) => (
              <ImageCell 
                src={item?.image || null} 
                alt={item?.title || 'Lecture'} 
                defaultSrc={getDefaultLectureImage()}
              />
            )
          },
          { id: 'title', label: 'Naslov', sortable: true, sortKey: 'title', getValue: (item) => item.title || 'N/A' },
          { id: 'speaker', label: 'Daija', sortable: true, sortKey: 'speaker', getValue: (item) => {
            if (item.daija && typeof item.daija === 'object') {
              return formatDaijaTitle(item.daija.name, item.daija.title) || 'N/A';
            }
            return item.speaker || 'N/A';
          }},
          { id: 'organization', label: 'Udruženje', sortable: true, sortKey: 'organization', getValue: (item) => item.organization || 'N/A' },
          { id: 'date', label: 'Datum', sortable: true, sortKey: 'date', getValue: (item) => {
            const date = item.date;
            return date ? formatDate(date) : 'N/A';
          }},
          { id: 'time', label: 'Vrijeme', sortable: false, getValue: (item) => item.time || 'N/A' },
          { id: 'location', label: 'Lokacija', sortable: false, getValue: (item) => {
            const address = item.address;
            const city = item.city;
            return `${address}, ${city}`.replace(/^, |, $/, '') || 'N/A';
          }}
        ];
        break;
      case 'daija':
      case 'daije':
        columns = [
          { 
            id: 'image', 
            label: 'Slika', 
            sortable: false,
            getValue: (item) => (
              <ImageCell 
                src={item?.image || null} 
                alt={item?.name || 'Daija'} 
                defaultSrc={getDefaultDaijaImage()}
              />
            )
          },
          { 
            id: 'name', 
            label: 'Ime i Prezime', 
            sortable: true,
            sortKey: 'name',
            getValue: (item) => item.name || 'N/A'
          },
          { id: 'title', label: 'Titula', sortable: true, sortKey: 'title', getValue: (item) => item.title || 'N/A' },
          { id: 'biography', label: 'Biografija', sortable: false, getValue: (item) => {
            const biography = item.biography || 'N/A';
            if (biography === 'N/A') return biography;
            const maxLength = 40
            return biography.length > maxLength ? biography.substring(0, maxLength) + '...' : biography;
          }}
        ];
        break;
      case 'organization':
      case 'organizations':
        columns = [
          { 
            id: 'image', 
            label: 'Logo', 
            sortable: false,
            getValue: (item) => (
              <ImageCell 
                src={item?.image || null} 
                alt={item?.name || 'Organization'} 
                defaultSrc={getDefaultOrganizationImage()}
              />
            )
          },
          { id: 'name', label: 'Naziv', sortable: true, sortKey: 'name', getValue: (item) => item.name || 'N/A' },
          { id: 'description', label: 'Opis', sortable: false, getValue: (item) => item.description || 'N/A' },
          { id: 'address', label: 'Adresa', sortable: true, sortKey: 'address', getValue: (item) => item.address || 'N/A' },
          { id: 'city', label: 'Mjesto', sortable: true, sortKey: 'city', getValue: (item) => item.city || 'N/A' },
        ];
        break;
      case 'suggestion':
      case 'suggestions':
        columns = [
          { 
            id: 'targetName', 
            label: 'Cilj', 
            sortable: true,
            sortKey: 'targetName',
            getValue: (item) => item.targetName || 'N/A'
          },
          { 
            id: 'targetType', 
            label: 'Tip', 
            sortable: true,
            sortKey: 'targetType',
            getValue: (item) => {
              if (item.targetType === 'organization') return 'Udruženje';
              if (item.targetType === 'daija') return 'Daija';
              if (item.targetType === 'general') return 'Općenito';
              return 'Nepoznato';
            }
          },
          { 
            id: 'submitterName', 
            label: 'Pošaljilac', 
            sortable: false,
            getValue: (item) => {
              if (item.submittedBy?.username) {
                return item.submittedBy.username;
              }
              return item.submitterName || item.submitterEmail || 'Anoniman';
            }
          },
          { 
            id: 'reason', 
            label: 'Prijedlog', 
            sortable: false,
            getValue: (item) => {
              const reason = item.reason || 'N/A';
              if (reason === 'N/A') return reason;
              const maxLength = 60;
              return reason.length > maxLength ? reason.substring(0, maxLength) + '...' : reason;
            }
          },
          { 
            id: 'createdAt', 
            label: 'Datum', 
            sortable: true,
            sortKey: 'createdAt',
            getValue: (item) => {
              const date = item.createdAt;
              return date ? formatDate(date) : 'N/A';
            }
          }
        ];
        break;
      default:
        columns = [];
    }

    // Add status column if showStatus is true and type is not 'users'
    if (showStatus && columns.length > 0 && type !== 'users') {
      columns.push({ id: 'status', label: 'Status', sortable: true, sortKey: 'status', getValue: getStatusIcons });
    }

    // Add rejection reason column if showRejectionReason is true
    if (showRejectionReason && columns.length > 0 && type !== 'users') {
      columns.push({ 
        id: 'rejectionReason', 
        label: 'Razlog odbijanja', 
        sortable: false, 
        getValue: (item) => {
          if (item.status === 'rejected' && item.rejectionReason) {
            const reason = item.rejectionReason;
            const maxLength = 50;
            return (
              <Tooltip title={reason} arrow>
                <Box sx={{ 
                  bgcolor: 'error.light', 
                  color: 'error.contrastText',
                  p: 1, 
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  maxWidth: 200,
                  cursor: 'help'
                }}>
                  <Typography variant="caption">
                    {reason.length > maxLength ? reason.substring(0, maxLength) + '...' : reason}
                  </Typography>
                </Box>
              </Tooltip>
            );
          }
          return '-';
        }
      });
    }

    return columns;
  }, [type, getStatusIcons, showStatus, showRejectionReason]);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Nema dostupnih podataka
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <BulkActionsToolbar
        selectedItems={selectedItems}
        onBulkStatusChange={onBulkStatusChange}
        onBulkDelete={onBulkDelete}
        onClearSelection={handleClearSelection}
        type={type}
      />
      
      <TableContainer component={Paper} sx={{ mt: 1, borderRadius: 0, boxShadow: 'none', width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  color="primary"
                />
              </TableCell>
              {getColumns.map((column) => (
                <TableCell key={column.id}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortConfig.key === (column.sortKey || column.id)}
                      direction={sortConfig.key === (column.sortKey || column.id) ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort(column.sortKey || column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {showActions && !hideActions && (onEdit || onDelete || onDuplicate || onArchive) && (
                <TableCell>Akcije</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice()
              .sort((a, b) => {
                if (!sortConfig.key) return 0;
                
                const aValue = getValueHelper(a, sortConfig.key);
                const bValue = getValueHelper(b, sortConfig.key);
                
                if (aValue < bValue) {
                  return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                  return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
              })
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRowMemo
                  key={item._id || item.id}
                  item={item}
                  columns={getColumns}
                  hideActions={hideActions}
                  showActions={showActions}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onArchive={onArchive}
                  type={type}
                  isSelected={isSelected(item._id || item.id)}
                  onSelectItem={handleSelectItem}
                  showSelection={true}
                  onRowClick={onRowClick}
                />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Redova po stranici:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} od ${count}`}
      />
    </Box>
  );
};

export default DataTable; 