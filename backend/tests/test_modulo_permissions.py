"""
Testes para permissões de módulos
"""
import pytest
from fastapi.testclient import TestClient


class TestModuloPermissions:
    """Testes para controle de acesso a módulos"""

    def test_admin_can_create_modulo(self, client: TestClient, admin_headers, sample_modulo_data):
        """Testar que admin pode criar módulos"""
        response = client.post("/api/v1/modulos/", json=sample_modulo_data, headers=admin_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == sample_modulo_data["nome"]
        assert data["slug"] == sample_modulo_data["slug"]

    def test_common_user_cannot_create_modulo(self, client: TestClient, auth_headers, sample_modulo_data):
        """Testar que usuário comum não pode criar módulos"""
        response = client.post("/api/v1/modulos/", json=sample_modulo_data, headers=auth_headers)
        
        assert response.status_code == 403
        assert "Apenas administradores" in response.json()["detail"]

    def test_admin_can_list_all_modulos(self, client: TestClient, admin_headers):
        """Testar que admin pode listar todos os módulos"""
        response = client.get("/api/v1/modulos/", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_user_lists_only_accessible_modulos(self, client: TestClient, complete_setup):
        """Testar que usuário comum só vê módulos que tem acesso"""
        user_headers = complete_setup["user"]["headers"]
        
        response = client.get("/api/v1/modulos/me", headers=user_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verificar se usuário só vê módulos que tem acesso
        for modulo in data:
            assert modulo["has_access"] is True

    def test_user_can_access_own_modulo(self, client: TestClient, complete_setup):
        """Testar que usuário pode acessar módulo que pertence"""
        user_headers = complete_setup["user"]["headers"]
        modulo_slug = complete_setup["modulo"]["slug"]
        
        response = client.get(f"/api/v1/modulos/slug/{modulo_slug}", headers=user_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == modulo_slug

    def test_user_cannot_access_admin_only_modulo(self, client: TestClient, complete_setup, sample_modulo_admin_data):
        """Testar que usuário comum não pode acessar módulos admin-only"""
        admin_headers = complete_setup["admin"]["headers"]
        user_headers = complete_setup["user"]["headers"]
        
        # Criar módulo admin-only
        modulo_admin_response = client.post("/api/v1/modulos/", json=sample_modulo_admin_data, headers=admin_headers)
        modulo_admin_slug = modulo_admin_response.json()["slug"]
        
        # Usuário comum tentar acessar módulo admin
        response = client.get(f"/api/v1/modulos/slug/{modulo_admin_slug}", headers=user_headers)
        
        assert response.status_code == 403
        assert f"não tem permissão para acessar o módulo '{modulo_admin_slug}'" in response.json()["detail"]

    def test_admin_can_access_admin_only_modulo(self, client: TestClient, complete_setup, sample_modulo_admin_data):
        """Testar que admin pode acessar módulos admin-only"""
        admin_headers = complete_setup["admin"]["headers"]
        
        # Criar módulo admin-only
        modulo_admin_response = client.post("/api/v1/modulos/", json=sample_modulo_admin_data, headers=admin_headers)
        modulo_admin_slug = modulo_admin_response.json()["slug"]
        
        # Admin acessar módulo admin-only
        response = client.get(f"/api/v1/modulos/slug/{modulo_admin_slug}", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == modulo_admin_slug
        assert data["is_admin_only"] is True

    def test_user_cannot_access_modulo_without_permission(self, client: TestClient, complete_setup, sample_modulo_data_2):
        """Testar que usuário não pode acessar módulo sem permissão"""
        admin_headers = complete_setup["admin"]["headers"]
        user_headers = complete_setup["user"]["headers"]
        
        # Criar segundo módulo (sem associar ao usuário)
        modulo2_data = {
            "nome": "Módulo Sem Acesso",
            "slug": "modulo_sem_acesso",
            "descricao": "Módulo que usuário não tem acesso",
            "icone": "no-access",
            "ordem": 5,
            "is_admin_only": False
        }
        modulo2_response = client.post("/api/v1/modulos/", json=modulo2_data, headers=admin_headers)
        modulo2_slug = modulo2_response.json()["slug"]
        
        # Usuário tentar acessar módulo sem permissão
        response = client.get(f"/api/v1/modulos/slug/{modulo2_slug}", headers=user_headers)
        
        assert response.status_code == 403
        assert f"não tem permissão para acessar o módulo '{modulo2_slug}'" in response.json()["detail"]

    def test_admin_can_update_modulo(self, client: TestClient, admin_headers, sample_modulo_data):
        """Testar que admin pode atualizar módulos"""
        # Criar módulo
        modulo_response = client.post("/api/v1/modulos/", json=sample_modulo_data, headers=admin_headers)
        modulo_id = modulo_response.json()["id"]
        
        # Atualizar módulo
        update_data = {"nome": "Módulo Atualizado"}
        response = client.put(f"/api/v1/modulos/{modulo_id}", json=update_data, headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["nome"] == "Módulo Atualizado"

    def test_user_cannot_update_modulo(self, client: TestClient, complete_setup):
        """Testar que usuário comum não pode atualizar módulos"""
        modulo_id = complete_setup["modulo"]["id"]
        user_headers = complete_setup["user"]["headers"]
        
        update_data = {"nome": "Tentativa de Atualização"}
        response = client.put(f"/api/v1/modulos/{modulo_id}", json=update_data, headers=user_headers)
        
        assert response.status_code == 403
        assert "Apenas administradores" in response.json()["detail"]

    def test_admin_can_delete_modulo(self, client: TestClient, admin_headers, sample_modulo_data):
        """Testar que admin pode desativar módulos"""
        # Criar módulo
        modulo_response = client.post("/api/v1/modulos/", json=sample_modulo_data, headers=admin_headers)
        modulo_id = modulo_response.json()["id"]
        
        # Desativar módulo
        response = client.delete(f"/api/v1/modulos/{modulo_id}", headers=admin_headers)
        
        assert response.status_code == 200
        assert "desativado com sucesso" in response.json()["message"]

    def test_admin_association_to_modulo(self, client: TestClient, complete_setup, sample_user_data_2):
        """Testar associação de usuário a módulo via admin"""
        admin_headers = complete_setup["admin"]["headers"]
        modulo_id = complete_setup["modulo"]["id"]
        
        # Criar segundo usuário
        user2_response = client.post("/api/v1/auth/register", json=sample_user_data_2)
        user2_id = user2_response.json()["id"]
        
        # Associar usuário ao módulo
        response = client.post(f"/api/v1/admin/users/{user2_id}/modulos", json={
            "user_id": user2_id,
            "modulo_id": modulo_id
        }, headers=admin_headers)
        
        assert response.status_code == 200
        assert "adicionado ao módulo com sucesso" in response.json()["message"]

    def test_admin_removal_from_modulo(self, client: TestClient, complete_setup):
        """Testar remoção de usuário de módulo via admin"""
        admin_headers = complete_setup["admin"]["headers"]
        user_data = complete_setup["user"]["data"]
        modulo_id = complete_setup["modulo"]["id"]
        modulo_slug = complete_setup["modulo"]["slug"]
        user_headers = complete_setup["user"]["headers"]
        
        # Remover usuário do módulo
        response = client.delete(f"/api/v1/admin/users/{user_data['id']}/modulos/{modulo_id}", headers=admin_headers)
        
        assert response.status_code == 200
        assert "removido do módulo com sucesso" in response.json()["message"]
        
        # Verificar se usuário perdeu acesso
        modulo_response = client.get(f"/api/v1/modulos/slug/{modulo_slug}", headers=user_headers)
        assert modulo_response.status_code == 403

    def test_list_available_modulos_by_role(self, client: TestClient, admin_headers):
        """Testar listagem de módulos disponíveis por role"""
        response = client.get("/api/v1/modulos/available/for-role", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "admin" in data
        assert "comum" in data
        assert isinstance(data["admin"], list)
        assert isinstance(data["comum"], list)
        
        # Admin deve ter mais módulos disponíveis que usuário comum
        assert len(data["admin"]) >= len(data["comum"])