// Slug generation helpers for URL-friendly strings

// Helper function to normalize text for slug generation
const normalizeForSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[đ]/g, 'd')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Generate URL-friendly slug from daija name
export const generateDaijaSlug = (daija: any): string => {
  if (!daija || (!daija.name && !daija.firstName)) return '';
  
  // Use name field or fallback to firstName for backward compatibility
  const fullName = daija.name || daija.firstName || '';
  
  return normalizeForSlug(fullName);
};

// Generate URL-friendly slug from organization name
export const generateOrganizationSlug = (organization: any): string => {
  if (!organization || !organization.name) return '';
  
  return normalizeForSlug(organization.name);
};

// Generate URL-friendly slug from lecture title
export const generateLectureSlug = (lecture: any): string => {
  if (!lecture || !lecture.title) return '';
  
  return normalizeForSlug(lecture.title).substring(0, 50); // Limit length for URLs
};

// Find daija by slug
export const findDaijaBySlug = (slug: string, daije: any[]): any | null => {
  if (!slug || !Array.isArray(daije)) return null;
  
  return daije.find(daija => generateDaijaSlug(daija) === slug) || null;
};

// Find organization by slug
export const findOrganizationBySlug = (slug: string, organizations: any[]): any | null => {
  if (!slug || !Array.isArray(organizations)) return null;
  
  return organizations.find(org => generateOrganizationSlug(org) === slug) || null;
};

// Find lecture by slug
export const findLectureBySlug = (slug: string, lectures: any[]): any | null => {
  if (!slug || !Array.isArray(lectures)) return null;
  
  return lectures.find(lecture => generateLectureSlug(lecture) === slug) || null;
}; 