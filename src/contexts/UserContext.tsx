import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Empresa, Modulo } from '../types/auth';
import { apiService } from '../services/api';

interface UserContextType {
  // Estados principais
  users: User[];
  empresas: Empresa[];
  modulos: Modulo[];
  loading: boolean;
  searchTerm: string;
  filterRole: 'all' | 'admin' | 'comum';
  
  // Estados de paginação
  currentPage: number;
  usersPerPage: number;
  filteredUsers: User[];
  currentUsers: User[];
  totalPages: number;
  indexOfFirstUser: number;
  indexOfLastUser: number;
  
  // Funções
  setSearchTerm: (term: string) => void;
  setFilterRole: (role: 'all' | 'admin' | 'comum') => void;
  setCurrentPage: (page: number) => void;
  fetchData: () => Promise<void>;
  handlePageChange: (page: number) => void;
  addUser: (user: User) => void;
  updateUser: (updatedUser: User) => void;
  deleteUser: (userId: number) => void;
  promoteUser: (userId: number) => void;
  demoteUser: (userId: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  // Carregar dados iniciais
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

  // Funções de gerenciamento de usuários
  const addUser = (user: User) => {
    setUsers(prevUsers => [...prevUsers, user]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
  };

  const deleteUser = (userId: number) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const promoteUser = (userId: number) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, role: 'admin' as const } : user
      )
    );
  };

  const demoteUser = (userId: number) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, role: 'comum' as const } : user
      )
    );
  };

  const value = {
    users,
    empresas,
    modulos,
    loading,
    searchTerm,
    filterRole,
    currentPage,
    usersPerPage,
    filteredUsers,
    currentUsers,
    totalPages,
    indexOfFirstUser,
    indexOfLastUser,
    setSearchTerm,
    setFilterRole,
    setCurrentPage,
    fetchData,
    handlePageChange,
    addUser,
    updateUser,
    deleteUser,
    promoteUser,
    demoteUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};