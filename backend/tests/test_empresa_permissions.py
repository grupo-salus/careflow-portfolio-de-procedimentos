"""
Testes para permissões de empresas
"""
import pytest
from fastapi.testclient import TestClient


class TestEmpresaPermissions:
    """Testes para controle de acesso a empresas"""

    def test_admin_can_create_empresa(self, client: TestClient, admin_headers, sample_empresa_data):
        """Testar que admin pode criar empresas"""
        response = client.post("/api/v1/empresas/", json=sample_empresa_data, headers=admin_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == sample_empresa_data["nome"]
        assert data["cnpj"] == sample_empresa_data["cnpj"]

    def test_common_user_cannot_create_empresa(self, client: TestClient, auth_headers, sample_empresa_data):
        """Testar que usuário comum não pode criar empresas"""
        response = client.post("/api/v1/empresas/", json=sample_empresa_data, headers=auth_headers)
        
        assert response.status_code == 403
        assert "Apenas administradores" in response.json()["detail"]

    def test_admin_can_list_all_empresas(self, client: TestClient, admin_headers, complete_setup):
        """Testar que admin pode listar todas as empresas"""
        response = client.get("/api/v1/empresas/", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Admin deve ver todas as empresas
        assert len(data) >= 1

    def test_user_lists_only_accessible_empresas(self, client: TestClient, complete_setup):
        """Testar que usuário comum só vê empresas que tem acesso"""
        user_headers = complete_setup["user"]["headers"]
        
        response = client.get("/api/v1/empresas/", headers=user_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Usuário deve ver apenas a empresa que tem acesso
        assert len(data) == 1
        assert data[0]["id"] == complete_setup["empresa"]["id"]

    def test_user_can_access_own_empresa(self, client: TestClient, complete_setup):
        """Testar que usuário pode acessar empresa que pertence"""
        user_headers = complete_setup["user"]["headers"]
        empresa_id = complete_setup["empresa"]["id"]
        
        response = client.get(f"/api/v1/empresas/{empresa_id}", headers=user_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == empresa_id

    def test_user_cannot_access_other_empresa(self, client: TestClient, complete_setup, sample_empresa_data_2):
        """Testar que usuário não pode acessar empresa que não pertence"""
        admin_headers = complete_setup["admin"]["headers"]
        user_headers = complete_setup["user"]["headers"]
        
        # Criar segunda empresa
        empresa2_response = client.post("/api/v1/empresas/", json=sample_empresa_data_2, headers=admin_headers)
        empresa2_id = empresa2_response.json()["id"]
        
        # Usuário comum tentar acessar empresa que não pertence
        response = client.get(f"/api/v1/empresas/{empresa2_id}", headers=user_headers)
        
        assert response.status_code == 403
        assert "não tem permissão para acessar dados desta empresa" in response.json()["detail"]

    def test_user_can_update_empresa_as_admin(self, client: TestClient, complete_setup):
        """Testar que usuário admin de empresa pode atualizar dados"""
        admin_headers = complete_setup["admin"]["headers"]
        user_data = complete_setup["user"]["data"]
        empresa_id = complete_setup["empresa"]["id"]
        
        # Primeiro remover a associação existente
        client.delete(f"/api/v1/admin/users/{user_data['id']}/empresas/{empresa_id}", headers=admin_headers)
        
        # Agora criar associação como admin da empresa
        assoc_response = client.post(f"/api/v1/admin/users/{user_data['id']}/empresas", json={
            "user_id": user_data["id"],
            "empresa_id": empresa_id,
            "is_admin_empresa": True
        }, headers=admin_headers)
        
        # Verificar se associação foi criada com sucesso
        assert assoc_response.status_code == 200
        
        # Tentar atualizar empresa
        user_headers = complete_setup["user"]["headers"]
        update_data = {"nome": "Nome Atualizado"}
        
        response = client.put(f"/api/v1/empresas/{empresa_id}", json=update_data, headers=user_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["nome"] == "Nome Atualizado"

    def test_user_cannot_update_empresa_without_admin(self, client: TestClient, complete_setup):
        """Testar que usuário comum não pode atualizar empresa sem ser admin"""
        user_headers = complete_setup["user"]["headers"]
        empresa_id = complete_setup["empresa"]["id"]
        
        update_data = {"nome": "Tentativa de Atualização"}
        
        response = client.put(f"/api/v1/empresas/{empresa_id}", json=update_data, headers=user_headers)
        
        assert response.status_code == 403
        assert "não tem permissão para gerenciar esta empresa" in response.json()["detail"]

    def test_admin_can_delete_empresa(self, client: TestClient, admin_headers, sample_empresa_data):
        """Testar que admin geral pode desativar empresas"""
        # Criar empresa
        empresa_response = client.post("/api/v1/empresas/", json=sample_empresa_data, headers=admin_headers)
        empresa_id = empresa_response.json()["id"]
        
        # Desativar empresa
        response = client.delete(f"/api/v1/empresas/{empresa_id}", headers=admin_headers)
        
        assert response.status_code == 200
        assert "desativada com sucesso" in response.json()["message"]

    def test_user_cannot_delete_empresa(self, client: TestClient, complete_setup):
        """Testar que usuário comum não pode desativar empresas"""
        empresa_id = complete_setup["empresa"]["id"]
        user_headers = complete_setup["user"]["headers"]
        
        response = client.delete(f"/api/v1/empresas/{empresa_id}", headers=user_headers)
        
        assert response.status_code == 403
        assert "Apenas administradores" in response.json()["detail"]

    def test_user_lists_own_empresas(self, client: TestClient, complete_setup):
        """Testar endpoint para listar empresas do usuário atual"""
        user_headers = complete_setup["user"]["headers"]
        
        response = client.get("/api/v1/empresas/me/list", headers=user_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["id"] == complete_setup["empresa"]["id"]

    def test_admin_association_to_empresa(self, client: TestClient, complete_setup, sample_user_data_2):
        """Testar associação de usuário a empresa via admin"""
        admin_headers = complete_setup["admin"]["headers"]
        empresa_id = complete_setup["empresa"]["id"]
        
        # Criar segundo usuário
        user2_response = client.post("/api/v1/auth/register", json=sample_user_data_2)
        user2_id = user2_response.json()["id"]
        
        # Associar usuário à empresa
        response = client.post(f"/api/v1/admin/users/{user2_id}/empresas", json={
            "user_id": user2_id,
            "empresa_id": empresa_id,
            "is_admin_empresa": False
        }, headers=admin_headers)
        
        assert response.status_code == 200
        assert "adicionado à empresa com sucesso" in response.json()["message"]
        
        # Verificar se usuário agora tem acesso
        login_response = client.post("/api/v1/auth/login", json={
            "email": sample_user_data_2["email"],
            "password": sample_user_data_2["password"]
        })
        user2_token = login_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}
        
        empresa_response = client.get(f"/api/v1/empresas/{empresa_id}", headers=user2_headers)
        assert empresa_response.status_code == 200

    def test_admin_removal_from_empresa(self, client: TestClient, complete_setup):
        """Testar remoção de usuário de empresa via admin"""
        admin_headers = complete_setup["admin"]["headers"]
        user_data = complete_setup["user"]["data"]
        empresa_id = complete_setup["empresa"]["id"]
        user_headers = complete_setup["user"]["headers"]
        
        # Remover usuário da empresa
        response = client.delete(f"/api/v1/admin/users/{user_data['id']}/empresas/{empresa_id}", headers=admin_headers)
        
        assert response.status_code == 200
        assert "removido da empresa com sucesso" in response.json()["message"]
        
        # Verificar se usuário perdeu acesso
        empresa_response = client.get(f"/api/v1/empresas/{empresa_id}", headers=user_headers)
        assert empresa_response.status_code == 403