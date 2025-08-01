import React, { useState, useEffect } from 'react';
import { User, Empresa, Modulo } from '../../types/auth';
import { X, Check, AlertCircle } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: {
    id?: number;
    full_name: string;
    email: string;
    password?: string;
    role: 'admin' | 'comum';
    empresas: number[];
    modulos: number[];
  }) => void;
  user: User | null;
  empresas: Empresa[];
  modulos: Modulo[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  empresas,
  modulos
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'comum'>('comum');
  const [selectedEmpresas, setSelectedEmpresas] = useState<number[]>([]);
  const [selectedModulos, setSelectedModulos] = useState<number[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.full_name);
      setEmail(user.email);
      setPassword('');
      setRole(user.role as 'admin' | 'comum');
      setSelectedEmpresas(user.empresas.map(e => e.id));
      setSelectedModulos(user.modulos.map(m => m.id));
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('comum');
      setSelectedEmpresas([]);
      setSelectedModulos([]);
    }
    setPasswordStrength(0);
    setPasswordMessage('');
  }, [user, isOpen]);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    let message = '';

    if (password.length === 0) {
      setPasswordStrength(0);
      setPasswordMessage('');
      return;
    }

    // Verificar comprimento
    if (password.length >= 8) strength += 1;

    // Verificar letras maiúsculas e minúsculas
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;

    // Verificar números
    if (password.match(/[0-9]/)) strength += 1;

    // Verificar caracteres especiais
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

    // Definir mensagem baseada na força
    if (strength === 0) {
      message = 'Muito fraca';
    } else if (strength === 1) {
      message = 'Fraca';
    } else if (strength === 2) {
      message = 'Média';
    } else if (strength === 3) {
      message = 'Forte';
    } else {
      message = 'Muito forte';
    }

    setPasswordStrength(strength);
    setPasswordMessage(message);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleEmpresaToggle = (empresaId: number) => {
    setSelectedEmpresas(prev =>
      prev.includes(empresaId)
        ? prev.filter(id => id !== empresaId)
        : [...prev, empresaId]
    );
  };

  const handleModuloToggle = (moduloId: number) => {
    setSelectedModulos(prev =>
      prev.includes(moduloId)
        ? prev.filter(id => id !== moduloId)
        : [...prev, moduloId]
    );
  };

  const handleSubmit = () => {
    onSave({
      id: user?.id,
      full_name: name,
      email,
      password: password || undefined,
      role,
      empresas: selectedEmpresas,
      modulos: selectedModulos
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {user ? 'Editar Usuário' : 'Adicionar Usuário'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">Informações Básicas</h4>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {user ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required={!user}
                  />
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              passwordStrength === 0 ? 'bg-red-500' :
                              passwordStrength === 1 ? 'bg-orange-500' :
                              passwordStrength === 2 ? 'bg-yellow-500' :
                              passwordStrength === 3 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">{passwordMessage}</span>
                      </div>
                      {passwordStrength < 3 && (
                        <p className="mt-1 text-xs text-red-500 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Senha deve ter pelo menos 8 caracteres, incluir letras maiúsculas, minúsculas, números e caracteres especiais
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <div className="mt-2 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="comum"
                        checked={role === 'comum'}
                        onChange={() => setRole('comum')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Usuário Comum</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={role === 'admin'}
                        onChange={() => setRole('admin')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Administrador</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Permissões */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">Permissões</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empresas</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {empresas.map(empresa => (
                      <div key={empresa.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          id={`empresa-${empresa.id}`}
                          checked={selectedEmpresas.includes(empresa.id)}
                          onChange={() => handleEmpresaToggle(empresa.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`empresa-${empresa.id}`} className="ml-2 block text-sm text-gray-900">
                          {empresa.nome}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Módulos</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {modulos.map(modulo => {
                      const isAdminOnly = ['admin', 'usuarios'].includes(modulo.nome.toLowerCase());
                      const isDisabled = role !== 'admin' && isAdminOnly;
                      
                      return (
                        <div key={modulo.id} className="flex items-center py-1">
                          <input
                            type="checkbox"
                            id={`modulo-${modulo.id}`}
                            checked={selectedModulos.includes(modulo.id) || (isAdminOnly && role === 'admin')}
                            onChange={() => handleModuloToggle(modulo.id)}
                            disabled={isDisabled}
                            className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded ${
                              isDisabled 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-blue-600'
                            }`}
                          />
                          <label 
                            htmlFor={`modulo-${modulo.id}`} 
                            className={`ml-2 block text-sm ${
                              isDisabled 
                                ? 'text-gray-400' 
                                : 'text-gray-900'
                            }`}
                          >
                            {modulo.nome}
                            {isAdminOnly && (
                              <span className="ml-1 text-xs text-orange-500">(Admin)</span>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Check className="w-4 h-4 mr-2" />
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;