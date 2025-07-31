import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getLogoUrl } from '../utils/imageUtils';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login({ email, password });
      if (success) {
        // Redirecionar para o primeiro módulo disponível ou dashboard
        navigate('/portfolio');
      } else {
        setError('Credenciais inválidas. Verifique seu email e senha.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Círculos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculo grande no canto superior esquerdo */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30"></div>
        
        {/* Círculo médio no canto superior direito */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full opacity-30"></div>
        
        {/* Círculo pequeno no meio esquerdo */}
        <div className="absolute top-1/3 -left-10 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30"></div>
        
        {/* Círculo médio no meio direito */}
        <div className="absolute top-1/2 right-20 w-28 h-28 bg-gradient-to-br from-pink-200 to-red-200 rounded-full opacity-30"></div>
        
        {/* Círculo pequeno no canto inferior esquerdo */}
        <div className="absolute bottom-20 left-10 w-20 h-20 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-30"></div>
        
        {/* Círculo grande no canto inferior direito */}
        <div className="absolute -bottom-20 -right-20 w-36 h-36 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full opacity-30"></div>
        
        {/* Círculo flutuante no centro */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-20"></div>
      </div>

      {/* Container principal */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo acima */}
        <div className="text-center">
          <img 
            src={getLogoUrl()} 
            alt="CareFlow Logo" 
            className="h-16 w-auto mx-auto mb-8"
          />
        </div>

        {/* Container do formulário */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          {/* Título */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo
            </h2>
            <p className="text-sm text-gray-600">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Formulário */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isLoading ? 'var(--careflow-gradient)' : 'var(--careflow-gradient)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'var(--careflow-gradient-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'var(--careflow-gradient)';
                  }
                }}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </div>
                ) : (
                  'Entrar no Sistema'
                )}
              </button>
            </div>

            {/* Informações de Demo */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Credenciais de Demonstração
              </h3>
              <div className="text-xs text-purple-700 space-y-1">
                <p><strong>Email:</strong> admin@careflow.com</p>
                <p><strong>Senha:</strong> CareFlow123!</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 