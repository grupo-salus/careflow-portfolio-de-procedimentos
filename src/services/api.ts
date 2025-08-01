import { LoginCredentials, AuthResponse, User, Empresa, Modulo } from '../types/auth';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Credenciais inválidas');
      } catch (parseError) {
        // Se não conseguir fazer parse do JSON, usar mensagem padrão
        throw new Error('Credenciais inválidas. Verifique seu email e senha.');
      }
    }

    const data: AuthResponse = await response.json();
    localStorage.setItem('access_token', data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao obter dados do usuário');
    }

    return response.json();
  }

  async updateProfile(userData: {
    email?: string;
    full_name?: string;
    password?: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar perfil');
      } catch (parseError) {
        throw new Error('Erro ao atualizar perfil');
      }
    }

    return response.json();
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('access_token');
    }
  }

  // Verificar se o token é válido
  async checkAuth(): Promise<boolean> {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      localStorage.removeItem('access_token');
      return false;
    }
  }

  // Métodos para gerenciar usuários
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao obter lista de usuários');
    }

    return response.json();
  }

  async getUserById(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao obter dados do usuário');
    }

    return response.json();
  }

  async createUser(userData: {
    email: string;
    full_name: string;
    password: string;
    role: 'admin' | 'comum';
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar usuário');
      } catch (parseError) {
        throw new Error('Erro ao criar usuário');
      }
    }

    return response.json();
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar usuário');
    }

    return response.json();
  }

  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao deletar usuário');
      } catch (parseError) {
        throw new Error('Erro ao deletar usuário');
      }
    }
  }

  async resetUserPassword(userId: number): Promise<{ message: string; new_password: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao resetar senha');
      } catch (parseError) {
        throw new Error('Erro ao resetar senha');
      }
    }

    return response.json();
  }

  async promoteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/promote`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao promover usuário');
      } catch (parseError) {
        throw new Error('Erro ao promover usuário');
      }
    }
  }

  async demoteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/demote`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao rebaixar usuário');
      } catch (parseError) {
        throw new Error('Erro ao rebaixar usuário');
      }
    }
  }

  // Métodos para gerenciar empresas
  async getEmpresas(): Promise<Empresa[]> {
    const response = await fetch(`${API_BASE_URL}/empresas`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao obter lista de empresas');
    }

    return response.json();
  }

  // Métodos para gerenciar módulos
  async getModulos(): Promise<Modulo[]> {
    const response = await fetch(`${API_BASE_URL}/modulos`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao obter lista de módulos');
    }

    return response.json();
  }

  // Métodos para associar usuários a empresas
  async addUserToEmpresa(userId: number, empresaId: number, isAdminEmpresa: boolean = false): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/empresas`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        empresa_id: empresaId,
        is_admin_empresa: isAdminEmpresa
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao adicionar usuário à empresa');
    }
  }

  async removeUserFromEmpresa(userId: number, empresaId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/empresas/${empresaId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao remover usuário da empresa');
    }
  }

  // Métodos para associar usuários a módulos
  async addUserToModulo(userId: number, moduloId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/modulos`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        modulo_id: moduloId
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao adicionar usuário ao módulo');
    }
  }

  async removeUserFromModulo(userId: number, moduloId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/modulos/${moduloId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao remover usuário do módulo');
    }
  }
}

export const apiService = new ApiService(); 