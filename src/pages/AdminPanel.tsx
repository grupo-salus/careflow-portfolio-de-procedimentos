import React from 'react';
import UserManagement from '../components/admin/UserManagement';
import { UserProvider } from '../contexts/UserContext';

interface AdminPanelProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
  return (
    <UserProvider>
      <UserManagement />
    </UserProvider>
  );
};

export default AdminPanel;