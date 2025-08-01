import React from "react";
import {
  Search,
  Filter,
  Tag,
  Clock,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { FilterState } from "../types/procedure";


interface SidebarFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableLabels: string[];
  priceRange: [number, number];
  timeRange: [number, number];
  isOpen: boolean;

}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  filters,
  onFiltersChange,
  availableLabels,
  priceRange,
  timeRange,
  isOpen,

}) => {
  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      selectedLabels: [],
      tempoMin: timeRange[0],
      tempoMax: timeRange[1],
      precoMin: priceRange[0],
      precoMax: priceRange[1],
    });
  };

  const toggleLabel = (label: string) => {
    const newLabels = filters.selectedLabels.includes(label)
      ? filters.selectedLabels.filter((l) => l !== label)
      : [...filters.selectedLabels, label];

    onFiltersChange({ ...filters, selectedLabels: newLabels });
  };

  const hasActiveFilters = () => {
    return (
      filters.searchTerm !== "" ||
      filters.selectedLabels.length > 0 ||
      filters.tempoMin !== timeRange[0] ||
      filters.tempoMax !== timeRange[1] ||
      filters.precoMin !== priceRange[0] ||
      filters.precoMax !== priceRange[1]
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0 w-80" : "-translate-x-full w-0"}
        `}
        style={{ height: "100%" }}
      >
        {isOpen && (
          <div className="p-6 overflow-y-auto h-full pb-20">
            {/* Header with Clear Filters Button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter
                  className="w-5 h-5"
                  style={{
                    background:
                      "linear-gradient(120deg, #683FE7 15%, #CA2CB2 50%, #FD9010 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                />
                Filtros
              </h2>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Procedimento
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                  style={{
                    background:
                      "linear-gradient(120deg, #683FE7 15%, #CA2CB2 50%, #FD9010 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, searchTerm: e.target.value })
                  }
                  placeholder="Buscar Procedimento..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            {/* Labels */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Tag
                  className="w-4 h-4"
                  style={{
                    background:
                      "linear-gradient(120deg, #683FE7 15%, #CA2CB2 50%, #FD9010 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                />
                Labels ({filters.selectedLabels.length} selecionadas)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableLabels.map((label) => (
                  <label
                    key={label}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.selectedLabels.includes(label)}
                      onChange={() => toggleLabel(label)}
                      className="rounded focus:ring-2 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tempo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Clock
                  className="w-4 h-4"
                  style={{
                    background:
                      "linear-gradient(120deg, #683FE7 15%, #CA2CB2 50%, #FD9010 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                />
                Tempo de Execução (minutos)
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Mínimo
                  </label>
                  <input
                    type="number"
                    value={filters.tempoMin}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        tempoMin: parseInt(e.target.value) || 0,
                      })
                    }
                    min={timeRange[0]}
                    max={filters.tempoMax}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Máximo
                  </label>
                  <input
                    type="number"
                    value={filters.tempoMax}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        tempoMax: parseInt(e.target.value) || 0,
                      })
                    }
                    min={filters.tempoMin}
                    max={timeRange[1]}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign
                  className="w-4 h-4"
                  style={{
                    background:
                      "linear-gradient(120deg, #683FE7 15%, #CA2CB2 50%, #FD9010 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                />
                Preço (R$)
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Mínimo
                  </label>
                  <input
                    type="number"
                    value={filters.precoMin}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        precoMin: parseInt(e.target.value) || 0,
                      })
                    }
                    min={priceRange[0]}
                    max={filters.precoMax}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Máximo
                  </label>
                  <input
                    type="number"
                    value={filters.precoMax}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        precoMax: parseInt(e.target.value) || 0,
                      })
                    }
                    min={filters.precoMin}
                    max={priceRange[1]}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SidebarFilters;
