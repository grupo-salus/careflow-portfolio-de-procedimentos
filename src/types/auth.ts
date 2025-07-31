export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'USER';
  empresas: Empresa[];
  modulos: Modulo[];
}

export interface Empresa {
  id: number;
  nome: string;
  razao_social: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface Modulo {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  icone: string;
  ordem: number;
  is_admin_only: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
} 