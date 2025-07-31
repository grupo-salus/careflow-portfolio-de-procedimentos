import React from "react";
import { Briefcase, Calculator } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface HeaderToggleProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const HeaderToggle: React.FC<HeaderToggleProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const location = useLocation();
  const isPortfolioPage = location.pathname === "/";
  const isCalculatorPage = location.pathname === "/calculadora";
  const showSidebarToggle = isPortfolioPage || isCalculatorPage;

  return (
    <div
      className={`bg-white border-b border-gray-200 px-6 py-4 transition-all duration-300 ${
        isSidebarOpen ? "lg:ml-80" : "ml-0"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Menu and Navigation */}
        <div className="flex items-center gap-6">
          {/* Menu Burger (Portfolio and Calculator pages) */}
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${
                  isSidebarOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="url(#careflowGradient)"
                viewBox="0 0 24 24"
              >
                <defs>
                  <linearGradient
                    id="careflowGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="15%" stopColor="#683fe7" />
                    <stop offset="50%" stopColor="#ca2cb2" />
                    <stop offset="100%" stopColor="#fd9010" />
                  </linearGradient>
                </defs>
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
          )}

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === "/"
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span className="font-medium">Portfolio</span>
            </Link>
            <Link
              to="/calculadora"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === "/calculadora"
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="font-medium">Calculadora</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderToggle;
