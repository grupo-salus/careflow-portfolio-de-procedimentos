import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Modulo } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: string; // slug do módulo necessário
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredModule 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Se ainda está carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se um módulo específico é necessário, verificar se o usuário tem acesso
  if (requiredModule && user) {
    const hasModuleAccess = user.modulos.some(
      (modulo: Modulo) => modulo.slug === requiredModule
    );

    if (!hasModuleAccess) {
      // Redirecionar para o primeiro módulo disponível ou mostrar erro
      const firstModule = user.modulos.sort((a, b) => a.ordem - b.ordem)[0];
      if (firstModule) {
        return <Navigate to={`/${firstModule.slug}`} replace />;
      } else {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acesso Negado
              </h2>
              <p className="text-gray-600">
                Você não tem permissão para acessar este módulo.
              </p>
            </div>
          </div>
        );
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 