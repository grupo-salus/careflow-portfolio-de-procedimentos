export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'comum';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  empresas: Empresa[];
  modulos: Modulo[];
}

export interface Empresa {
  id: number;
  nome: string;
  razao_social?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Modulo {
  id: number;
  nome: string;
  slug: string;
  descricao?: string;
  icone?: string;
  ordem: number;
  is_admin_only: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
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

// Tipos para erros da API
export interface ApiError {
  detail: string;
  message?: string;
  status_code?: number;
}

export interface UserCreateData {
  email: string;
  full_name: string;
  password: string;
  role?: 'admin' | 'comum';
  empresas_ids?: number[];
  modulos_ids?: number[];
}

export interface UserUpdateData {
  email?: string;
  full_name?: string;
  password?: string;
  role?: 'admin' | 'comum';
  empresas_ids?: number[];
  modulos_ids?: number[];
}

export interface PasswordResetResponse {
  new_password: string;
  message: string;
}

// Tipos para filtros e paginação
export interface UserFilters {
  search?: string;
  role?: 'admin' | 'comum' | 'all';
  empresa_id?: number;
  modulo_id?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
} 