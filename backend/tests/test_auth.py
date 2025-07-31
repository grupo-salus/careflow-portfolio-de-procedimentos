"""
Testes para endpoints de autenticação
"""
import pytest
from fastapi.testclient import TestClient


class TestAuthEndpoints:
    """Testes para endpoints de autenticação"""

    def test_app_health_check(self, client: TestClient):
        """Testar endpoint de saúde da aplicação"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "CareFlow Authentication API"
        assert data["status"] == "online"

    def test_health_endpoint(self, client: TestClient):
        """Testar endpoint /health"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_register_user_success(self, client: TestClient, sample_user_data):
        """Testar registro de usuário com sucesso"""
        response = client.post("/api/v1/auth/register", json=sample_user_data)
        
        assert response.status_code == 201
        data = response.json()
        
        # Verificar dados retornados
        assert data["email"] == sample_user_data["email"]
        assert data["full_name"] == sample_user_data["full_name"]
        assert data["role"] == sample_user_data["role"]
        assert data["is_active"] is True
        assert data["is_verified"] is False
        assert "id" in data
        assert "created_at" in data
        assert "hashed_password" not in data  # Senha não deve ser retornada

    def test_register_user_duplicate_email(self, client: TestClient, sample_user_data):
        """Testar erro ao registrar usuário com email duplicado"""
        # Registrar primeiro usuário
        response1 = client.post("/api/v1/auth/register", json=sample_user_data)
        assert response1.status_code == 201
        
        # Tentar registrar novamente com mesmo email
        response2 = client.post("/api/v1/auth/register", json=sample_user_data)
        assert response2.status_code == 400
        assert "Email já cadastrado" in response2.json()["detail"]

    def test_register_user_invalid_email(self, client: TestClient):
        """Testar erro com email inválido"""
        invalid_data = {
            "email": "email-invalido",
            "full_name": "Teste",
            "password": "senha123"
        }
        
        response = client.post("/api/v1/auth/register", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_register_user_missing_fields(self, client: TestClient):
        """Testar erro com campos obrigatórios ausentes"""
        incomplete_data = {
            "email": "teste@exemplo.com"
            # Faltando full_name e password
        }
        
        response = client.post("/api/v1/auth/register", json=incomplete_data)
        assert response.status_code == 422

    def test_login_success(self, client: TestClient, created_user, sample_user_data):
        """Testar login com sucesso"""
        login_data = {
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 50  # JWT deve ser longo

    def test_login_invalid_email(self, client: TestClient, created_user):
        """Testar erro de login com email inexistente"""
        login_data = {
            "email": "inexistente@exemplo.com",
            "password": "qualquersenha"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Email ou senha incorretos" in response.json()["detail"]

    def test_login_invalid_password(self, client: TestClient, created_user, sample_user_data):
        """Testar erro de login com senha incorreta"""
        login_data = {
            "email": sample_user_data["email"],
            "password": "senha_errada"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Email ou senha incorretos" in response.json()["detail"]

    def test_login_oauth2_format(self, client: TestClient, created_user, sample_user_data):
        """Testar login no formato OAuth2 (para docs)"""
        form_data = {
            "username": sample_user_data["email"],  # OAuth2 usa 'username'
            "password": sample_user_data["password"]
        }
        
        response = client.post("/api/v1/auth/token", data=form_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_get_current_user_success(self, client: TestClient, auth_headers, sample_user_data):
        """Testar obter dados do usuário atual com token válido"""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["email"] == sample_user_data["email"]
        assert data["full_name"] == sample_user_data["full_name"]
        assert data["role"] == sample_user_data["role"]
        assert data["is_active"] is True
        assert "hashed_password" not in data

    def test_get_current_user_no_token(self, client: TestClient):
        """Testar erro ao acessar dados sem token"""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 403  # Sem Authorization header

    def test_get_current_user_invalid_token(self, client: TestClient):
        """Testar erro com token inválido"""
        headers = {"Authorization": "Bearer token_invalido"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401
        assert "Não foi possível validar as credenciais" in response.json()["detail"]

    def test_get_current_user_malformed_token(self, client: TestClient):
        """Testar erro com token mal formado"""
        headers = {"Authorization": "InvalidFormat"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 403  # HTTPBearer validation error

    def test_full_auth_flow(self, client: TestClient, sample_user_data):
        """Testar fluxo completo: registro -> login -> acesso a rota protegida"""
        # 1. Registrar usuário
        register_response = client.post("/api/v1/auth/register", json=sample_user_data)
        assert register_response.status_code == 201
        
        # 2. Fazer login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": sample_user_data["email"],
                "password": sample_user_data["password"]
            }
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # 3. Usar token para acessar dados do usuário
        headers = {"Authorization": f"Bearer {token}"}
        me_response = client.get("/api/v1/auth/me", headers=headers)
        assert me_response.status_code == 200
        
        user_data = me_response.json()
        assert user_data["email"] == sample_user_data["email"]
        assert user_data["full_name"] == sample_user_data["full_name"]
        assert user_data["role"] == sample_user_data["role"]


class TestNewAuthFeatures:
    """Testes para novas funcionalidades de autenticação"""

    def test_get_user_permissions(self, client: TestClient, auth_headers):
        """Testar endpoint de permissões do usuário"""
        response = client.get("/api/v1/auth/me/permissions", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "is_admin" in data
        assert "empresas_ids" in data
        assert "modulos_slugs" in data
        assert "empresas_admin" in data
        assert isinstance(data["empresas_ids"], list)
        assert isinstance(data["modulos_slugs"], list)
        assert isinstance(data["empresas_admin"], list)

    def test_update_own_profile(self, client: TestClient, auth_headers):
        """Testar atualização do próprio perfil"""
        update_data = {
            "full_name": "Nome Atualizado",
            "password": "nova_senha_123"
        }
        
        response = client.put("/api/v1/auth/me", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Nome Atualizado"

    def test_cannot_change_own_role(self, client: TestClient, auth_headers):
        """Testar que usuário não pode alterar o próprio role"""
        update_data = {
            "full_name": "Nome Atualizado",
            "role": "admin"  # Tentar se promover
        }
        
        response = client.put("/api/v1/auth/me", json=update_data, headers=auth_headers)
        
        # O endpoint deve processar a atualização mas ignorar o role
        if response.status_code == 200:
            data = response.json()
            # Role deve permanecer 'comum' 
            assert data["role"] == "comum"
            assert data["full_name"] == "Nome Atualizado"
        else:
            # Se retornar erro, também é aceitável (validação mais restritiva)
            assert response.status_code in [400, 422]

    def test_admin_can_access_admin_endpoints(self, client: TestClient, admin_headers):
        """Testar que admin pode acessar endpoints administrativos"""
        response = client.get("/api/v1/admin/users", headers=admin_headers)
        
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_common_user_cannot_access_admin_endpoints(self, client: TestClient, auth_headers):
        """Testar que usuário comum não pode acessar endpoints administrativos"""
        response = client.get("/api/v1/admin/users", headers=auth_headers)
        
        assert response.status_code == 403
        assert "Apenas administradores" in response.json()["detail"]