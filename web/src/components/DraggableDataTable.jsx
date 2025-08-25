import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
import { Switch } from './ui/switch';
import {
  GripVertical,
  Edit,
  Trash2,
  Copy,
  X,
  Eye,
  Ban
} from 'lucide-react';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';
import { formatDaijaTitle } from '@/utils';

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
  const [hoveredImage, setHoveredImage] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const handleSelectAll = (checked) => {
    if (checked) {
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

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
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
      headers.push(<TableHead key="drag" className="w-12"></TableHead>);
    }
    
    if (showActions) {
      headers.push(
        <TableHead key="select" className="w-12">
          <Checkbox
            checked={localData.length > 0 && selectedItems.length === localData.length}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
            className={selectedItems.length > 0 && selectedItems.length < localData.length ? 'opacity-50' : ''}
          />
        </TableHead>
      );
    }

    // Add type-specific headers
    switch (type) {
      case 'lecture':
      case 'lectures':
        headers.push(
          <TableHead key="image" className="w-16">Slika</TableHead>,
          <TableHead key="title">Naslov</TableHead>,
          <TableHead key="speaker">Predavač</TableHead>,
          <TableHead key="date">Datum</TableHead>,
          <TableHead key="time">Vrijeme</TableHead>,
          <TableHead key="organization">Organizacija</TableHead>
        );
        break;
      case 'daija':
      case 'daije':
        headers.push(
          <TableHead key="image" className="w-16">Slika</TableHead>,
          <TableHead key="title">Ime</TableHead>,
          <TableHead key="description">Opis</TableHead>
        );
        break;
      case 'organization':
      case 'organizations':
        headers.push(
          <TableHead key="image" className="w-16">Slika</TableHead>,
          <TableHead key="name">Naziv</TableHead>,
          <TableHead key="city">Grad</TableHead>,
          <TableHead key="address">Adresa</TableHead>
        );
        break;
      case 'user':
      case 'users':
        headers.push(
          <TableHead key="username">Korisničko ime</TableHead>,
          <TableHead key="email">Email</TableHead>,
          <TableHead key="role">Uloga</TableHead>
        );
        break;
      default:
        headers.push(<TableHead key="info">Informacije</TableHead>);
    }

    if (showStatus) {
      headers.push(<TableHead key="status" className="text-center">Status</TableHead>);
    }

    if (showRejectionReason) {
      headers.push(<TableHead key="reason">Razlog odbijanja</TableHead>);
    }

    if (showActions && !hideActions) {
      headers.push(<TableHead key="actions" className="text-right">Akcije</TableHead>);
    }

    return headers;
  };

  const renderTableRow = (item, index) => {
    const cells = [];

    if (isDragMode) {
      cells.push(
        <TableCell key="drag" className="w-12">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </TableCell>
      );
    }

    if (showActions) {
      cells.push(
        <TableCell key="select" className="w-12">
          <Checkbox
            checked={selectedItems.includes(item._id)}
            onCheckedChange={() => handleSelectItem(item._id)}
          />
        </TableCell>
      );
    }

    // Add type-specific cells
    switch (type) {
      case 'lecture':
      case 'lectures':
        const formatDate = (dateString) => {
          if (!dateString) return '-';
          const date = new Date(dateString);
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          return `${day}.${month}.${year}`;
        };
        
        cells.push(
          <TableCell key="image" className="w-16">
            <div 
              className="relative"
              onMouseEnter={(e) => {
                setHoveredImage(getImageUrl(item.image) || getDefaultLectureImage());
                setMousePosition({ x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                setMousePosition({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <img 
                src={getImageUrl(item.image) || getDefaultLectureImage()} 
                alt={item.title} 
                className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                onError={(e) => { 
                  e.target.src = getDefaultLectureImage();
                }}
              />
            </div>
          </TableCell>,
          <TableCell key="title">
            <div className="max-w-xs truncate" title={item.title}>
              {item.title}
            </div>
          </TableCell>,
          <TableCell key="speaker">
            {item.daija && typeof item.daija === 'object' 
              ? formatDaijaTitle(item.daija.name, item.daija.title)
              : item.speaker || '-'
            }
          </TableCell>,
          <TableCell key="date">{formatDate(item.date)}</TableCell>,
          <TableCell key="time">{item.time || '-'}</TableCell>,
          <TableCell key="organization">{item.organization || '-'}</TableCell>
        );
        break;
      case 'daija':
      case 'daije':
        cells.push(
          <TableCell key="image" className="w-16">
            <div 
              className="relative"
              onMouseEnter={(e) => {
                setHoveredImage(getImageUrl(item.image) || getDefaultDaijaImage());
                setMousePosition({ x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                setMousePosition({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <img 
                src={getImageUrl(item.image) || getDefaultDaijaImage()} 
                alt={item.title || item.name} 
                className="w-12 h-12 rounded-full object-cover cursor-pointer"
                onError={(e) => { 
                  e.target.src = getDefaultDaijaImage();
                }}
              />
            </div>
          </TableCell>,
          <TableCell key="title">{formatDaijaTitle(item.name, item.title)}</TableCell>,
          <TableCell key="description">
            <div className="max-w-md line-clamp-2">
              {item.shortDescription || item.biography || '-'}
            </div>
          </TableCell>
        );
        break;
      case 'organization':
      case 'organizations':
        cells.push(
          <TableCell key="image" className="w-16">
            <div 
              className="relative"
              onMouseEnter={(e) => {
                setHoveredImage(getImageUrl(item.image) || getDefaultOrganizationImage());
                setMousePosition({ x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                setMousePosition({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <img 
                src={getImageUrl(item.image) || getDefaultOrganizationImage()} 
                alt={item.name} 
                className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                onError={(e) => { 
                  e.target.src = getDefaultOrganizationImage();
                }}
              />
            </div>
          </TableCell>,
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
            <Badge 
              variant={item.role === 'super_admin' ? 'destructive' : item.role === 'admin' ? 'warning' : 'secondary'}
            >
              {item.role}
            </Badge>
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
        <TableCell key="status" className="text-center">
          <Badge variant={getStatusVariant(item.status)}>
            {getStatusText(item.status)}
          </Badge>
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
        <TableCell key="actions" className="text-right">
          <div className="flex gap-1 justify-end">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(item, type)}
                title="Uredi"
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDuplicate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDuplicate(item, type)}
                title="Dupliciraj"
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {onCancel && item.status !== 'cancelled' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCancel(item)}
                title="Otkaži"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {onStatusChange && item.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange(item, type, 'approved')}
                  title="Odobri"
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange(item, type, 'rejected')}
                  title="Odbij"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(item, type)}
                title="Obriši"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      );
    }

    return cells;
  };

  if (!isDragMode) {
    // Regular table without drag & drop
    return (
      <>
      <div>
        <div className="mb-4 flex justify-end">
          <label className="flex items-center gap-2">
            <Switch
              checked={isDragMode}
              onCheckedChange={setIsDragMode}
            />
            <span className="text-sm">Način reorganizacije</span>
          </label>
        </div>
        
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>{renderTableHeaders()}</TableRow>
            </TableHeader>
            <TableBody>
              {localData.map((item, index) => (
                <TableRow key={item._id} className="hover:bg-gray-50">
                  {renderTableRow(item, index)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium mb-2">
              {selectedItems.length} stavki selektovano
            </p>
            <div className="flex gap-2">
              {onBulkStatusChange && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onBulkStatusChange(selectedItems, 'approved')}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Odobri
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onBulkStatusChange(selectedItems, 'rejected')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Odbij
                  </Button>
                </>
              )}
              {onBulkDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkDelete(selectedItems)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Obriši
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Image Preview on Hover */}
      {hoveredImage && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${Math.min(mousePosition.x + 20, window.innerWidth - 620)}px`,
            top: `${Math.max(mousePosition.y - 400, 10)}px`,
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl p-3 border-2 border-gray-300">
            <img
              src={hoveredImage}
              alt="Preview"
              className="object-contain rounded"
              style={{ 
                maxWidth: '600px', 
                maxHeight: '600px',
                width: 'auto',
                height: 'auto'
              }}
            />
          </div>
        </div>
      )}
      </>
    );
  }

  // Drag & Drop mode
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Povucite stavke da promijenite redoslijed
        </p>
        <label className="flex items-center gap-2">
          <Switch
            checked={isDragMode}
            onCheckedChange={setIsDragMode}
          />
          <span className="text-sm">Način reorganizacije</span>
        </label>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="table">
          {(provided) => (
            <div 
              className="rounded-lg border bg-white"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <Table>
                <TableHeader>
                  <TableRow>{renderTableHeaders()}</TableRow>
                </TableHeader>
                <TableBody>
                  {localData.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`hover:bg-gray-50 ${snapshot.isDragging ? 'bg-gray-100 shadow-lg' : ''}`}
                          style={{
                            ...provided.draggableProps.style,
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
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Image Preview on Hover */}
      {hoveredImage && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${Math.min(mousePosition.x + 20, window.innerWidth - 620)}px`,
            top: `${Math.max(mousePosition.y - 400, 10)}px`,
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl p-3 border-2 border-gray-300">
            <img
              src={hoveredImage}
              alt="Preview"
              className="object-contain rounded"
              style={{ 
                maxWidth: '600px', 
                maxHeight: '600px',
                width: 'auto',
                height: 'auto'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableDataTable;