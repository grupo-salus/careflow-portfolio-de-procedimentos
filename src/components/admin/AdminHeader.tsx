import React from 'react';
import { Users } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, icon = <Users className="w-4 h-4 text-white" /> }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 min-w-8 min-h-8 bg-gradient-to-r from-[var(--careflow-primary)] to-[var(--careflow-secondary)] rounded-full flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default AdminHeader;