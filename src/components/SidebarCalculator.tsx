import React, { useState, useMemo } from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { Procedure } from "../types/procedure";
import { getTipoColors } from "../utils/typeColors";

interface SidebarCalculatorProps {
  procedures: Procedure[];
  selectedProcedure: Procedure | null;
  onProcedureSelect: (procedure: Procedure | null) => void;
  isOpen: boolean;

}

type CategoryFilter = "todos" | "financeiro" | "comercial";

const SidebarCalculator: React.FC<SidebarCalculatorProps> = ({
  procedures,
  selectedProcedure,
  onProcedureSelect,
  isOpen,

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
      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0 w-80" : "-translate-x-full w-0"}
        `}
        style={{ height: "100%" }}
      >
        {isOpen && (
          <div className="p-4 overflow-y-auto h-full pb-20">
            <div className="space-y-4">
              {/* Search */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900 text-sm">Buscar Procedimento</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar procedimento..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
              </div>

              {/* Dropdowns */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900 text-sm">Filtros</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Categoria */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:bg-white focus:border-gray-400 text-sm"
                    >
                      <option value="todos">Todas</option>
                      <option value="financeiro">Financeiro</option>
                      <option value="comercial">Comercial</option>
                    </select>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={tipoFilter}
                      onChange={(e) => setTipoFilter(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:bg-white focus:border-gray-400 text-sm"
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
                    className="flex items-center gap-2 mt-2 px-3 py-1.5 text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Limpar Filtros
                  </button>
                )}
              </div>

              {/* Selected Procedure */}
              {selectedProcedure && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Procedimento Selecionado</h3>
                    <button
                      onClick={clearSelection}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: getTipoColors(selectedProcedure.tipo).backgroundColor,
                          color: getTipoColors(selectedProcedure.tipo).color,
                        }}
                      >
                        {selectedProcedure.tipo}
                      </span>
                      <span className="text-xs text-gray-600">
                        {selectedProcedure.categoria}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {selectedProcedure.nome}
                    </h4>
                    <p className="text-xs text-gray-600">
                      R$ {selectedProcedure.precoSugerido.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              )}

              {/* Procedures List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">
                    Procedimentos ({filteredProcedures.length})
                  </span>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredProcedures.map((procedure) => (
                    <div
                      key={procedure.id}
                      onClick={() => handleProcedureClick(procedure)}
                      className={`
                        p-2 border rounded-lg cursor-pointer transition-all duration-200
                        ${
                          selectedProcedure?.id === procedure.id
                            ? "border-purple-300 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="px-2 py-0.5 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: getTipoColors(procedure.tipo).backgroundColor,
                                color: getTipoColors(procedure.tipo).color,
                              }}
                            >
                              {procedure.tipo}
                            </span>
                            <span className="text-xs text-gray-500">
                              {procedure.categoria}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 text-xs mb-1">
                            {procedure.nome}
                          </h4>
                          <p className="text-xs text-gray-600">
                            R$ {procedure.precoSugerido.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SidebarCalculator; 