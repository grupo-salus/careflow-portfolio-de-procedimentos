import { LoginCredentials, AuthResponse, User } from '../types/auth';

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
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro no login');
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
}

export const apiService = new ApiService(); 