import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Procedure } from "../types/procedure";
import { getTipoColors } from "../utils/typeColors";
import { getProcedureImageUrl } from "../utils/imageUtils";

interface ProcedureSelectorProps {
  procedures: Procedure[];
  selectedProcedure: Procedure | null;
  onProcedureSelect: (procedure: Procedure) => void;
}

const ProcedureSelector: React.FC<ProcedureSelectorProps> = ({
  procedures,
  selectedProcedure,
  onProcedureSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProcedures = useMemo(() => {
    if (!searchTerm) return procedures;
    return procedures.filter((procedure) =>
      procedure.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [procedures, searchTerm]);

  const handleProcedureClick = (procedure: Procedure) => {
    onProcedureSelect(procedure);
    setSearchTerm("");
  };

  const clearSelection = () => {
    onProcedureSelect(null);
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

        {/* Procedimento selecionado */}
        {selectedProcedure && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {selectedProcedure.nome}
                </h4>
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1"
                  style={getTipoColors(selectedProcedure.tipo)}
                >
                  {selectedProcedure.tipo}
                </span>
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
