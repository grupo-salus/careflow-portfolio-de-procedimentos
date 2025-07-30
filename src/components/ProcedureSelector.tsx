import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Procedure } from "../types/procedure";
import { getTipoColors } from "../utils/typeColors";
import { getProcedureImageUrl } from "../utils/imageUtils";

interface ProcedureSelectorProps {
  procedures: Procedure[];
  selectedProcedure: Procedure | null;
  onProcedureSelect: (procedure: Procedure | null) => void;
}

type CategoryFilter = "todos" | "financeiro" | "comercial";

const ProcedureSelector: React.FC<ProcedureSelectorProps> = ({
  procedures,
  selectedProcedure,
  onProcedureSelect,
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

    // Filtro por categoria (usando o campo categoria do JSON)
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
    setSearchTerm("");
  };

  const clearSelection = () => {
    onProcedureSelect(null);
    setSearchTerm("");
  };

  const clearFilters = () => {
    setCategoryFilter("todos");
    setTipoFilter("todos");
    setSearchTerm("");
  };

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-xl h-full flex flex-col">
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Search className="w-4 h-4" />
        Selecione o Procedimento
      </h3>

      <div className="space-y-3 flex-1">
        {/* Campo de busca */}
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

        {/* Filtros com dropdowns */}
        <div className="flex gap-2">
          {/* Dropdown Categoria */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as CategoryFilter)
              }
              className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="todos">Todas</option>
              <option value="financeiro">Financeiro</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>
          {/* Dropdown Tipo */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              {availableTipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo === "todos" ? "Todos" : tipo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        {(categoryFilter !== "todos" ||
          tipoFilter !== "todos" ||
          searchTerm) && (
          <button
            onClick={clearFilters}
            className="w-full px-2 py-1 text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-200 transition-all duration-200"
          >
            Limpar Filtros
          </button>
        )}

        {/* Procedimento selecionado */}
        {selectedProcedure && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {selectedProcedure.nome}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium"
                    style={getTipoColors(selectedProcedure.tipo)}
                  >
                    {selectedProcedure.tipo}
                  </span>
                  <span className="text-xs text-gray-500">
                    {selectedProcedure.categoria.charAt(0).toUpperCase() +
                      selectedProcedure.categoria.slice(1)}
                  </span>
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
        )}

        {/* Lista de procedimentos com altura limitada */}
        {!selectedProcedure && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-64">
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
                  className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {procedure.nome}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium"
                        style={getTipoColors(procedure.tipo)}
                      >
                        {procedure.tipo}
                      </span>
                      <span className="text-xs text-gray-500">
                        {procedure.categoria.charAt(0).toUpperCase() +
                          procedure.categoria.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        R$ {procedure.precoSugerido.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcedureSelector;
