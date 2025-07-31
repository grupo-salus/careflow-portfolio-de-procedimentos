import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Modulo } from '../types/auth';
import { getLogoUrl } from '../utils/imageUtils';
import { LogOut, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface NavigationProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Ordenar módulos por ordem
  const sortedModules = user?.modulos.sort((a, b) => a.ordem - b.ordem) || [];

  const getModuleIcon = (iconName: string) => {
    const icons: { [key: string]: JSX.Element } = {
      folder: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      calculator: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      building: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };

    return icons[iconName] || icons.folder;
  };

  // Filtrar apenas módulos não administrativos para o navbar
  const nonAdminModules = sortedModules.filter(modulo => 
    !modulo.slug.includes('admin') && modulo.slug !== 'configuracoes'
  );

  // Módulos administrativos - apenas para usuários admin
  const adminModules = user?.role === 'admin' 
    ? sortedModules.filter(modulo => 
        modulo.slug.includes('admin') || modulo.slug === 'configuracoes'
      )
    : [];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 relative">
      <div className="flex items-center justify-between">
        {/* Left side - Menu Burger and Logo */}
        <div className="flex items-center space-x-4 relative z-50">
          {/* Menu Burger - Sempre visível */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isSidebarOpen ? "Ocultar Sidebar" : "Mostrar Sidebar"}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                // X icon quando sidebar está aberto
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                // Hamburger icon quando sidebar está fechado
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Logo Careflow */}
          <img src={getLogoUrl()} alt="Careflow Logo" className="h-8 w-auto" />
        </div>

        {/* Center - Navigation Links (Desktop only) */}
        <div className="hidden lg:flex items-center space-x-4">
          {nonAdminModules.map((modulo: Modulo) => (
            <Link
              key={modulo.id}
              to={`/${modulo.slug}`}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === `/${modulo.slug}`
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {getModuleIcon(modulo.icone)}
              <span className="font-medium">{modulo.nome}</span>
            </Link>
          ))}

          {/* Administração Dropdown */}
          {adminModules.length > 0 && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Administração</span>
                <ChevronDown className="w-4 h-4" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 focus:outline-none">
                  <div className="py-2">
                    {adminModules.map((modulo: Modulo) => (
                      <Menu.Item key={modulo.id}>
                        {({ active }) => (
                          <Link
                            to={`/${modulo.slug}`}
                            className={`flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 ${
                              location.pathname === `/${modulo.slug}`
                                ? 'bg-purple-100 text-purple-700'
                                : active
                                ? 'bg-gray-50 text-gray-900'
                                : 'text-gray-700'
                            }`}
                          >
                            {getModuleIcon(modulo.icone)}
                            <span>{modulo.nome}</span>
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>

        {/* Right side - User Info, Logout and Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Nome do Usuário - Desktop only */}
          <div className="hidden lg:block">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user?.full_name}</span>
              <span className="text-gray-500 ml-2">({user?.role})</span>
            </div>
          </div>

          {/* Botão de Logout - Visível apenas em telas médias e grandes */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>

          {/* Menu Mobile */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md"
              title="Menu"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div 
          className="lg:hidden absolute top-full bg-white border-l border-gray-200 shadow-2xl z-40 rounded-bl-lg" 
          style={{ 
            right: 0,
            width: isSidebarOpen ? 'calc(100vw - 320px)' : '288px',
            maxWidth: isSidebarOpen ? 'calc(100vw - 320px)' : '288px',
            minWidth: '200px'
          }}
        >
          {/* User Info Mobile */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user?.full_name}</div>
                <div className="text-gray-500 text-xs">{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Navigation Links Mobile */}
          <div className="px-4 py-3 space-y-1">
            {nonAdminModules.map((modulo: Modulo) => (
              <Link
                key={modulo.id}
                to={`/${modulo.slug}`}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-3 transition-all duration-200 hover:shadow-md ${
                  location.pathname === `/${modulo.slug}`
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className={`p-1.5 rounded-lg ${
                  location.pathname === `/${modulo.slug}`
                    ? 'bg-purple-200'
                    : 'bg-gray-100'
                }`}>
                  {getModuleIcon(modulo.icone)}
                </div>
                <span>{modulo.nome}</span>
              </Link>
            ))}

            {/* Administração Section */}
            {adminModules.length > 0 && (
              <div className="pt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administração
                </div>
                {adminModules.map((modulo: Modulo) => (
                  <Link
                    key={modulo.id}
                    to={`/${modulo.slug}`}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-3 transition-all duration-200 hover:shadow-md ${
                      location.pathname === `/${modulo.slug}`
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className={`p-1.5 rounded-lg ${
                      location.pathname === `/${modulo.slug}`
                        ? 'bg-purple-200'
                        : 'bg-gray-100'
                    }`}>
                      {getModuleIcon(modulo.icone)}
                    </div>
                    <span>{modulo.nome}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button - Mobile only */}
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 