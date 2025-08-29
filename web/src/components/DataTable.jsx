import { useState, useMemo, memo, useEffect, useCallback } from 'react';
import { formatDaijaTitle } from '../utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { Skeleton } from './ui/skeleton';
import {
  Edit,
  Trash2,
  MoreVertical,
  Copy,
  X,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import RoleBadge from './RoleBadge.jsx';
import { getValue as getValueHelper, formatDate } from '@/utils/dataHelpers.js';
import { getImageUrl, getImageFallbackUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils.js';
import LoadingSkeleton from './LoadingSkeleton';

// Optimizirana komponenta za slike
const ImageCell = memo(({ src, alt, defaultSrc }) => {
  const [imageSrc, setImageSrc] = useState(getImageUrl(src) || defaultSrc);
  const [hasError, setHasError] = useState(false);
  const [attemptedOptimized, setAttemptedOptimized] = useState(false);
  
  useEffect(() => {
    setImageSrc(getImageUrl(src) || defaultSrc);
    setHasError(false);
    setAttemptedOptimized(false);
  }, [src, defaultSrc]);
  
  const handleError = () => {
    if (!hasError) {
      if (!attemptedOptimized && src) {
        // First try fallback to non-optimized version
        setAttemptedOptimized(true);
        setImageSrc(getImageFallbackUrl(src));
      } else {
        // If fallback also fails, use default image
        setHasError(true);
        setImageSrc(defaultSrc);
      }
    }
  };
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={handleError}
      className="w-12 h-12 object-cover rounded border border-gray-200"
    />
  );
});
ImageCell.displayName = 'ImageCell';

// Komponenta za akcije sa dropdown menijem
const ActionsMenu = memo(({ item, type, onEdit, onDelete, onDuplicate, onCancel, onArchive }) => {
  console.log('ActionsMenu - type:', type, 'onCancel:', !!onCancel);

  const handleEdit = () => {
    onEdit(item, type);
  };

  const handleDelete = () => {
    onDelete(item, type);
  };

  const handleDuplicate = () => {
    onDuplicate(item, type);
  };

  const handleArchive = () => {
    onArchive(item);
  };

  const handleCancel = () => {
    onCancel(item);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Uredi
          </DropdownMenuItem>
        )}
        {onDuplicate && type !== 'users' && type !== 'suggestion' && (
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Dupliraj
          </DropdownMenuItem>
        )}
        {onCancel && (type === 'lecture' || type === 'lectures') && (
          <DropdownMenuItem onClick={handleCancel}>
            <XCircle className="mr-2 h-4 w-4" />
            Otkaži
          </DropdownMenuItem>
        )}
        {onArchive && type === 'suggestion' && (
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            Arhiviraj
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Obriši
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
  onCancel,
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
    if (event.target.closest('[role="checkbox"]') || 
        event.target.closest('button') ||
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
      className={`${isSelected ? 'bg-blue-50' : ''} ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={handleRowClick}
    >
      {showSelection && (
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectItem(itemId)}
          />
        </TableCell>
      )}
      {columns.map((column) => (
        <TableCell key={column.id} className={onRowClick ? 'cursor-pointer' : ''}>
          {column.getValue(item)}
        </TableCell>
      ))}
      {showActions && !hideActions && (onEdit || onDelete || onDuplicate || onCancel || onArchive) && (
        <TableCell>
          <ActionsMenu 
            item={item}
            type={type}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onCancel={onCancel}
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
  const handleBulkAction = (action, value = null) => {
    if (action === 'status' && value) {
      onBulkStatusChange(selectedItems, value, type);
    } else if (action === 'delete') {
      onBulkDelete(selectedItems, type);
    }
  };

  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-2">
      <span className="text-sm font-medium">
        {selectedItems.length} odabrano
      </span>
      
      <div className="flex items-center gap-2">
        {type !== 'users' && onBulkStatusChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Check className="h-4 w-4 mr-2" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkAction('status', 'approved')}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Odobri odabrane
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('status', 'pending')}>
                <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                Stavi na čekanje
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('status', 'rejected')}>
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                Odbaci odabrane
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {onBulkDelete && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleBulkAction('delete')}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Obriši
          </Button>
        )}
        
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          <X className="h-4 w-4 mr-2" />
          Očisti
        </Button>
      </div>
    </div>
  );
});
BulkActionsToolbar.displayName = 'BulkActionsToolbar';

const DataTable = ({ 
  data, 
  type, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onCancel,
  onArchive,
  onStatusChange,
  onBulkStatusChange,
  onBulkDelete,
  hideActions = false,
  showActions = true,
  showStatus = true,
  showRejectionReason = false,
  onRowClick,
  isLoading = false
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);

  const getDefaultSort = useCallback(() => {
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
      case 'cancellation-reports':
        return { key: 'reportCount', direction: 'desc' };
      default:
        return { key: null, direction: 'asc' };
    }
  }, [type]);

  useEffect(() => {
    const defaultSort = getDefaultSort();
    setSortConfig(defaultSort);
  }, [type, getDefaultSort]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
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

  const sortedData = useMemo(() => {
    return data.slice().sort((a, b) => {
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
    });
  }, [data, sortConfig]);

  const getColumns = useMemo(() => {
    // Status icons with actions
    const getStatusIcons = (item) => {
      if (!onStatusChange) return null;
      
      const currentStatus = item.status || 'pending';
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {/* Current status indicator */}
            <Badge
              variant={
                currentStatus === 'approved' ? 'success' :
                currentStatus === 'pending' ? 'warning' :
                currentStatus === 'rejected' ? 'destructive' :
                currentStatus === 'cancelled' ? 'destructive' : 'secondary'
              }
            >
              {currentStatus === 'approved' ? 'Odobreno' :
               currentStatus === 'pending' ? 'Na čekanju' :
               currentStatus === 'rejected' ? 'Odbačeno' :
               currentStatus === 'cancelled' ? 'Otkazano' : 'Nepoznato'}
            </Badge>
            
            {/* Action buttons */}
            <div className="flex gap-1">
              {currentStatus !== 'approved' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange(item, 'approved')}
                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="Odobri"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              
              {currentStatus !== 'rejected' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange(item, 'rejected')}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Odbaci"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
              
              {currentStatus !== 'pending' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange(item, 'pending')}
                  className="h-7 w-7 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  title="Stavi na čekanje"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    };

    let columns = [];
    
    switch (type) {
      case 'users':
        columns = [
          { id: 'username', label: 'Korisničko ime', sortable: true, getValue: (item) => item.username || item.email },
          { id: 'email', label: 'Email', sortable: true, getValue: (item) => item.email },
          { id: 'role', label: 'Uloga', sortable: true, getValue: (item) => <RoleBadge role={item.role || 'user'} /> },
          { id: 'createdAt', label: 'Kreiran', sortable: true, getValue: (item) => formatDate(item.createdAt) }
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
            getValue: (item) => formatDaijaTitle(item.name, item.title) || 'N/A'
          },
          { id: 'description', label: 'Opis', sortable: false, getValue: (item) => {
            const description = item.description || '';
            if (!description) return '-';
            const maxLength = 60;
            return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
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
      case 'cancellation-reports':
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
          { id: 'title', label: 'Naziv predavanja', sortable: true, getValue: (item) => item.title || 'N/A' },
          { id: 'speaker', label: 'Predavač', sortable: true, getValue: (item) => item.speaker || 'N/A' },
          { id: 'date', label: 'Datum', sortable: true, getValue: (item) => {
            const date = item.date;
            return date ? formatDate(date) : 'N/A';
          }},
          { id: 'time', label: 'Vrijeme', sortable: false, getValue: (item) => item.time || 'N/A' },
          { 
            id: 'reportCount', 
            label: 'Broj prijava', 
            sortable: true, 
            getValue: (item) => (
              <Badge variant={item.reportCount >= 3 ? 'destructive' : 'warning'}>
                {`${item.reportCount}/3`}
              </Badge>
            )
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
              <div 
                className="bg-red-100 text-red-900 p-2 rounded text-xs max-w-[200px] cursor-help"
                title={reason}
              >
                {reason.length > maxLength ? reason.substring(0, maxLength) + '...' : reason}
              </div>
            );
          }
          return '-';
        }
      });
    }

    return columns;
  }, [type, showStatus, showRejectionReason, onStatusChange]);

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nema dostupnih podataka</p>
      </div>
    );
  }

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div>
      <BulkActionsToolbar
        selectedItems={selectedItems}
        onBulkStatusChange={onBulkStatusChange}
        onBulkDelete={onBulkDelete}
        onClearSelection={handleClearSelection}
        type={type}
      />
      
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={isIndeterminate ? 'opacity-50' : ''}
                />
              </TableHead>
              {getColumns.map((column) => (
                <TableHead key={column.id}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.sortKey || column.id)}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      {column.label}
                      {sortConfig.key === (column.sortKey || column.id) && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="ml-2 h-4 w-4" /> : 
                          <ChevronDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {showActions && !hideActions && (onEdit || onDelete || onDuplicate || onCancel || onArchive) && (
                <TableHead>Akcije</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRowMemo
                key={item._id || item.id}
                item={item}
                columns={getColumns}
                hideActions={hideActions}
                showActions={showActions}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onCancel={onCancel}
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
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-700">
            Redova po stranici:
          </p>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="rounded border border-gray-300 px-3 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <p className="text-sm text-gray-700">
            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, data.length)} od {data.length}
          </p>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(Math.max(0, page - 1))}
                className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              if (pageNum >= 0 && pageNum < totalPages) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                className={page === totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default DataTable;