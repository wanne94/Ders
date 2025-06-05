import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Osnovni meni stavke (uvek vidljive)
export const menuItems = [
  {
    text: 'Početna',
    icon: HomeIcon,
    path: '/'
  },
  {
    text: 'Dersovi',
    icon: MenuBookIcon,
    path: '/lectures'
  },
  {
    text: 'Udruženja',
    icon: BusinessIcon,
    path: '/organizations'
  },
  {
    text: 'Daije',
    icon: PersonIcon,
    path: '/daije'
  }
];

// Korisnički meni - opcije za dodavanje sadržaja
export const userMenuItems = [
  {
    text: 'Dodaj',
    icon: AddIcon,
    path: '#',
    isDropdown: true,
    subItems: [
      {
        text: 'Dodaj ders',
        icon: MenuBookIcon,
        action: 'add-lecture'
      },
      {
        text: 'Predloži izmjenu',
        icon: LightbulbIcon,
        action: 'suggest-change'
      }
    ]
  }
];

// Admin meni - samo za administratore
export const adminMenuItems = [
  {
    text: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard'
  },
  {
    text: 'Korisnici',
    icon: PeopleIcon,
    path: '/users'
  },
  {
    text: 'Postavke',
    icon: SettingsIcon,
    path: '/settings'
  }
];

export const getAllMenuItems = (userRole) => {
  const allItems = [...menuItems, ...adminMenuItems];
  return allItems.filter(item => item.roles?.includes(userRole));
};

export const getMenuItemByPath = (path) => {
  const allItems = [...menuItems, ...adminMenuItems];
  return allItems.find(item => item.path === path);
}; 