import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User } from '../types/auth';
import { User as UserIcon, Lock, Eye, EyeOff, Copy, Briefcase, Grid3x3 } from 'lucide-react';
import Toast from '../components/Toast';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await apiService.getCurrentUser(); 
      setUser(userData);
    } catch {
      setError('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { text: 'Muito Fraca', color: 'text-red-500', bgColor: 'bg-red-500' };
      case 2:
        return { text: 'Fraca', color: 'text-orange-500', bgColor: 'bg-orange-500' };
      case 3:
        return { text: 'Média', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
      case 4:
        return { text: 'Forte', color: 'text-green-500', bgColor: 'bg-green-500' };
      default:
        return { text: 'Muito Fraca', color: 'text-red-500', bgColor: 'bg-red-500' };
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setToastMessage('As senhas não coincidem');
      setToastType('error');
      setShowToast(true);
      return;
    }
    if (passwordStrength < 4) {
      setToastMessage('A senha deve atender a todos os critérios de segurança');
      setToastType('error');
      setShowToast(true);
      return;
    }
    try {
      setIsChangingPassword(true);
      await apiService.updateProfile({ password: newPassword });
      setToastMessage('Senha alterada com sucesso!');
      setToastType('success');
      setShowToast(true);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(0);
      setShowPassword(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar senha';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage('Copiado para a área de transferência!');
    setToastType('success');
    setShowToast(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        <svg className="animate-spin h-6 w-6 mr-3 text-[var(--careflow-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Carregando perfil...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">{error || 'Usuário não encontrado'}</h3>
          <p className="text-gray-600 mb-4">Não foi possível carregar as informações. Tente novamente.</p>
          <button onClick={loadUserProfile} className="bg-[var(--careflow-primary)] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Tentar novamente
          </button>
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
        {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 min-w-8 min-h-8 bg-gradient-to-r from-[var(--careflow-primary)] to-[var(--careflow-secondary)] rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Meu Perfil
            </h1>
          </div>
        </div>

        {/* Grid responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Informações Pessoais */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Informações Pessoais</h2>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nome Completo</label>
                <p className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-800">{user.full_name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-800 flex items-center justify-between">
                  <span>{user.email}</span>
                  <button onClick={() => copyToClipboard(user.email)} className="text-gray-400 hover:text-[var(--careflow-primary)]" title="Copiar">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Função</label>
                <p><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}</span></p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <p><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ativo</span></p>
              </div>
            </div>
          </div>

          {/* Coluna 2: Segurança */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 flex flex-col h-full">
              <h2 className="text-lg font-semibold text-gray-800">Segurança</h2>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nova Senha</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => handlePasswordChange(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--careflow-primary)]" placeholder="••••••••"/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {newPassword && (
                <div>
                  <div className="flex space-x-1.5 mb-1">
                    {[1, 2, 3, 4].map((level) => (<div key={level} className={`h-1.5 flex-1 rounded-full ${passwordStrength >= level ? getPasswordStrengthText().bgColor : 'bg-gray-200'}`} />))}
                  </div>
                  <p className={`text-xs font-medium ${getPasswordStrengthText().color}`}>Força: {getPasswordStrengthText().text}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Confirmar Nova Senha</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--careflow-primary)]" placeholder="••••••••"/>
              </div>
              <div className="flex-grow"></div>
              <button onClick={handleChangePassword} disabled={isChangingPassword || !newPassword || !confirmPassword || passwordStrength < 4} className="w-full bg-gradient-to-r from-[var(--careflow-primary)] to-[var(--careflow-secondary)] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center space-x-2">
                {isChangingPassword ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Alterando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Alterar Senha</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Coluna 3: Acessos e Associações */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Acessos e Associações</h2>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Grid3x3 className="w-4 h-4 mr-2 text-gray-400"/>
                  Módulos Acessíveis
                </h3>
                {user.modulos && user.modulos.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {user.modulos.map((modulo) => (
                      <div key={modulo.id} className="flex items-center p-2.5 bg-gray-50 rounded-lg text-sm">
                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-purple-700 text-xs font-bold">{modulo.nome.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-gray-800 font-medium">{modulo.nome}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">Nenhum módulo associado.</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400"/>
                  Empresas Associadas
                </h3>
                {user.empresas && user.empresas.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {user.empresas.map((empresa) => (
                      <div key={empresa.id} className="flex items-center p-2.5 bg-gray-50 rounded-lg text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-700 text-xs font-bold">{empresa.nome.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-gray-800 font-medium">{empresa.nome}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">Nenhuma empresa associada.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;