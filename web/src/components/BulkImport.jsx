import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const BulkImport = ({
  open,
  onClose,
  onImport,
  type,
  sampleData
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  const steps = ['Upload fajla', 'Validacija', 'Pregled', 'Import'];

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop().toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
        alert('Molimo odaberite CSV ili Excel fajl');
        return;
      }
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        let parsedRows = [];

        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const text = new TextDecoder().decode(data);
          const rows = text.split('\n');
          const headers = rows[0].split(',').map(h => h.trim());
          
          for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim()) {
              const values = rows[i].split(',').map(v => v.trim());
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = values[index] || '';
              });
              parsedRows.push(obj);
            }
          }
        } else {
          // Parse Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedRows = XLSX.utils.sheet_to_json(worksheet);
        }

        setParsedData(parsedRows);
        validateData(parsedRows);
        setActiveStep(1);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Greška pri čitanju fajla');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const validateData = (data) => {
    const errors = [];
    const requiredFields = getRequiredFields(type);

    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push({
            row: index + 1,
            field,
            message: `Nedostaje obavezno polje: ${field}`
          });
        }
      });

      // Type-specific validation
      if (type === 'lectures' && row.Datum) {
        const dateValue = new Date(row.Datum);
        if (isNaN(dateValue.getTime())) {
          errors.push({
            row: index + 1,
            field: 'Datum',
            message: 'Neispravan format datuma'
          });
        }
      }

      if (row.Email && !isValidEmail(row.Email)) {
        errors.push({
          row: index + 1,
          field: 'Email',
          message: 'Neispravan email format'
        });
      }
    });

    setValidationErrors(errors);
    if (errors.length === 0) {
      setActiveStep(2);
    }
  };

  const getRequiredFields = (type) => {
    switch (type) {
      case 'lectures':
        return ['Naslov', 'Predavač', 'Datum'];
      case 'daije':
        return ['Ime'];
      case 'organizations':
        return ['Naziv', 'Grad'];
      case 'users':
        return ['Korisničko ime', 'Email', 'Uloga'];
      default:
        return [];
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleImport = async () => {
    setImporting(true);
    setActiveStep(3);

    try {
      // Transform data to match API format
      const transformedData = transformData(parsedData, type);
      
      // Call import function
      const results = await onImport(transformedData);
      
      setImportResults({
        success: results.success || 0,
        failed: results.failed || 0,
        errors: results.errors || []
      });
    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        success: 0,
        failed: parsedData.length,
        errors: [error.message]
      });
    } finally {
      setImporting(false);
    }
  };

  const transformData = (data, type) => {
    return data.map(row => {
      switch (type) {
        case 'lectures':
          return {
            title: row.Naslov,
            speaker: row.Predavač,
            date: row.Datum,
            time: row.Vrijeme,
            city: row.Grad,
            organization: row.Organizacija,
            description: row.Opis
          };
        case 'daije':
          return {
            name: row.Ime,
            title: row.Naslov,
            description: row.Opis,
            bio: row.Biografija
          };
        case 'organizations':
          return {
            name: row.Naziv,
            city: row.Grad,
            address: row.Adresa,
            description: row.Opis,
            contact: row.Kontakt,
            email: row.Email,
            phone: row.Telefon
          };
        case 'users':
          return {
            username: row['Korisničko ime'],
            email: row.Email,
            role: translateRole(row.Uloga),
            firstName: row.Ime,
            lastName: row.Prezime
          };
        default:
          return row;
      }
    });
  };

  const translateRole = (role) => {
    const roleMap = {
      'Administrator': 'admin',
      'Super Admin': 'super_admin',
      'Korisnik': 'user',
      'Moderator': 'moderator'
    };
    return roleMap[role] || 'user';
  };

  const downloadTemplate = () => {
    const templateData = getTemplateData(type);
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${type}_template.xlsx`);
  };

  const getTemplateData = (type) => {
    switch (type) {
      case 'lectures':
        return [{
          Naslov: 'Primjer predavanja',
          Predavač: 'Ime Prezime',
          Datum: format(new Date(), 'yyyy-MM-dd'),
          Vrijeme: '17:00',
          Grad: 'Sarajevo',
          Organizacija: 'Naziv organizacije',
          Opis: 'Opis predavanja'
        }];
      case 'daije':
        return [{
          Ime: 'Ime Prezime',
          Naslov: 'Titula',
          Opis: 'Kratak opis',
          Biografija: 'Biografija'
        }];
      case 'organizations':
        return [{
          Naziv: 'Naziv organizacije',
          Grad: 'Sarajevo',
          Adresa: 'Ulica 123',
          Opis: 'Opis organizacije',
          Kontakt: 'Ime kontakt osobe',
          Email: 'email@example.com',
          Telefon: '+387 61 123 456'
        }];
      case 'users':
        return [{
          'Korisničko ime': 'korisnik123',
          Email: 'korisnik@example.com',
          Uloga: 'Korisnik',
          Ime: 'Ime',
          Prezime: 'Prezime'
        }];
      default:
        return [];
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setImportResults(null);
    setActiveStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Bulk Import - {type}
        <Button
          startIcon={<DownloadIcon />}
          onClick={downloadTemplate}
          size="small"
          sx={{ float: 'right' }}
        >
          Download Template
        </Button>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: File Upload */}
        {activeStep === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Odaberite CSV ili Excel fajl
            </Button>
            {file && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={file.name}
                  onDelete={handleReset}
                  color="primary"
                />
              </Box>
            )}
            <Typography variant="body2" sx={{ mt: 2 }}>
              Podržani formati: CSV, XLSX, XLS
            </Typography>
          </Box>
        )}

        {/* Step 2: Validation */}
        {activeStep === 1 && (
          <Box>
            {validationErrors.length > 0 ? (
              <>
                <Alert severity="error" sx={{ mb: 2 }}>
                  Pronađeno {validationErrors.length} grešaka u podacima
                </Alert>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Red</TableCell>
                        <TableCell>Polje</TableCell>
                        <TableCell>Greška</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validationErrors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.field}</TableCell>
                          <TableCell>{error.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Alert severity="success">
                Validacija uspješna! Svi podaci su ispravni.
              </Alert>
            )}
          </Box>
        )}

        {/* Step 3: Preview */}
        {activeStep === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Pregled podataka koji će biti importovani ({parsedData.length} stavki)
            </Alert>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {Object.keys(parsedData[0] || {}).map(key => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, i) => (
                        <TableCell key={i}>
                          {value?.toString() || ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {parsedData.length > 10 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Prikazano prvih 10 od {parsedData.length} stavki
              </Typography>
            )}
          </Box>
        )}

        {/* Step 4: Import Results */}
        {activeStep === 3 && (
          <Box>
            {importing ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography>Importovanje podataka...</Typography>
              </Box>
            ) : importResults ? (
              <Box>
                <Alert 
                  severity={importResults.failed > 0 ? 'warning' : 'success'}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle1">
                    Import završen!
                  </Typography>
                  <Typography variant="body2">
                    Uspješno: {importResults.success} | 
                    Neuspješno: {importResults.failed}
                  </Typography>
                </Alert>
                
                {importResults.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Greške:
                    </Typography>
                    {importResults.errors.map((error, index) => (
                      <Alert severity="error" key={index} sx={{ mb: 1 }}>
                        {error}
                      </Alert>
                    ))}
                  </Box>
                )}
              </Box>
            ) : null}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset} disabled={importing}>
          Reset
        </Button>
        <Button onClick={onClose} disabled={importing}>
          Zatvori
        </Button>
        {activeStep === 2 && (
          <Button 
            variant="contained" 
            onClick={handleImport}
            disabled={importing}
          >
            Započni Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkImport;