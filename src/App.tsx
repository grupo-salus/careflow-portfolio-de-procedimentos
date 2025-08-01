import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Portfolio from './pages/Portfolio';
import Calculator from './pages/Calculator';
import AdminPanel from './pages/AdminPanel';
import AccessDenied from './pages/AccessDenied';
import UserProfile from './pages/UserProfile';

// Layout principal com navegação
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

// Layout com sidebar para Portfolio e Calculator
const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-1 relative overflow-hidden" style={{ height: "calc(100vh - 72px)" }}>
        {React.cloneElement(children as React.ReactElement, { 
          isSidebarOpen,
          onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen)
        })}
      </div>
    </div>
  );
};

// Componente para redirecionar baseado no primeiro módulo disponível
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (user && user.modulos && user.modulos.length > 0) {
    const firstModule = user.modulos.sort((a, b) => a.ordem - b.ordem)[0];
    return <Navigate to={`/${firstModule.slug}`} replace />;
  }
  
  // Se não tem módulos, ir para portfolio como fallback
  return <Navigate to="/portfolio" replace />;
};

// Componente principal da aplicação
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <Routes>
      {/* Rota de login - pública */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      {/* Rota raiz - redirecionar baseado no primeiro módulo disponível */}
      <Route path="/" element={
        isAuthenticated ? <DashboardRedirect /> : <Navigate to="/login" replace />
      } />
      
      <Route path="/portfolio" element={
        <ProtectedRoute requiredModule="portfolio">
          <SidebarLayout>
            <Portfolio />
          </SidebarLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/calculadora" element={
        <ProtectedRoute requiredModule="calculadora">
          <SidebarLayout>
            <Calculator />
          </SidebarLayout>
        </ProtectedRoute>
      } />
      
      {/* Rotas para módulos administrativos (futuras implementações) */}
      <Route path="/admin_usuarios" element={
        <ProtectedRoute requiredModule="admin_usuarios">
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />
            <div className="flex flex-1 relative h-full">
              <AdminPanel />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/admin_empresas" element={
        <ProtectedRoute requiredModule="admin_empresas">
          <MainLayout>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Gerenciar Empresas
              </h2>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes" element={
        <ProtectedRoute requiredModule="configuracoes">
          <MainLayout>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Configurações
              </h2>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Rota para perfil do usuário */}
      <Route path="/profile" element={
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navigation />
          <div className="flex flex-1 relative h-full">
            <UserProfile />
          </div>
        </div>
      } />
      
      {/* Rota para acesso negado */}
      <Route path="/access-denied" element={<AccessDenied />} />
      
      {/* Rota 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Página não encontrada
            </h2>
            <p className="text-gray-600 mb-4">
              A página que você está procurando não existe.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Voltar
            </button>
          </div>
        </div>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;