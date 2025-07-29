import React from 'react';
import { Search, Filter, X, Tag, Clock, DollarSign } from 'lucide-react';
import { FilterState } from '../types/procedure';
import LabelIcon from './LabelIcon';

interface SidebarFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableLabels: string[];
  priceRange: [number, number];
  timeRange: [number, number];
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  filters,
  onFiltersChange,
  availableLabels,
  priceRange,
  timeRange,
  isOpen,
  onToggle
}) => {
  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      selectedLabels: [],
      tempoMin: timeRange[0],
      tempoMax: timeRange[1],
      precoMin: priceRange[0],
      precoMax: priceRange[1],
    });
  };

  const toggleLabel = (label: string) => {
    const newLabels = filters.selectedLabels.includes(label)
      ? filters.selectedLabels.filter(l => l !== label)
      : [...filters.selectedLabels, label];
    
    onFiltersChange({ ...filters, selectedLabels: newLabels });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto h-full pb-20">
          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Procedimento
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                placeholder="Digite o nome do procedimento..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Labels */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Labels ({filters.selectedLabels.length} selecionadas)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableLabels.map(label => (
                <label key={label} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                  <input
                    type="checkbox"
                    checked={filters.selectedLabels.includes(label)}
                    onChange={() => toggleLabel(label)}
                    className="text-blue-600 rounded focus:ring-blue-500"
                  />
                  <LabelIcon label={label} size="sm" className="text-gray-500" />
                  <span className="text-sm text-gray-700 capitalize">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tempo de Sessão (minutos)
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Mínimo: {filters.tempoMin} min</label>
                <input
                  type="range"
                  min={timeRange[0]}
                  max={timeRange[1]}
                  value={filters.tempoMin}
                  onChange={(e) => onFiltersChange({ ...filters, tempoMin: Number(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Máximo: {filters.tempoMax} min</label>
                <input
                  type="range"
                  min={timeRange[0]}
                  max={timeRange[1]}
                  value={filters.tempoMax}
                  onChange={(e) => onFiltersChange({ ...filters, tempoMax: Number(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Faixa de Preço
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Mínimo: R$ {filters.precoMin.toFixed(0)}</label>
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.precoMin}
                  onChange={(e) => onFiltersChange({ ...filters, precoMin: Number(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Máximo: R$ {filters.precoMax.toFixed(0)}</label>
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.precoMax}
                  onChange={(e) => onFiltersChange({ ...filters, precoMax: Number(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarFilters;