/**
 * Utilitário para gerenciar URLs de imagens que funcionem tanto em desenvolvimento quanto no GitHub Pages
 */

// Função para obter a URL base correta baseada no ambiente
export const getBaseUrl = (): string => {
  // Em desenvolvimento, usar caminho relativo (Vite serve public/ na raiz)
  if (import.meta.env.DEV) {
    return "";
  }

  // Em produção (GitHub Pages), usar a base URL do repositório
  return "/careflow-portfolio-de-procedimentos";
};

// Função alternativa que usa a base URL do Vite
export const getViteBaseUrl = (): string => {
  return import.meta.env.BASE_URL || "";
};

// Função para obter URL de imagem do logo
export const getLogoUrl = (): string => {
  return `${getViteBaseUrl()}careflow.png`;
};

// Função para obter URL de imagem de procedimento
export const getProcedureImageUrl = (imageName: string): string => {
  return `${getViteBaseUrl()}procedimentos/${imageName}`;
};

// Função para obter URL de favicon
export const getFaviconUrl = (): string => {
  return `${getViteBaseUrl()}favicon.png`;
};
