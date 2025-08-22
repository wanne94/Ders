// Card helper functions for formatting data for web app
import { getImageUrl } from '../utils/imageUtils';
import { formatDaijaTitle } from '../utils';

export interface InfoItem {
  icon: string;
  text: string;
  color?: string;
}

export interface CardData {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  infoItems: InfoItem[];
  badge?: {
    text: string;
    color: string;
  };
}

// Format lecture data for card display
export const formatLectureCard = (lecture: any): CardData => {
  const infoItems: InfoItem[] = [];

  // Speaker/Daija
  if (lecture.daija?.name || lecture.speaker) {
    const speakerName = lecture.daija && typeof lecture.daija === 'object' 
      ? `${lecture.daija.title || ''} ${lecture.daija.name || ''}`.trim()
      : lecture.speaker;
    
    if (speakerName) {
      infoItems.push({
        icon: '👨‍🏫',
        text: speakerName
      });
    }
  }

  // Organization
  if (lecture.organization?.name || lecture.organization) {
    infoItems.push({
      icon: '🏢',
      text: lecture.organization?.name || lecture.organization
    });
  }

  // Date
  if (lecture.date) {
    const date = new Date(lecture.date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Bosnian day names with first letter capitalized
    const bosnianDays = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    const weekday = bosnianDays[date.getDay()];
    
    const formattedDate = `${day}.${month}.${year}. ${weekday}`;
    infoItems.push({
      icon: '📅',
      text: formattedDate,
      color: '#1976d2'
    });
  }

  // Time
  if (lecture.time) {
    infoItems.push({
      icon: '⏰',
      text: lecture.time,
      color: '#1976d2'
    });
  }

  // Address
  if (lecture.address) {
    infoItems.push({
      icon: '📍',
      text: lecture.address
    });
  }

  // City
  if (lecture.city) {
    infoItems.push({
      icon: '🏙️',
      text: lecture.city
    });
  }

  return {
    title: (lecture.title || 'Bez naziva').toUpperCase(),
    imageUrl: getImageUrl(lecture.image) || getDefaultImage('lecture'),
    infoItems
  };
};

// Format daija data for card display
export const formatDaijaCard = (daija: any, lectureCount?: number): CardData => {
  const infoItems: InfoItem[] = [];

  // Specialization
  if (daija.specialization) {
    infoItems.push({
      icon: '🎓',
      text: daija.specialization
    });
  }

  // City
  if (daija.city) {
    infoItems.push({
      icon: '🏙️',
      text: daija.city
    });
  }

  // Bio (shortened)
  if (daija.bio) {
    const shortBio = daija.bio.length > 50 
      ? `${daija.bio.substring(0, 50)}...` 
      : daija.bio;
    infoItems.push({
      icon: 'ℹ️',
      text: shortBio
    });
  }

  const formatDaijaName = (daija: any) => {
    // Use name field for daija
    return daija?.name || '';
  };

  return {
    title: formatDaijaTitle(daija?.name, daija?.title).toUpperCase(),
    subtitle: '',
    imageUrl: getImageUrl(daija.image) || getDefaultImage('daija'),
    infoItems
  };
};

// Format organization data for card display
export const formatOrganizationCard = (organization: any, lectureCount?: number): CardData => {
  const infoItems: InfoItem[] = [];

  // Short description
  if (organization.shortDescription || organization.description) {
    const description = organization.shortDescription || organization.description;
    const shortDesc = description.length > 60 
      ? `${description.substring(0, 60)}...` 
      : description;
    infoItems.push({
      icon: '📝',
      text: shortDesc
    });
  }

  // Lecture count
  if (lectureCount !== undefined) {
    infoItems.push({
      icon: '📚',
      text: `${lectureCount} predavanja`,
      color: '#1976d2'
    });
  }

  // Address
  if (organization.address) {
    infoItems.push({
      icon: '📍',
      text: organization.address
    });
  }

  // City
  if (organization.city) {
    infoItems.push({
      icon: '🏙️',
      text: organization.city
    });
  }

  // Website
  if (organization.website) {
    infoItems.push({
      icon: '🌐',
      text: organization.website,
      color: '#1976d2'
    });
  }

  return {
    title: (organization.name || 'Bez naziva').toUpperCase(),
    imageUrl: getImageUrl(organization.image || organization.logo) || getDefaultImage('organization'),
    infoItems
  };
};

// Status helper functions
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'approved': return 'Odobreno';
    case 'active': return 'Odobreno'; // Backward compatibility
    case 'pending': return 'Na čekanju';
    case 'rejected': return 'Odbačeno';
    default: return 'Nepoznato';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'approved': return '#4caf50';
    case 'active': return '#4caf50'; // Backward compatibility
    case 'pending': return '#ff9800';
    case 'rejected': return '#f44336';
    default: return '#9e9e9e';
  }
};

// Web-specific status color (returns MUI color names)
export const getStatusColorWeb = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'approved': return 'success';
    case 'active': return 'success'; // Backward compatibility
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

// Utility functions for data formatting
export const getValue = (item: any, key: string): string => {
  if (!item || !key) return 'N/A';
  return item[key] || 'N/A';
};

export const getSafeKey = (prefix: string, index: number | string): string => {
  return `${prefix}-${index || 0}`;
};

// Helper function to get default image based on type
export const getDefaultImage = (type: 'lecture' | 'daija' | 'organization'): string => {
  switch (type) {
    case 'daija':
      return 'https://via.placeholder.com/80x80/4caf50/ffffff?text=👨‍🏫';
    case 'organization':
      return 'https://via.placeholder.com/80x80/2196f3/ffffff?text=🏢';
    default:
      return 'https://via.placeholder.com/80x80/1976d2/ffffff?text=📚';
  }
}; 