import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Procedure } from '../types/procedure';
import ProcedureCard from './ProcedureCard';

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
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getGroupColor = (title: string) => {
    const colorMap: { [key: string]: string } = {
      'Alto Ticket': 'border-orange-200 bg-orange-50',
      'Entrada': 'border-green-200 bg-green-50',
      'Recorrência': 'border-blue-200 bg-blue-50',
      'Pacote': 'border-purple-200 bg-purple-50'
    };
    return colorMap[title] || 'border-gray-200 bg-gray-50';
  };

  const getHeaderColor = (title: string) => {
    const colorMap: { [key: string]: string } = {
      'Alto Ticket': 'text-orange-800',
      'Entrada': 'text-green-800',
      'Recorrência': 'text-blue-800',
      'Pacote': 'text-purple-800'
    };
    return colorMap[title] || 'text-gray-800';
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${getGroupColor(title)}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 text-left hover:bg-opacity-80 transition-colors ${getGroupColor(title)}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${getHeaderColor(title)}`}>
              {title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {procedures.length} procedimento{procedures.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className={`transform transition-transform duration-200 ${getHeaderColor(title)} ${isOpen ? 'rotate-0' : ''}`}>
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {procedures.map(procedure => (
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