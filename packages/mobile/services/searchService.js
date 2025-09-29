import apiClient from './apiClient';
import { calculateLectureStatus } from '../utils/lectureStatusHelpers';

/**
 * Search service for searching lectures, daije, and organizations
 */
class SearchService {
  /**
   * Search across all entities
   * @param {string} query - Search query
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Search results grouped by type
   */
  async searchAll(query, filters = {}) {
    if (!query || query.trim().length < 2) {
      return {
        lectures: [],
        daije: [],
        organizations: []
      };
    }

    try {
      const searchQuery = query.toLowerCase();
      
      // Fetch all data in parallel
      const [lectures, daije, organizations] = await Promise.all([
        apiClient.get('/predavanja'),
        apiClient.get('/daije'),
        apiClient.get('/udruzenja')
      ]);

      // Filter lectures
      const filteredLectures = lectures.filter(lecture => {
        if (lecture.status !== 'approved') return false;
        
        const searchFields = [
          lecture.title,
          lecture.speaker,
          lecture.description,
          lecture.city,
          lecture.address,
          lecture.organization,
          lecture.daija?.name
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchFields.includes(searchQuery);
      });

      // Filter daije
      const filteredDaije = daije.filter(daija => {
        if (daija.status !== 'approved') return false;
        
        const searchFields = [
          daija.name,
          daija.title,
          daija.shortDescription,
          daija.description,
          daija.expertise
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchFields.includes(searchQuery);
      });

      // Filter organizations
      const filteredOrganizations = organizations.filter(org => {
        if (org.status !== 'approved') return false;
        
        const searchFields = [
          org.name,
          org.shortDescription,
          org.description,
          org.city,
          org.address
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchFields.includes(searchQuery);
      });

      // Sort lectures - "u toku" lectures first
      const sortedLectures = filteredLectures.sort((a, b) => {
        const statusA = calculateLectureStatus(a);
        const statusB = calculateLectureStatus(b);
        
        // If one is active and the other is not, active comes first
        if (statusA.status === 'active' && statusB.status !== 'active') return -1;
        if (statusA.status !== 'active' && statusB.status === 'active') return 1;
        
        // Otherwise keep original order
        return 0;
      });

      return {
        lectures: sortedLectures.slice(0, 10), // Limit results
        daije: filteredDaije.slice(0, 10),
        organizations: filteredOrganizations.slice(0, 10),
        totalResults: filteredLectures.length + filteredDaije.length + filteredOrganizations.length
      };

    } catch (error) {
      console.error('Search error:', error);
      return {
        lectures: [],
        daije: [],
        organizations: [],
        error: 'Greška prilikom pretrage'
      };
    }
  }

  /**
   * Search only lectures
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of lectures
   */
  async searchLectures(query) {
    const results = await this.searchAll(query, { type: 'lectures' });
    return results.lectures;
  }

  /**
   * Search only daije
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of daije
   */
  async searchDaije(query) {
    const results = await this.searchAll(query, { type: 'daije' });
    return results.daije;
  }

  /**
   * Search only organizations
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of organizations
   */
  async searchOrganizations(query) {
    const results = await this.searchAll(query, { type: 'organizations' });
    return results.organizations;
  }
}

export default new SearchService();