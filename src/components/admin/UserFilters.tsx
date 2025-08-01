import React from 'react';
import { Search, Plus } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterRole: 'all' | 'admin' | 'comum';
  onFilterRoleChange: (value: 'all' | 'admin' | 'comum') => void;
  onAddUser: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  onAddUser
}) => {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro por Role */}
        <div>
          <select
            value={filterRole}
            onChange={(e) => onFilterRoleChange(e.target.value as 'admin' | 'comum' | 'all')}
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
            onClick={onAddUser}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;