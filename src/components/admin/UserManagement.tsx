import React, { useState } from 'react';
import { User } from '../../types/auth';
import { Users } from 'lucide-react';
import { apiService } from '../../services/api';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import UserActions from './UserActions';
import { useUserContext } from '../../contexts/UserContext';

const UserManagement: React.FC = () => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    currentPage,
    totalPages,
    handlePageChange,
    currentUsers,
    indexOfFirstUser,
    indexOfLastUser,
    filteredUsers,
  } = useUserContext();

  // Estados para gerenciar modais
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isDemoteModalOpen, setIsDemoteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    const user = currentUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsDeleteModalOpen(true);
    }
  };

  const handlePromoteUser = (userId: number) => {
    const user = currentUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsPromoteModalOpen(true);
    }
  };

  const handleDemoteUser = (userId: number) => {
    const user = currentUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsDemoteModalOpen(true);
    }
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsPasswordConfirmModalOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await apiService.resetUserPassword(selectedUser.id);
      setNewPassword(response.new_password);
      setIsPasswordConfirmModalOpen(false);
      setIsPasswordModalOpen(true);
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      setIsPasswordConfirmModalOpen(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddModalOpen(true);
  };

  // Funções para fechar modais
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
    setNewPassword('');
  };

  const onClosePasswordConfirmModal = () => {
    setIsPasswordConfirmModalOpen(false);
    setSelectedUser(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const closePromoteModal = () => {
    setIsPromoteModalOpen(false);
    setSelectedUser(null);
  };

  const closeDemoteModal = () => {
    setIsDemoteModalOpen(false);
    setSelectedUser(null);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Carregando usuários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-gray-50">
      <main
        className="transition-all duration-300 p-6 overflow-y-auto flex-1"
        style={{ height: "100%", maxHeight: "100vh" }}
      >
        {/* Header Padronizado */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 min-w-8 min-h-8 bg-gradient-to-r from-[var(--careflow-primary)] to-[var(--careflow-secondary)] rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciar Usuários
            </h1>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Filtros e Busca */}
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterRole={filterRole}
            onFilterRoleChange={setFilterRole}
            onAddUser={handleAddUser}
          />

          {/* Lista de Usuários */}
          <UserTable
            users={currentUsers}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onPromoteUser={handlePromoteUser}
            onDemoteUser={handleDemoteUser}
            onResetPassword={handleResetPassword}
            indexOfFirstUser={indexOfFirstUser}
            indexOfLastUser={Math.min(indexOfLastUser, filteredUsers.length)}
            totalUsers={filteredUsers.length}
          />
        </div>
        
        <div className="pb-8"></div>
      </main>

      {/* Componente de ações do usuário (modais) */}
      <UserActions
        selectedUser={selectedUser}
        isEditModalOpen={isEditModalOpen}
        isPasswordModalOpen={isPasswordModalOpen}
        isPasswordConfirmModalOpen={isPasswordConfirmModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        isPromoteModalOpen={isPromoteModalOpen}
        isDemoteModalOpen={isDemoteModalOpen}
        isAddModalOpen={isAddModalOpen}
        newPassword={newPassword}
        onCloseEditModal={closeEditModal}
         onClosePasswordModal={closePasswordModal}
         onClosePasswordConfirmModal={onClosePasswordConfirmModal}
         onCloseDeleteModal={closeDeleteModal}
         onClosePromoteModal={closePromoteModal}
         onCloseDemoteModal={closeDemoteModal}
         onCloseAddModal={closeAddModal}
        onConfirmResetPassword={confirmResetPassword}
      />
    </div>
  );
};

export default UserManagement;