import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { ViewType } from '../types/procedure';

interface HeaderToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const HeaderToggle: React.FC<HeaderToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfólio de Procedimentos</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie e visualize todos os procedimentos estéticos</p>
        </div>
        
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewChange('financeiro')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === 'financeiro'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Financeiro
          </button>
          <button
            onClick={() => onViewChange('comercial')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === 'comercial'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Comercial
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderToggle;