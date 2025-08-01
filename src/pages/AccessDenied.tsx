import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Shield, AlertTriangle, Clock } from 'lucide-react';

const AccessDenied: React.FC = () => {
  const { logout } = useAuth();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [logout]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-gray-50">
      <main
        className="transition-all duration-300 p-6 overflow-y-auto flex-1"
        style={{ height: "100%", maxHeight: "100vh" }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 min-w-8 min-h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Acesso Negado
            </h1>
          </div>
        </div>

        {/* Conteúdo centralizado */}
        <div className="flex items-center justify-center h-full">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
            {/* Ícone de Acesso Negado */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <Shield className="h-8 w-8 text-red-600" />
            </div>

            {/* Mensagem */}
            <div className="mb-8">
              <p className="text-gray-600 mb-4">
                Você não tem permissão para acessar este módulo.
              </p>
              <div className="flex items-center justify-center space-x-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-4">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Por segurança, você será desconectado automaticamente.
                </span>
              </div>
              
              {/* Timer */}
              <div className="flex items-center justify-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Logout automático em {countdown} segundos
                </span>
              </div>
            </div>

            {/* Botão de Logout */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair do Sistema</span>
            </button>

            {/* Informação adicional */}
            <p className="text-xs text-gray-500 mt-4">
              Entre em contato com o administrador se você acredita que deveria ter acesso a este módulo.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccessDenied;