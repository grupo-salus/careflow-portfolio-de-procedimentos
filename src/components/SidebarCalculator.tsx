import React, { useState, useMemo } from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { Procedure } from "../types/procedure";
import { getTipoColors } from "../utils/typeColors";

interface SidebarCalculatorProps {
  procedures: Procedure[];
  selectedProcedure: Procedure | null;
  onProcedureSelect: (procedure: Procedure | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

type CategoryFilter = "todos" | "financeiro" | "comercial";

const SidebarCalculator: React.FC<SidebarCalculatorProps> = ({
  procedures,
  selectedProcedure,
  onProcedureSelect,
  isOpen,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");

  // Detectar tipos únicos automaticamente do JSON
  const availableTipos = useMemo(() => {
    const tipos = [...new Set(procedures.map((procedure) => procedure.tipo))];
    return ["todos", ...tipos];
  }, [procedures]);

  const filteredProcedures = useMemo(() => {
    let filtered = procedures;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter((procedure) =>
        procedure.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (categoryFilter !== "todos") {
      filtered = filtered.filter(
        (procedure) => procedure.categoria === categoryFilter
      );
    }

    // Filtro por tipo
    if (tipoFilter !== "todos") {
      filtered = filtered.filter((procedure) => procedure.tipo === tipoFilter);
    }

    return filtered;
  }, [procedures, searchTerm, categoryFilter, tipoFilter]);

  const handleProcedureClick = (procedure: Procedure) => {
    onProcedureSelect(procedure);
  };

  const clearSelection = () => {
    onProcedureSelect(null);
  };

  const clearFilters = () => {
    setCategoryFilter("todos");
    setTipoFilter("todos");
    setSearchTerm("");
  };

  const hasActiveFilters = categoryFilter !== "todos" || tipoFilter !== "todos" || searchTerm;

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
      <div
        className={`
          fixed lg:relative left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ height: "100%" }}
      >
        

        <div className="p-6 overflow-y-auto h-full pb-20">
          <div className="space-y-6">
            {/* Search */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">Buscar Procedimento</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar procedimento..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            {/* Dropdowns */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">Filtros</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:bg-white focus:border-gray-400"
                  >
                    <option value="todos">Todas</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="comercial">Comercial</option>
                  </select>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:bg-white focus:border-gray-400"
                  >
                    {availableTipos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo === "todos" ? "Todos" : tipo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 mt-3 px-3 py-2 text-sm bg-gray-100 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpar Filtros
                </button>
              )}
            </div>

            {/* Selected Procedure */}
            {selectedProcedure && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span className="font-medium text-gray-900">Procedimento Selecionado</span>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {selectedProcedure.nome}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={getTipoColors(selectedProcedure.tipo)}
                        >
                          {selectedProcedure.tipo}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                          {selectedProcedure.categoria.charAt(0).toUpperCase() +
                            selectedProcedure.categoria.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Preço sugerido: <span className="font-medium">R$ {selectedProcedure.precoSugerido.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Procedures List */}
            {!selectedProcedure && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">
                    Procedimentos ({filteredProcedures.length})
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                  {filteredProcedures.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum procedimento encontrado</p>
                    </div>
                  ) : (
                    filteredProcedures.map((procedure) => (
                      <button
                        key={procedure.id}
                        onClick={() => handleProcedureClick(procedure)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                      >
                        <h4 className="font-medium text-gray-900 text-sm mb-2">
                          {procedure.nome}
                        </h4>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium"
                            style={getTipoColors(procedure.tipo)}
                          >
                            {procedure.tipo}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            {procedure.categoria.charAt(0).toUpperCase() +
                              procedure.categoria.slice(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          R$ {procedure.precoSugerido.toFixed(2)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarCalculator; 