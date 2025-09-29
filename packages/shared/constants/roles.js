/**
 * User roles and permissions constants
 */

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
};

export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MODERATOR]: 'Moderator',
  [USER_ROLES.USER]: 'Korisnik'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'manage_all',
    'delete_any',
    'approve_any',
    'manage_users',
    'manage_settings',
    'view_analytics',
    'export_data'
  ],
  [USER_ROLES.ADMIN]: [
    'approve_content',
    'reject_content',
    'edit_content',
    'delete_content',
    'manage_users',
    'view_analytics',
    'export_data'
  ],
  [USER_ROLES.MODERATOR]: [
    'approve_content',
    'reject_content',
    'edit_content',
    'view_analytics'
  ],
  [USER_ROLES.USER]: [
    'create_content',
    'edit_own_content',
    'delete_own_content'
  ]
};

export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission) || permissions.includes('manage_all');
};

export const isAdmin = (userRole) => {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.SUPER_ADMIN;
};

export const isSuperAdmin = (userRole) => {
  return userRole === USER_ROLES.SUPER_ADMIN;
};