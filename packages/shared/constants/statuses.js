/**
 * Status constants used across the application
 */

export const CONTENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  DRAFT: 'draft'
};

export const STATUS_LABELS = {
  [CONTENT_STATUS.PENDING]: 'Na čekanju',
  [CONTENT_STATUS.APPROVED]: 'Odobreno',
  [CONTENT_STATUS.REJECTED]: 'Odbijeno',
  [CONTENT_STATUS.CANCELLED]: 'Otkazano',
  [CONTENT_STATUS.DRAFT]: 'Nacrt'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
};

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Aktivan',
  [USER_STATUS.INACTIVE]: 'Neaktivan',
  [USER_STATUS.SUSPENDED]: 'Suspendovan',
  [USER_STATUS.DELETED]: 'Obrisan'
};

export const LECTURE_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const LECTURE_STATUS_LABELS = {
  [LECTURE_STATUS.UPCOMING]: 'Predstojeće',
  [LECTURE_STATUS.ONGOING]: 'U toku',
  [LECTURE_STATUS.COMPLETED]: 'Završeno',
  [LECTURE_STATUS.CANCELLED]: 'Otkazano'
};

// Status colors for UI consistency
export const STATUS_COLORS = {
  [CONTENT_STATUS.PENDING]: '#FF9800',
  [CONTENT_STATUS.APPROVED]: '#4CAF50',
  [CONTENT_STATUS.REJECTED]: '#f44336',
  [CONTENT_STATUS.CANCELLED]: '#9E9E9E',
  [CONTENT_STATUS.DRAFT]: '#2196F3',
  [USER_STATUS.ACTIVE]: '#4CAF50',
  [USER_STATUS.INACTIVE]: '#9E9E9E',
  [USER_STATUS.SUSPENDED]: '#FF9800',
  [USER_STATUS.DELETED]: '#f44336'
};

// Valid status transitions
export const VALID_STATUS_TRANSITIONS = {
  [CONTENT_STATUS.PENDING]: [CONTENT_STATUS.APPROVED, CONTENT_STATUS.REJECTED],
  [CONTENT_STATUS.APPROVED]: [CONTENT_STATUS.REJECTED, CONTENT_STATUS.CANCELLED],
  [CONTENT_STATUS.REJECTED]: [CONTENT_STATUS.APPROVED, CONTENT_STATUS.PENDING],
  [CONTENT_STATUS.CANCELLED]: [CONTENT_STATUS.APPROVED],
  [CONTENT_STATUS.DRAFT]: [CONTENT_STATUS.PENDING]
};

export const canTransitionTo = (currentStatus, newStatus) => {
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return validTransitions.includes(newStatus);
};