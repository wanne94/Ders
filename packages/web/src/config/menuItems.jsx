import { 
  Home, 
  BookOpen, 
  Building2, 
  User, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Plus, 
  Lightbulb 
} from 'lucide-react';

// Osnovni meni stavke (uvek vidljive)
export const menuItems = [
  {
    label: 'Početna',
    text: 'Početna',
    icon: <Home className="h-5 w-5" />,
    path: '/'
  },
  {
    label: 'Dersovi',
    text: 'Dersovi',
    icon: <BookOpen className="h-5 w-5" />,
    path: '/lectures'
  },
  {
    label: 'Udruženja',
    text: 'Udruženja',
    icon: <Building2 className="h-5 w-5" />,
    path: '/organizations'
  },
  {
    label: 'Daije',
    text: 'Daije',
    icon: <User className="h-5 w-5" />,
    path: '/daije'
  }
];

// Korisnički meni - opcije za dodavanje sadržaja
export const userMenuItems = [
  {
    label: 'Dodaj',
    text: 'Dodaj',
    icon: <Plus className="h-5 w-5" />,
    path: '#',
    isDropdown: true,
    subItems: [
      {
        label: 'Dodaj ders',
        text: 'Dodaj ders',
        icon: <BookOpen className="h-5 w-5" />,
        action: 'add-lecture'
      },
      {
        label: 'Predloži izmjenu',
        text: 'Predloži izmjenu',
        icon: <Lightbulb className="h-5 w-5" />,
        action: 'suggest-change'
      }
    ]
  }
];

// Admin meni - samo za administratore
export const adminMenuItems = [
  {
    label: 'Admin Panel',
    text: 'Admin Panel',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/admin'
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