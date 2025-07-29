import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Procedure } from "../types/procedure";
import ProcedureCard from "./ProcedureCard";

interface AccordionGroupProps {
  title: string;
  procedures: Procedure[];
  onProcedureClick: (procedure: Procedure) => void;
  defaultOpen?: boolean;
}

const AccordionGroup: React.FC<AccordionGroupProps> = ({
  title,
  procedures,
  onProcedureClick,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-all duration-200 border-b border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {procedures.length} procedimento
              {procedures.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div
            className={`transform transition-transform duration-200 text-gray-500 ${
              isOpen ? "rotate-0" : ""
            }`}
          >
            {isOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {procedures.map((procedure) => (
              <ProcedureCard
                key={procedure.id}
                procedure={procedure}
                onClick={() => onProcedureClick(procedure)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccordionGroup;
