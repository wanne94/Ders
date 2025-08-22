import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle special characters and commas in values
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to Excel format
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Data') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Auto-size columns
  const maxWidth = 50;
  const wscols = Object.keys(data[0]).map(key => {
    const maxLength = Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    );
    return { wch: Math.min(maxLength + 2, maxWidth) };
  });
  ws['!cols'] = wscols;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Write file
  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`);
};

/**
 * Prepare lecture data for export
 */
export const prepareLectureData = (lectures) => {
  return lectures.map(lecture => ({
    'Naslov': lecture.title || '',
    'Predavač': lecture.speaker || lecture.daija || '',
    'Datum': lecture.date ? format(new Date(lecture.date), 'dd.MM.yyyy') : '',
    'Vrijeme': lecture.time || '',
    'Grad': lecture.city || '',
    'Organizacija': lecture.organization || '',
    'Status': translateStatus(lecture.status),
    'Otkazano': lecture.cancelled ? 'Da' : 'Ne',
    'Opis': lecture.description || ''
  }));
};

/**
 * Prepare daija data for export
 */
export const prepareDaijaData = (daije) => {
  return daije.map(daija => ({
    'Ime': daija.title || daija.name || '',
    'Opis': daija.description || '',
    'Biografija': daija.bio || '',
    'Status': translateStatus(daija.status),
    'Datum kreiranja': daija.createdAt ? format(new Date(daija.createdAt), 'dd.MM.yyyy') : ''
  }));
};

/**
 * Prepare organization data for export
 */
export const prepareOrganizationData = (organizations) => {
  return organizations.map(org => ({
    'Naziv': org.name || '',
    'Grad': org.city || '',
    'Adresa': org.address || '',
    'Opis': org.description || '',
    'Kontakt': org.contact || '',
    'Email': org.email || '',
    'Telefon': org.phone || '',
    'Status': translateStatus(org.status),
    'Datum kreiranja': org.createdAt ? format(new Date(org.createdAt), 'dd.MM.yyyy') : ''
  }));
};

/**
 * Prepare user data for export
 */
export const prepareUserData = (users) => {
  return users.map(user => ({
    'Korisničko ime': user.username || '',
    'Email': user.email || '',
    'Uloga': translateRole(user.role),
    'Ime': user.firstName || '',
    'Prezime': user.lastName || '',
    'Datum registracije': user.createdAt ? format(new Date(user.createdAt), 'dd.MM.yyyy') : ''
  }));
};

/**
 * Prepare suggestion data for export
 */
export const prepareSuggestionData = (suggestions) => {
  return suggestions.map(suggestion => ({
    'Tip': translateSuggestionType(suggestion.targetType),
    'Naziv': suggestion.targetName || '',
    'Razlog': suggestion.reason || '',
    'Podnosilac': suggestion.submitterName || '',
    'Email podnosioca': suggestion.submitterEmail || '',
    'Status': translateStatus(suggestion.status),
    'Datum': suggestion.createdAt ? format(new Date(suggestion.createdAt), 'dd.MM.yyyy') : ''
  }));
};

/**
 * Helper functions for translations
 */
const translateStatus = (status) => {
  const translations = {
    'pending': 'Na čekanju',
    'approved': 'Odobreno',
    'rejected': 'Odbačeno',
    'cancelled': 'Otkazano',
    'archived': 'Arhivirano'
  };
  return translations[status] || status;
};

const translateRole = (role) => {
  const translations = {
    'super_admin': 'Super Admin',
    'admin': 'Administrator',
    'user': 'Korisnik',
    'moderator': 'Moderator'
  };
  return translations[role] || role;
};

const translateSuggestionType = (type) => {
  const translations = {
    'lecture': 'Predavanje',
    'daija': 'Daija',
    'organization': 'Organizacija'
  };
  return translations[type] || type;
};

/**
 * Export multiple sheets to Excel
 */
export const exportMultipleToExcel = (datasets, filename = 'dashboard_export') => {
  const wb = XLSX.utils.book_new();
  
  datasets.forEach(({ data, sheetName, prepareFunction }) => {
    if (data && data.length > 0) {
      const preparedData = prepareFunction ? prepareFunction(data) : data;
      const ws = XLSX.utils.json_to_sheet(preparedData);
      
      // Auto-size columns
      const maxWidth = 50;
      const wscols = Object.keys(preparedData[0]).map(key => {
        const maxLength = Math.max(
          key.length,
          ...preparedData.map(row => String(row[key] || '').length)
        );
        return { wch: Math.min(maxLength + 2, maxWidth) };
      });
      ws['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  });
  
  if (wb.SheetNames.length > 0) {
    XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`);
    return true;
  }
  
  console.warn('No data to export');
  return false;
};