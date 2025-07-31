"""
Testes para funcionalidades administrativas e roles
"""
import pytest
from fastapi.testclient import TestClient


class TestAdminEndpoints:
    """Testes para endpoints administrativos"""

    def test_admin_can_list_users(self, client: TestClient, admin_headers):
        """Testar que admin pode listar usuários"""
        response = client.get("/api/v1/admin/users", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_common_user_cannot_list_users(self, client: TestClient, auth_headers):
        """Testar que usuário comum não pode listar usuários"""
        response = client.get("/api/v1/admin/users", headers=auth_headers)
        
        assert response.status_code == 403
        assert "Apenas administradores" in response.json()["detail"]

    def test_admin_can_get_user_details(self, client: TestClient, complete_setup):
        """Testar que admin pode ver detalhes de qualquer usuário"""
        admin_headers = complete_setup["admin"]["headers"]
        user_id = complete_setup["user"]["data"]["id"]
        
        response = client.get(f"/api/v1/admin/users/{user_id}", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert "empresas" in data  # Deve incluir dados de relacionamento
        assert "modulos" in data

    def test_admin_can_update_any_user(self, client: TestClient, complete_setup):
        """Testar que admin pode atualizar qualquer usuário"""
        admin_headers = complete_setup["admin"]["headers"]
        user_id = complete_setup["user"]["data"]["id"]
        
        update_data = {
            "full_name": "Nome Atualizado pelo Admin",
            "role": "admin"  # Admin pode alterar roles
        }
        
        response = client.put(f"/api/v1/admin/users/{user_id}", json=update_data, headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Nome Atualizado pelo Admin"
        assert data["role"] == "admin"

    def test_admin_can_promote_user(self, client: TestClient, complete_setup):
        """Testar promoção de usuário a admin"""
        admin_headers = complete_setup["admin"]["headers"]
        user_id = complete_setup["user"]["data"]["id"]
        
        response = client.post(f"/api/v1/admin/users/{user_id}/promote", headers=admin_headers)
        
        assert response.status_code == 200
        assert "promovido a administrador" in response.json()["message"]
        
        # Verificar se usuário realmente foi promovido
        user_response = client.get(f"/api/v1/admin/users/{user_id}", headers=admin_headers)
        assert user_response.json()["role"] == "admin"

    def test_admin_can_demote_user(self, client: TestClient, complete_setup):
        """Testar rebaixamento de admin a usuário comum"""
        admin_headers = complete_setup["admin"]["headers"]
        user_id = complete_setup["user"]["data"]["id"]
        
        # Primeiro promover
        client.post(f"/api/v1/admin/users/{user_id}/promote", headers=admin_headers)
        
        # Depois rebaixar
        response = client.post(f"/api/v1/admin/users/{user_id}/demote", headers=admin_headers)
        
        assert response.status_code == 200
        assert "rebaixado a comum" in response.json()["message"]
        
        # Verificar se usuário foi rebaixado
        user_response = client.get(f"/api/v1/admin/users/{user_id}", headers=admin_headers)
        assert user_response.json()["role"] == "comum"

    def test_admin_cannot_demote_self(self, client: TestClient, complete_setup):
        """Testar que admin não pode rebaixar a si mesmo"""
        admin_headers = complete_setup["admin"]["headers"]
        admin_id = complete_setup["admin"]["data"]["id"]
        
        response = client.post(f"/api/v1/admin/users/{admin_id}/demote", headers=admin_headers)
        
        assert response.status_code == 400
        assert "não pode rebaixar a si mesmo" in response.json()["detail"]

    def test_admin_can_activate_deactivate_user(self, client: TestClient, complete_setup):
        """Testar ativação/desativação de usuários"""
        admin_headers = complete_setup["admin"]["headers"]
        user_id = complete_setup["user"]["data"]["id"]
        
        # Desativar usuário
        deactivate_response = client.post(f"/api/v1/admin/users/{user_id}/deactivate", headers=admin_headers)
        assert deactivate_response.status_code == 200
        assert "desativado com sucesso" in deactivate_response.json()["message"]
        
        # Verificar se usuário foi desativado
        user_response = client.get(f"/api/v1/admin/users/{user_id}", headers=admin_headers)
        assert user_response.json()["is_active"] is False
        
        # Reativar usuário
        activate_response = client.post(f"/api/v1/admin/users/{user_id}/activate", headers=admin_headers)
        assert activate_response.status_code == 200
        assert "ativado com sucesso" in activate_response.json()["message"]

    def test_admin_cannot_deactivate_self(self, client: TestClient, complete_setup):
        """Testar que admin não pode desativar a si mesmo"""
        admin_headers = complete_setup["admin"]["headers"]
        admin_id = complete_setup["admin"]["data"]["id"]
        
        response = client.post(f"/api/v1/admin/users/{admin_id}/deactivate", headers=admin_headers)
        
        assert response.status_code == 400
        assert "não pode desativar a si mesmo" in response.json()["detail"]

    def test_admin_can_get_user_permissions(self, client: TestClient, complete_setup):
        """Testar que admin pode ver permissões de qualquer usuário"""
        admin_headers = complete_setup["admin"]["headers"]
        user_id = complete_setup["user"]["data"]["id"]
        
        response = client.get(f"/api/v1/admin/users/{user_id}/permissions", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "is_admin" in data
        assert "empresas_ids" in data
        assert "modulos_slugs" in data
        assert "empresas_admin" in data
        
        # Usuário comum não deve ser admin
        assert data["is_admin"] is False
        # Deve ter acesso a pelo menos uma empresa
        assert len(data["empresas_ids"]) >= 1

    def test_admin_can_get_system_stats(self, client: TestClient, admin_headers):
        """Testar que admin pode ver estatísticas do sistema"""
        response = client.get("/api/v1/admin/stats", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "usuarios" in data
        assert "empresas" in data
        assert "modulos" in data
        
        # Verificar estrutura das estatísticas
        assert "total" in data["usuarios"]
        assert "admins" in data["usuarios"]
        assert "comuns" in data["usuarios"]
        assert "ativos" in data["usuarios"]

    def test_common_user_cannot_access_admin_stats(self, client: TestClient, auth_headers):
        """Testar que usuário comum não pode ver estatísticas"""
        response = client.get("/api/v1/admin/stats", headers=auth_headers)
        
        assert response.status_code == 403
        assert "Apenas administradores" in response.json()["detail"]


class TestRoleBasedAccess:
    """Testes para controle de acesso baseado em roles"""

    def test_admin_sees_all_empresas(self, client: TestClient, complete_setup, sample_empresa_data_2):
        """Testar que admin vê todas as empresas do sistema"""
        admin_headers = complete_setup["admin"]["headers"]
        
        # Criar segunda empresa
        client.post("/api/v1/empresas/", json=sample_empresa_data_2, headers=admin_headers)
        
        # Admin deve ver todas as empresas
        response = client.get("/api/v1/empresas/", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2  # Pelo menos as duas empresas criadas

    def test_common_user_sees_only_own_empresas(self, client: TestClient, complete_setup, sample_empresa_data_2):
        """Testar que usuário comum só vê suas empresas"""
        admin_headers = complete_setup["admin"]["headers"]
        user_headers = complete_setup["user"]["headers"]
        
        # Criar segunda empresa (sem associar ao usuário comum)
        client.post("/api/v1/empresas/", json=sample_empresa_data_2, headers=admin_headers)
        
        # Usuário comum deve ver apenas sua empresa
        response = client.get("/api/v1/empresas/", headers=user_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1  # Apenas a empresa que tem acesso

    def test_admin_can_access_admin_only_modulos(self, client: TestClient, complete_setup, sample_modulo_admin_data):
        """Testar que admin pode acessar módulos admin-only"""
        admin_headers = complete_setup["admin"]["headers"]
        
        # Criar módulo admin-only
        modulo_response = client.post("/api/v1/modulos/", json=sample_modulo_admin_data, headers=admin_headers)
        modulo_slug = modulo_response.json()["slug"]
        
        # Admin deve conseguir acessar
        response = client.get(f"/api/v1/modulos/slug/{modulo_slug}", headers=admin_headers)
        
        assert response.status_code == 200
        assert response.json()["is_admin_only"] is True

    def test_role_permissions_are_consistent(self, client: TestClient, complete_setup):
        """Testar que permissões são consistentes com o role do usuário"""
        admin_headers = complete_setup["admin"]["headers"]
        user_headers = complete_setup["user"]["headers"]
        
        # Verificar permissões do admin
        admin_perms_response = client.get("/api/v1/auth/me/permissions", headers=admin_headers)
        admin_perms = admin_perms_response.json()
        assert admin_perms["is_admin"] is True
        
        # Verificar permissões do usuário comum
        user_perms_response = client.get("/api/v1/auth/me/permissions", headers=user_headers)
        user_perms = user_perms_response.json()
        assert user_perms["is_admin"] is False
        
        # Admin deve ter mais módulos que usuário comum
        assert len(admin_perms["modulos_slugs"]) >= len(user_perms["modulos_slugs"])

    def test_promoted_user_gets_admin_permissions(self, client: TestClient, complete_setup):
        """Testar que usuário promovido ganha permissões de admin"""
        admin_headers = complete_setup["admin"]["headers"]
        user_id = complete_setup["user"]["data"]["id"]
        user_headers = complete_setup["user"]["headers"]
        
        # Verificar permissões antes da promoção
        perms_before = client.get("/api/v1/auth/me/permissions", headers=user_headers)
        assert perms_before.json()["is_admin"] is False
        
        # Promover usuário
        client.post(f"/api/v1/admin/users/{user_id}/promote", headers=admin_headers)
        
        # Verificar permissões após promoção
        perms_after = client.get("/api/v1/auth/me/permissions", headers=user_headers)
        assert perms_after.json()["is_admin"] is True
        
        # Usuário agora deve conseguir acessar endpoints admin
        admin_response = client.get("/api/v1/admin/users", headers=user_headers)
        assert admin_response.status_code == 200