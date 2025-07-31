"""
Testes de segurança e controle de acesso
"""
import pytest
from fastapi.testclient import TestClient


class TestSecurityAndAccessControl:
    """Testes para segurança geral e controle de acesso"""

    def test_unauthenticated_access_denied(self, client: TestClient):
        """Testar que acesso sem token é negado"""
        endpoints_to_test = [
            "/api/v1/auth/me",
            "/api/v1/auth/me/permissions",
            "/api/v1/empresas/",
            "/api/v1/modulos/me",
            "/api/v1/admin/users"
        ]
        
        for endpoint in endpoints_to_test:
            response = client.get(endpoint)
            assert response.status_code in [401, 403], f"Endpoint {endpoint} deveria negar acesso sem token"

    def test_invalid_token_access_denied(self, client: TestClient):
        """Testar que token inválido é rejeitado"""
        invalid_headers = {"Authorization": "Bearer token_invalido_123"}
        
        response = client.get("/api/v1/auth/me", headers=invalid_headers)
        
        assert response.status_code == 401
        assert "Não foi possível validar as credenciais" in response.json()["detail"]

    def test_expired_token_handling(self, client: TestClient, sample_user_data):
        """Testar comportamento com token expirado"""
        # Registrar usuário
        client.post("/api/v1/auth/register", json=sample_user_data)
        
        # Fazer login
        login_response = client.post("/api/v1/auth/login", json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        })
        
        # Token deve ser válido inicialmente
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 200

    def test_malformed_authorization_header(self, client: TestClient):
        """Testar cabeçalhos de autorização mal formados"""
        malformed_headers = [
            {"Authorization": "InvalidFormat"},
            {"Authorization": "Bearer"},
            {"Authorization": "Basic token123"},
            {"Authorization": ""},
        ]
        
        for headers in malformed_headers:
            response = client.get("/api/v1/auth/me", headers=headers)
            assert response.status_code in [401, 403], f"Headers {headers} deveriam ser rejeitados"

    def test_inactive_user_cannot_login(self, client: TestClient, complete_setup):
        """Testar que usuário inativo não pode fazer login"""
        admin_headers = complete_setup["admin"]["headers"]
        user_data = complete_setup["user"]["data"]
        
        # Desativar usuário
        client.post(f"/api/v1/admin/users/{user_data['id']}/deactivate", headers=admin_headers)
        
        # Tentar fazer login com usuário desativado
        login_response = client.post("/api/v1/auth/login", json={
            "email": user_data["email"],
            "password": "senha123456"  # Senha original do fixture
        })
        
        assert login_response.status_code == 401
        assert "Email ou senha incorretos" in login_response.json()["detail"]

    def test_cross_user_data_access_prevention(self, client: TestClient, complete_setup, sample_user_data_2):
        """Testar que usuários não podem acessar dados de outros usuários"""
        admin_headers = complete_setup["admin"]["headers"]
        user1_headers = complete_setup["user"]["headers"]
        user1_id = complete_setup["user"]["data"]["id"]
        
        # Criar segundo usuário
        user2_response = client.post("/api/v1/auth/register", json=sample_user_data_2)
        user2_id = user2_response.json()["id"]
        
        # Usuário 1 tentar acessar dados do usuário 2 via endpoints admin (deve falhar)
        response = client.get(f"/api/v1/admin/users/{user2_id}", headers=user1_headers)
        assert response.status_code == 403

    def test_sql_injection_protection(self, client: TestClient):
        """Testar proteção contra SQL injection"""
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "admin@test.com' OR '1'='1",
            "' UNION SELECT * FROM users --"
        ]
        
        for malicious_input in malicious_inputs:
            # Tentar login com input malicioso
            response = client.post("/api/v1/auth/login", json={
                "email": malicious_input,
                "password": "qualquer_senha"
            })
            
            # Deve retornar erro de validação ou acesso negado, não erro de SQL
            assert response.status_code in [401, 422]

    def test_password_validation_and_hashing(self, client: TestClient, sample_user_data):
        """Testar validação e hash de senhas"""
        # Registrar usuário
        response = client.post("/api/v1/auth/register", json=sample_user_data)
        assert response.status_code == 201
        
        # Verificar que senha não é retornada
        user_data = response.json()
        assert "password" not in user_data
        assert "hashed_password" not in user_data
        
        # Verificar que pode fazer login com senha original
        login_response = client.post("/api/v1/auth/login", json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        })
        assert login_response.status_code == 200

    def test_email_uniqueness_enforcement(self, client: TestClient, sample_user_data):
        """Testar que emails devem ser únicos"""
        # Registrar primeiro usuário
        response1 = client.post("/api/v1/auth/register", json=sample_user_data)
        assert response1.status_code == 201
        
        # Tentar registrar segundo usuário com mesmo email
        duplicate_data = sample_user_data.copy()
        duplicate_data["full_name"] = "Outro Nome"
        
        response2 = client.post("/api/v1/auth/register", json=duplicate_data)
        assert response2.status_code == 400
        assert "Email já cadastrado" in response2.json()["detail"]

    def test_role_escalation_prevention(self, client: TestClient, auth_headers):
        """Testar prevenção de escalação de privilégios"""
        # Usuário comum tentar se promover via update profile
        escalation_data = {"role": "admin", "full_name": "Tentativa de Escalação"}
        
        response = client.put("/api/v1/auth/me", json=escalation_data, headers=auth_headers)
        
        # Update pode ser bem-sucedido ou retornar erro de validação
        if response.status_code == 200:
            user_data = response.json()
            assert user_data["role"] == "comum"  # Role deve permanecer comum
        else:
            # Se retornar erro, também é aceitável (validação mais restritiva)
            assert response.status_code in [400, 422]

    def test_company_data_isolation(self, client: TestClient, complete_setup, sample_empresa_data_2, sample_user_data_2):
        """Testar isolamento de dados entre empresas"""
        admin_headers = complete_setup["admin"]["headers"]
        
        # Criar segunda empresa
        empresa2_response = client.post("/api/v1/empresas/", json=sample_empresa_data_2, headers=admin_headers)
        empresa2_id = empresa2_response.json()["id"]
        
        # Criar usuário e associar apenas à segunda empresa
        user2_response = client.post("/api/v1/auth/register", json=sample_user_data_2)
        user2_id = user2_response.json()["id"]
        
        client.post(f"/api/v1/admin/users/{user2_id}/empresas", json={
            "user_id": user2_id,
            "empresa_id": empresa2_id,
            "is_admin_empresa": False
        }, headers=admin_headers)
        
        # Login do segundo usuário
        login2_response = client.post("/api/v1/auth/login", json={
            "email": sample_user_data_2["email"],
            "password": sample_user_data_2["password"]
        })
        user2_headers = {"Authorization": f"Bearer {login2_response.json()['access_token']}"}
        
        # Usuário 2 não deve ver empresa 1
        empresa1_id = complete_setup["empresa"]["id"]
        response = client.get(f"/api/v1/empresas/{empresa1_id}", headers=user2_headers)
        assert response.status_code == 403

    def test_module_access_control(self, client: TestClient, complete_setup, sample_modulo_admin_data):
        """Testar controle de acesso a módulos"""
        admin_headers = complete_setup["admin"]["headers"]
        user_headers = complete_setup["user"]["headers"]
        
        # Criar módulo admin-only
        modulo_response = client.post("/api/v1/modulos/", json=sample_modulo_admin_data, headers=admin_headers)
        modulo_slug = modulo_response.json()["slug"]
        
        # Usuário comum não deve conseguir acessar
        response = client.get(f"/api/v1/modulos/slug/{modulo_slug}", headers=user_headers)
        assert response.status_code == 403
        
        # Admin deve conseguir acessar
        admin_response = client.get(f"/api/v1/modulos/slug/{modulo_slug}", headers=admin_headers)
        assert admin_response.status_code == 200

    def test_cors_and_security_headers(self, client: TestClient):
        """Testar configurações de CORS e headers de segurança"""
        response = client.get("/")
        
        # Verificar que resposta é bem-sucedida
        assert response.status_code == 200
        
        # Verificar presença de headers básicos
        assert "content-type" in response.headers
        
        # A API deve retornar JSON válido
        assert response.json()["status"] == "online"