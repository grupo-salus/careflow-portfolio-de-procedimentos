import React from "react";
import { Clock, DollarSign, Users, Tag } from "lucide-react";
import { Procedure } from "../types/procedure";
import LabelIcon from "./LabelIcon";
import { getTipoColors } from "../utils/typeColors";

interface ProcedureCardProps {
  procedure: Procedure;
  onClick: () => void;
}

const ProcedureCard: React.FC<ProcedureCardProps> = ({
  procedure,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group relative"
    >
      {/* Gradiente overlay para a borda no hover */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: "var(--careflow-gradient)",
          padding: "1px",
          borderRadius: "8px",
        }}
      >
        <div className="w-full h-full bg-white rounded-lg"></div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {procedure.nome}
          </h3>
          <div className="flex-shrink-0 ml-4">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm"
              style={getTipoColors(procedure.tipo)}
            >
              {procedure.tipo}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{procedure.tempoSessaoMin} min</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">
              R$ {procedure.precoSugerido.toFixed(0)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {procedure.numeroSessoes} sessão
              {procedure.numeroSessoes > 1 ? "ões" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Tag className="w-4 h-4" />
            <span className="text-sm">{procedure.labels.length} labels</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {procedure.labels.slice(0, 4).map((label, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
            >
              <LabelIcon label={label} size="sm" />
              <span className="capitalize">{label}</span>
            </div>
          ))}
          {procedure.labels.length > 4 && (
            <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
              +{procedure.labels.length - 4} mais
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcedureCard;
