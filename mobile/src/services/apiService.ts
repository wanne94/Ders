import axios from 'axios';
import API_CONFIG from '../config/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for when server is not available
const mockData = {
  lectures: [
    {
      _id: '1',
      title: 'Značaj molitve u islamu',
      description: 'Predavanje o važnosti i značaju molitve u svakodnevnom životu muslimana.',
      date: new Date().toISOString(),
      time: '19:00',
      status: 'approved',
      daija: { name: 'Hafiz Ahmed Selimović' },
      organization: { name: 'Islamska zajednica Sarajevo' }
    },
    {
      _id: '2',
      title: 'Ramazan - mjesec pokajanja',
      description: 'Razgovor o duhovnim aspektima ramazanskog posta i njegovom značaju.',
      date: new Date(Date.now() + 86400000).toISOString(),
      time: '20:00',
      status: 'approved',
      daija: { name: 'Dr. Mustafa Cerić' },
      organization: { name: 'Medresa Gazi Husrev-beg' }
    },
    {
      _id: '3',
      title: 'Islamska etika u modernom dobu',
      description: 'Kako primijeniti islamske vrijednosti u savremenom društvu.',
      date: new Date(Date.now() + 172800000).toISOString(),
      time: '18:30',
      status: 'approved',
      daija: { name: 'Prof. Dr. Enes Karić' },
      organization: { name: 'Fakultet islamskih nauka' }
    }
  ],
  organizations: [
    {
      _id: '1',
      name: 'Islamska zajednica Sarajevo',
      description: 'Glavna islamska organizacija u Sarajevu'
    },
    {
      _id: '2',
      name: 'Medresa Gazi Husrev-beg',
      description: 'Tradicionalna islamska škola'
    },
    {
      _id: '3',
      name: 'Fakultet islamskih nauka',
      description: 'Visokoškolska ustanova za islamske studije'
    }
  ],
  daije: [
    {
      _id: '1',
      name: 'Hafiz Ahmed Selimović',
      bio: 'Iskusni daija sa dugogodišnjim iskustvom u predavanju.',
      status: 'approved'
    },
    {
      _id: '2',
      name: 'Dr. Mustafa Cerić',
      bio: 'Poznati islamski učenjak i bivši reisu-l-ulema.',
      status: 'approved'
    },
    {
      _id: '3',
      name: 'Prof. Dr. Enes Karić',
      bio: 'Profesor islamskih studija i autor brojnih knjiga.',
      status: 'approved'
    }
  ]
};

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Service functions
export const apiService = {
  // Fetch all public lectures
  getLectures: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.LECTURES);
      return response.data;
    } catch (error) {
      console.warn('Server not available, using mock data for lectures');
      await delay(500); // Simulate network delay
      return mockData.lectures;
    }
  },

  // Fetch all organizations
  getOrganizations: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ORGANIZATIONS);
      return response.data;
    } catch (error) {
      console.warn('Server not available, using mock data for organizations');
      await delay(500); // Simulate network delay
      return mockData.organizations;
    }
  },

  // Fetch all daije
  getDaije: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.DAIJE);
      return response.data;
    } catch (error) {
      console.warn('Server not available, using mock data for daije');
      await delay(500); // Simulate network delay
      return mockData.daije;
    }
  },

  // Fetch all data at once
  getAllData: async () => {
    try {
      const [lectures, organizations, daije] = await Promise.all([
        apiService.getLectures(),
        apiService.getOrganizations(),
        apiService.getDaije(),
      ]);
      
      return { lectures, organizations, daije };
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw error;
    }
  },
};

export default apiService; 