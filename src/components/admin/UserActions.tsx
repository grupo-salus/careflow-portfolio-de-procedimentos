import React, { useState } from 'react';
import { User } from '../../types/auth';
import { useUserContext } from '../../contexts/UserContext';
import { apiService } from '../../services/api';
import UserFormModal from './UserFormModal';
import PasswordResetModal from './PasswordResetModal';
import ConfirmModal from '../ConfirmModal';
import Toast from '../Toast';

interface UserActionsProps {
  selectedUser: User | null;
  isEditModalOpen: boolean;
  isPasswordModalOpen: boolean;
  isPasswordConfirmModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isPromoteModalOpen: boolean;
  isDemoteModalOpen: boolean;
  isAddModalOpen: boolean;
  newPassword: string;
  onCloseEditModal: () => void;
  onClosePasswordModal: () => void;
  onClosePasswordConfirmModal: () => void;
  onCloseDeleteModal: () => void;
  onClosePromoteModal: () => void;
  onCloseDemoteModal: () => void;
  onCloseAddModal: () => void;
  onConfirmResetPassword: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  selectedUser,
  isEditModalOpen,
  isPasswordModalOpen,
  isPasswordConfirmModalOpen,
  isDeleteModalOpen,
  isPromoteModalOpen,
  isDemoteModalOpen,
  isAddModalOpen,
  newPassword,
  onCloseEditModal,
  onClosePasswordModal,
  onClosePasswordConfirmModal,
  onCloseDeleteModal,
  onClosePromoteModal,
  onCloseDemoteModal,
  onCloseAddModal,
  onConfirmResetPassword
}) => {
  const { empresas, modulos, addUser, updateUser, deleteUser, promoteUser, demoteUser } = useUserContext();
  
  // Estados para toast
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ message, type });
  };

  const handleSaveUser = async (userData: {
    id?: number;
    full_name: string;
    email: string;
    password?: string;
    role: 'admin' | 'comum';
    empresas: number[];
    modulos: number[];
  }) => {
    try {
      if (userData.id) {
        // Editar usuário existente
        const basicUserData = {
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          ...(userData.password && { password: userData.password })
        };
        
        const updatedUser = await apiService.updateUser(userData.id, basicUserData);
        
        // Atualizar associações de empresas e módulos se necessário
        // Nota: Isso pode precisar de lógica adicional para comparar com o estado atual
        
        updateUser(updatedUser);
        showToast('Usuário atualizado com sucesso!', 'success');
      } else {
        // Criar novo usuário
        if (!userData.password) {
          showToast('Senha é obrigatória para novos usuários.', 'error');
          return;
        }
        
        const basicUserData = {
          full_name: userData.full_name,
          email: userData.email,
          password: userData.password,
          role: userData.role
        };
        
        const newUser = await apiService.createUser(basicUserData);
        
        // Associar empresas
        for (const empresaId of userData.empresas) {
          try {
            await apiService.addUserToEmpresa(newUser.id, empresaId);
          } catch (error) {
            console.error(`Erro ao associar empresa ${empresaId}:`, error);
          }
        }
        
        // Associar módulos
        for (const moduloId of userData.modulos) {
          try {
            await apiService.addUserToModulo(newUser.id, moduloId);
          } catch (error) {
            console.error(`Erro ao associar módulo ${moduloId}:`, error);
          }
        }
        
        addUser(newUser);
        showToast('Usuário criado com sucesso!', 'success');
      }
      onCloseEditModal();
      onCloseAddModal();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      
      // Verificar se é erro de email duplicado
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      if (errorMessage.includes('Email já cadastrado')) {
        showToast('Este email já está cadastrado no sistema. Use um email diferente.', 'error');
      } else {
        showToast('Erro ao salvar usuário. Tente novamente.', 'error');
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await apiService.deleteUser(selectedUser.id);
      deleteUser(selectedUser.id);
      showToast('Usuário excluído com sucesso!', 'success');
      onCloseDeleteModal();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      showToast('Erro ao excluir usuário. Tente novamente.', 'error');
    }
  };

  const handlePromoteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await apiService.promoteUser(selectedUser.id);
      promoteUser(selectedUser.id);
      showToast('Usuário promovido a administrador!', 'success');
      onClosePromoteModal();
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
      showToast('Erro ao promover usuário. Tente novamente.', 'error');
    }
  };

  const handleDemoteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await apiService.demoteUser(selectedUser.id);
      demoteUser(selectedUser.id);
      showToast('Usuário rebaixado para comum!', 'success');
      onCloseDemoteModal();
    } catch (error) {
      console.error('Erro ao rebaixar usuário:', error);
      showToast('Erro ao rebaixar usuário. Tente novamente.', 'error');
    }
  };

  return (
    <>
      {/* Modal de Formulário de Usuário (Adicionar/Editar) */}
      <UserFormModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={isEditModalOpen ? onCloseEditModal : onCloseAddModal}
        onSave={handleSaveUser}
        user={isEditModalOpen ? selectedUser : null}
        empresas={empresas}
        modulos={modulos}
      />

      {/* Modal de confirmação de reset de senha */}
      {isPasswordConfirmModalOpen && selectedUser && (
        <ConfirmModal
          isOpen={isPasswordConfirmModalOpen}
          onClose={onClosePasswordConfirmModal}
          onConfirm={onConfirmResetPassword}
          title="Resetar Senha"
          message={`Tem certeza que deseja resetar a senha do usuário ${selectedUser.full_name}? Uma nova senha temporária será gerada.`}
          confirmText="Resetar Senha"
          cancelText="Cancelar"
          type="warning"
        />
      )}

      {/* Modal de Reset de Senha */}
      <PasswordResetModal
        isOpen={isPasswordModalOpen}
        onClose={onClosePasswordModal}
        newPassword={newPassword}
        userName={selectedUser?.full_name || ''}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={handleDeleteUser}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${selectedUser?.full_name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Confirmação de Promoção */}
      <ConfirmModal
        isOpen={isPromoteModalOpen}
        onClose={onClosePromoteModal}
        onConfirm={handlePromoteUser}
        title="Promover Usuário"
        message={`Tem certeza que deseja promover "${selectedUser?.full_name}" para administrador?`}
        confirmText="Promover"
        cancelText="Cancelar"
        type="info"
      />

      {/* Modal de Confirmação de Rebaixamento */}
      <ConfirmModal
        isOpen={isDemoteModalOpen}
        onClose={onCloseDemoteModal}
        onConfirm={handleDemoteUser}
        title="Rebaixar Usuário"
        message={`Tem certeza que deseja rebaixar "${selectedUser?.full_name}" para usuário comum?`}
        confirmText="Rebaixar"
        cancelText="Cancelar"
        type="warning"
      />

      {/* Toast de Notificação */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default UserActions;