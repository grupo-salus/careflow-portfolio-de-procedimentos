import React from "react";
import { DollarSign, TrendingUp, Menu, Briefcase } from "lucide-react";
import { ViewType } from "../types/procedure";

interface HeaderToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onToggleSidebar: () => void;
}

const HeaderToggle: React.FC<HeaderToggleProps> = ({
  currentView,
  onViewChange,
  onToggleSidebar,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Menu Burger */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Logo Careflow */}
          <div className="flex items-center">
            <img
              src="/careflow.png"
              alt="Careflow Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Title with Icon */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--careflow-primary)] to-[var(--careflow-secondary)] rounded-full flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Portfólio de Procedimentos
            </h1>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewChange("financeiro")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === "financeiro"
                ? "bg-white text-[var(--careflow-primary)] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Financeiro
          </button>
          <button
            onClick={() => onViewChange("comercial")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === "comercial"
                ? "bg-white text-[var(--careflow-primary)] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
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
