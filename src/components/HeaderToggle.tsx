import React from "react";
import { DollarSign, TrendingUp, Briefcase } from "lucide-react";
import { ViewType } from "../types/procedure";

interface HeaderToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const HeaderToggle: React.FC<HeaderToggleProps> = ({
  currentView,
  onViewChange,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  return (
    <div
      className={`bg-white border-b border-gray-200 px-1 py-3 transition-all duration-300 ${
        isSidebarOpen ? "lg:ml-80" : "ml-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Menu Burger */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${
                isSidebarOpen ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                // X icon
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </>
              ) : (
                // Hamburger icon
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </>
              )}
            </svg>
          </button>

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
