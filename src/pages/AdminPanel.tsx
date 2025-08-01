import React, { useState, useEffect } from 'react';
import { User, Empresa, Modulo } from '../types/auth';
import { apiService } from '../services/api';
import { 
  Users,
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  User as UserIcon,
  Search,
  Key,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

interface AdminPanelProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
  // Estados principais
  const [users, setUsers] = useState<User[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'comum'>('all');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Estados para modais
  const [showUserModal, setShowUserModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Estados para edição de usuário
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [selectedEmpresas, setSelectedEmpresas] = useState<number[]>([]);
  const [selectedModulos, setSelectedModulos] = useState<number[]>([]);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // Estados para modais de confirmação e toast
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, empresasData, modulosData] = await Promise.all([
        apiService.getUsers(),
        apiService.getEmpresas(),
        apiService.getModulos()
      ]);
      setUsers(usersData);
      setEmpresas(empresasData);
      setModulos(modulosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setToast({ message: 'Erro ao carregar dados. Verifique se o backend está rodando.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtros e paginação
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Funções de validação de senha
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) setPasswordStrength('weak');
    else if (score < 5) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  // Funções de gerenciamento de usuários
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditingUser({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });
    setSelectedEmpresas(user.empresas.map(e => e.id));
    
    let userModulos = user.modulos.map(m => m.id);
    if (user.role === 'comum') {
      const adminOnlyModulos = modulos.filter(m => m.is_admin_only).map(m => m.id);
      userModulos = userModulos.filter(id => !adminOnlyModulos.includes(id));
    }
    setSelectedModulos(userModulos);
    setPassword('');
    setPasswordStrength(null);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      let successMessage = 'Usuário salvo com sucesso!';
      
      if (selectedUser) {
        await apiService.updateUser(selectedUser.id, editingUser);
        
        const currentEmpresaIds = selectedUser.empresas.map(e => e.id);
        const newEmpresaIds = selectedEmpresas;
        
        for (const empresaId of currentEmpresaIds) {
          if (!newEmpresaIds.includes(empresaId)) {
            await apiService.removeUserFromEmpresa(selectedUser.id, empresaId);
          }
        }
        
        for (const empresaId of newEmpresaIds) {
          if (!currentEmpresaIds.includes(empresaId)) {
            await apiService.addUserToEmpresa(selectedUser.id, empresaId);
          }
        }
        
        const currentModuloIds = selectedUser.modulos.map(m => m.id);
        const newModuloIds = selectedModulos;
        
        for (const moduloId of currentModuloIds) {
          if (!newModuloIds.includes(moduloId)) {
            await apiService.removeUserFromModulo(selectedUser.id, moduloId);
          }
        }
        
        for (const moduloId of newModuloIds) {
          if (!currentModuloIds.includes(moduloId)) {
            await apiService.addUserToModulo(selectedUser.id, moduloId);
          }
        }
      } else {
        if (!editingUser.email || !editingUser.full_name || !password) {
          setToast({ message: 'Todos os campos são obrigatórios para criar um usuário.', type: 'error' });
          return;
        }

        if (password.length < 8) {
          setToast({ message: 'A senha deve ter pelo menos 8 caracteres.', type: 'error' });
          return;
        }
        if (!/[A-Z]/.test(password)) {
          setToast({ message: 'A senha deve conter pelo menos uma letra maiúscula.', type: 'error' });
          return;
        }
        if (!/[a-z]/.test(password)) {
          setToast({ message: 'A senha deve conter pelo menos uma letra minúscula.', type: 'error' });
          return;
        }
        if (!/\d/.test(password)) {
          setToast({ message: 'A senha deve conter pelo menos um número.', type: 'error' });
          return;
        }

        const newUser = await apiService.createUser({
          email: editingUser.email,
          full_name: editingUser.full_name,
          password: password,
          role: editingUser.role || 'comum'
        });

        for (const empresaId of selectedEmpresas) {
          await apiService.addUserToEmpresa(newUser.id, empresaId);
        }

        for (const moduloId of selectedModulos) {
          await apiService.addUserToModulo(newUser.id, moduloId);
        }

        setUsers([...users, newUser]);
        const empresaCount = selectedEmpresas.length;
        const moduloCount = selectedModulos.length;
        successMessage = 'Usuário criado com sucesso!';
        
        if (empresaCount > 0 || moduloCount > 0) {
          const details = [];
          if (empresaCount > 0) details.push(`${empresaCount} empresa(s)`);
          if (moduloCount > 0) details.push(`${moduloCount} módulo(s)`);
          successMessage += ` Associado a: ${details.join(', ')}.`;
        }
      }
      
      setShowUserModal(false);
      setSelectedUser(null);
      setEditingUser({});
      setSelectedEmpresas([]);
      setSelectedModulos([]);
      setPassword('');
      setPasswordStrength(null);
      
      await fetchData();
      setToast({ message: successMessage, type: 'success' });
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      const errorMessage = error.message || 'Erro ao salvar usuário';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Excluir Usuário',
      message: `Tem certeza que deseja excluir o usuário "${user.full_name}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          await apiService.deleteUser(userId);
          setUsers(users.filter(u => u.id !== userId));
          setToast({ message: 'Usuário excluído com sucesso!', type: 'success' });
        } catch (error: any) {
          console.error('Erro ao deletar usuário:', error);
          const errorMessage = error.message || 'Erro ao deletar usuário';
          setToast({ message: errorMessage, type: 'error' });
        }
      }
    });
  };

  const handlePromoteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'Promover Usuário',
      message: `Tem certeza que deseja promover "${user.full_name}" a administrador?`,
      onConfirm: async () => {
        try {
          await apiService.promoteUser(userId);
          setUsers(users.map(u => 
            u.id === userId ? { ...u, role: 'admin' as const } : u
          ));
          setToast({ message: 'Usuário promovido a administrador com sucesso!', type: 'success' });
        } catch (error: any) {
          console.error('Erro ao promover usuário:', error);
          const errorMessage = error.message || 'Erro ao promover usuário';
          setToast({ message: errorMessage, type: 'error' });
        }
      }
    });
  };

  const handleDemoteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Rebaixar Usuário',
      message: `Tem certeza que deseja rebaixar "${user.full_name}" a usuário comum?`,
      onConfirm: async () => {
        try {
          await apiService.demoteUser(userId);
          setUsers(users.map(u => 
            u.id === userId ? { ...u, role: 'comum' as const } : u
          ));
          setToast({ message: 'Usuário rebaixado a comum com sucesso!', type: 'success' });
        } catch (error: any) {
          console.error('Erro ao rebaixar usuário:', error);
          const errorMessage = error.message || 'Erro ao rebaixar usuário';
          setToast({ message: errorMessage, type: 'error' });
        }
      }
    });
  };

  const handleResetPassword = async (user: User) => {
    setResetPasswordUser(user);
    setShowResetPasswordModal(true);
  };

  const confirmResetPassword = async () => {
    if (!resetPasswordUser) return;
    
    try {
      const result = await apiService.resetUserPassword(resetPasswordUser.id);
      setNewPassword(result.new_password);
      setToast({ message: 'Senha resetada com sucesso!', type: 'success' });
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      const errorMessage = error.message || 'Erro ao resetar senha';
      setToast({ message: errorMessage, type: 'error' });
    }
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
    <>
      <div className="flex flex-1 h-full overflow-hidden">
        <main
          className={`transition-all duration-300 p-6 overflow-y-auto flex-1`}
          style={{ height: "100%", maxHeight: "100vh" }}
        >
        {/* Header */}
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

        {/* Filtros e Busca */}
        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por Role */}
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Roles</option>
                <option value="admin">Administradores</option>
                <option value="comum">Usuários Comuns</option>
              </select>
            </div>

            {/* Botão Adicionar */}
            <div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditingUser({ role: 'comum' });
                  setSelectedEmpresas([]);
                  setSelectedModulos([]);
                  setPassword('');
                  setPasswordStrength(null);
                  setShowUserModal(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Módulos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-3 h-3 mr-1" />
                            Comum
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.empresas.length} empresa(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.modulos.length} módulo(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded"
                          title="Resetar Senha"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        {user.role === 'comum' ? (
                          <button
                            onClick={() => handlePromoteUser(user.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Promover a Admin"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDemoteUser(user.id)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Rebaixar a Comum"
                          >
                            <UserIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indexOfFirstUser + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span>{' '}
                    de <span className="font-medium">{filteredUsers.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Edição/Criação de Usuário */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowUserModal(false)} />
              
              <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Informações Básicas</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={editingUser.full_name || ''}
                        onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editingUser.email || ''}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {!selectedUser && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Senha
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            checkPasswordStrength(e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite a senha do usuário"
                        />
                        {password && (
                          <div className="mt-1">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    passwordStrength === 'weak' ? 'bg-red-500 w-1/3' :
                                    passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                                    passwordStrength === 'strong' ? 'bg-green-500 w-full' : ''
                                  }`}
                                />
                              </div>
                              <span className={`text-xs font-medium ${
                                passwordStrength === 'weak' ? 'text-red-600' :
                                passwordStrength === 'medium' ? 'text-yellow-600' :
                                passwordStrength === 'strong' ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {passwordStrength === 'weak' ? 'Fraca' :
                                 passwordStrength === 'medium' ? 'Média' :
                                 passwordStrength === 'strong' ? 'Forte' : ''}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número.
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={editingUser.role || 'comum'}
                        onChange={(e) => {
                          const newRole = e.target.value as 'admin' | 'comum';
                          setEditingUser({...editingUser, role: newRole});
                          
                          if (newRole === 'comum') {
                            const adminOnlyModulos = modulos.filter(m => m.is_admin_only).map(m => m.id);
                            setSelectedModulos(prev => prev.filter(id => !adminOnlyModulos.includes(id)));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="comum">Usuário Comum</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>

                  {/* Empresas e Módulos */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Permissões</h4>
                    
                    {/* Empresas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresas
                      </label>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {empresas.map((empresa) => (
                          <label key={empresa.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedEmpresas.includes(empresa.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmpresas([...selectedEmpresas, empresa.id]);
                                } else {
                                  setSelectedEmpresas(selectedEmpresas.filter(id => id !== empresa.id));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{empresa.nome}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Módulos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Módulos
                      </label>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {modulos.map((modulo) => {
                          const isDisabled = editingUser.role === 'comum' && modulo.is_admin_only;
                          return (
                            <label key={modulo.id} className={`flex items-center ${isDisabled ? 'opacity-50' : ''}`}>
                              <input
                                type="checkbox"
                                checked={selectedModulos.includes(modulo.id)}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedModulos([...selectedModulos, modulo.id]);
                                  } else {
                                    setSelectedModulos(selectedModulos.filter(id => id !== modulo.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <span className={`ml-2 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                                {modulo.nome}
                              </span>
                              {modulo.is_admin_only && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Admin
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Reset de Senha */}
        {showResetPasswordModal && resetPasswordUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowResetPasswordModal(false)} />
              
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Resetar Senha
                  </h3>
                  <button
                    onClick={() => setShowResetPasswordModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Tem certeza que deseja resetar a senha do usuário <strong>{resetPasswordUser.full_name}</strong>?
                  </p>
                  <p className="text-sm text-gray-500">
                    Uma nova senha será gerada automaticamente e exibida após a confirmação.
                  </p>
                </div>

                {newPassword && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Nova Senha Gerada:</h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newPassword}
                        readOnly
                        className="flex-1 px-3 py-2 border border-green-300 rounded-lg bg-white text-green-800 font-mono text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(newPassword);
                          setToast({ message: 'Senha copiada para a área de transferência!', type: 'success' });
                        }}
                        className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setNewPassword('');
                      setResetPasswordUser(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  {!newPassword && (
                    <button
                      onClick={confirmResetPassword}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
                    >
                      Resetar Senha
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Confirmar"
          cancelText="Cancelar"
          type={confirmModal.type}
        />

                 {/* Toast de Notificação */}
         {toast && (
           <Toast
             message={toast.message}
             type={toast.type}
             onClose={() => setToast(null)}
           />
         )}
       </main>
     </div>
   </>
 );
};

export default AdminPanel; 