import React from 'react';
import { cn } from '@/lib/utils';

const ROLE_CONFIG = {
  user: { label: 'K', className: 'bg-gray-400 text-white' },
  moderator: { label: 'M', className: 'bg-blue-500 text-white' },
  admin: { label: 'A', className: 'bg-green-500 text-white' },
  'super admin': { label: 'SA', className: 'bg-[#800000] text-white' },
  'super_admin': { label: 'SA', className: 'bg-[#800000] text-white' },
};

export default function RoleBadge({ role }) {
  const key = role?.toLowerCase() || 'user';
  const { label, className } = ROLE_CONFIG[key] || ROLE_CONFIG.user;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[32px] h-8 rounded px-2",
        "font-bold text-sm uppercase",
        className
      )}
    >
      {label}
    </span>
  );
}