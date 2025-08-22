import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import { 
  exportToCSV, 
  exportToExcel, 
  exportMultipleToExcel,
  prepareLectureData,
  prepareDaijaData,
  prepareOrganizationData,
  prepareUserData,
  prepareSuggestionData
} from '../utils/exportUtils';

const ExportButton = ({ 
  data, 
  type, 
  filename,
  multipleData = null,
  buttonText = "Export",
  buttonProps = {}
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getPrepareFunction = (dataType) => {
    switch (dataType) {
      case 'lecture':
      case 'lectures':
        return prepareLectureData;
      case 'daija':
      case 'daije':
        return prepareDaijaData;
      case 'organization':
      case 'organizations':
        return prepareOrganizationData;
      case 'user':
      case 'users':
        return prepareUserData;
      case 'suggestion':
      case 'suggestions':
        return prepareSuggestionData;
      default:
        return null;
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    
    try {
      const prepareFunction = getPrepareFunction(type);
      const preparedData = prepareFunction ? prepareFunction(data) : data;
      exportToCSV(preparedData, filename || type);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      handleClose();
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    
    try {
      const prepareFunction = getPrepareFunction(type);
      const preparedData = prepareFunction ? prepareFunction(data) : data;
      exportToExcel(preparedData, filename || type);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      handleClose();
    }
  };

  const handleExportAll = () => {
    setIsExporting(true);
    
    try {
      if (multipleData) {
        const datasets = Object.entries(multipleData).map(([key, value]) => ({
          data: value.data,
          sheetName: value.sheetName || key,
          prepareFunction: getPrepareFunction(value.type || key)
        }));
        
        exportMultipleToExcel(datasets, filename || 'dashboard_export');
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      handleClose();
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={isExporting ? <CircularProgress size={16} /> : <DownloadIcon />}
        onClick={handleClick}
        disabled={isExporting || (!data || data.length === 0)}
        {...buttonProps}
      >
        {buttonText}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export to CSV</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export to Excel</ListItemText>
        </MenuItem>
        
        {multipleData && (
          <>
            <Divider />
            <MenuItem onClick={handleExportAll}>
              <ListItemIcon>
                <TableChartIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Export sve podatke</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default ExportButton;