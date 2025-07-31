"""
Testes de integração completos para o sistema
"""
import pytest
from fastapi.testclient import TestClient


class TestCompleteIntegration:
    """Testes de integração do sistema completo"""

    def test_complete_user_journey(self, client: TestClient, sample_user_data, sample_empresa_data, sample_modulo_data):
        """Testar jornada completa: registro -> admin setup -> uso do sistema"""
        
        # 1. Criar admin
        admin_data = {
            "email": "admin@integration.test",
            "full_name": "Admin Integração",
            "password": "admin123456",
            "role": "admin"
        }
        
        admin_response = client.post("/api/v1/auth/register", json=admin_data)
        assert admin_response.status_code == 201
        
        # 2. Admin faz login
        admin_login = client.post("/api/v1/auth/login", json={
            "email": admin_data["email"],
            "password": admin_data["password"]
        })
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # 3. Admin cria empresa
        empresa_response = client.post("/api/v1/empresas/", json=sample_empresa_data, headers=admin_headers)
        assert empresa_response.status_code == 201
        empresa_id = empresa_response.json()["id"]
        
        # 4. Admin cria módulo
        modulo_response = client.post("/api/v1/modulos/", json=sample_modulo_data, headers=admin_headers)
        assert modulo_response.status_code == 201
        modulo_id = modulo_response.json()["id"]
        
        # 5. Usuário comum se registra
        user_response = client.post("/api/v1/auth/register", json=sample_user_data)
        assert user_response.status_code == 201
        user_id = user_response.json()["id"]
        
        # 6. Usuário faz login
        user_login = client.post("/api/v1/auth/login", json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        })
        user_token = user_login.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        
        # 7. Admin associa usuário à empresa
        assoc_response = client.post(f"/api/v1/admin/users/{user_id}/empresas", json={
            "user_id": user_id,
            "empresa_id": empresa_id,
            "is_admin_empresa": False
        }, headers=admin_headers)
        assert assoc_response.status_code == 200
        
        # 8. Admin associa usuário ao módulo
        mod_assoc_response = client.post(f"/api/v1/admin/users/{user_id}/modulos", json={
            "user_id": user_id,
            "modulo_id": modulo_id
        }, headers=admin_headers)
        assert mod_assoc_response.status_code == 200
        
        # 9. Usuário verifica suas permissões
        perms_response = client.get("/api/v1/auth/me/permissions", headers=user_headers)
        assert perms_response.status_code == 200
        permissions = perms_response.json()
        
        assert empresa_id in permissions["empresas_ids"]
        assert sample_modulo_data["slug"] in permissions["modulos_slugs"]
        
        # 10. Usuário acessa empresa
        empresa_access = client.get(f"/api/v1/empresas/{empresa_id}", headers=user_headers)
        assert empresa_access.status_code == 200
        
        # 11. Usuário acessa módulo
        modulo_access = client.get(f"/api/v1/modulos/slug/{sample_modulo_data['slug']}", headers=user_headers)
        assert modulo_access.status_code == 200
        
        # 12. Usuário lista suas empresas
        my_empresas = client.get("/api/v1/empresas/me/list", headers=user_headers)
        assert my_empresas.status_code == 200
        assert len(my_empresas.json()) == 1
        
        # 13. Usuário lista seus módulos
        my_modulos = client.get("/api/v1/modulos/me", headers=user_headers)
        assert my_modulos.status_code == 200
        assert len(my_modulos.json()) >= 1

    def test_multi_company_scenario(self, client: TestClient, complete_setup, sample_empresa_data_2, sample_user_data_2):
        """Testar cenário com múltiplas empresas e usuários"""
        admin_headers = complete_setup["admin"]["headers"]
        
        # Criar segunda empresa
        empresa2_response = client.post("/api/v1/empresas/", json=sample_empresa_data_2, headers=admin_headers)
        empresa2_id = empresa2_response.json()["id"]
        
        # Criar segundo usuário
        user2_response = client.post("/api/v1/auth/register", json=sample_user_data_2)
        user2_id = user2_response.json()["id"]
        
        # Associar usuário 2 apenas à empresa 2
        client.post(f"/api/v1/admin/users/{user2_id}/empresas", json={
            "user_id": user2_id,
            "empresa_id": empresa2_id,
            "is_admin_empresa": False
        }, headers=admin_headers)
        
        # Login usuário 2
        user2_login = client.post("/api/v1/auth/login", json={
            "email": sample_user_data_2["email"],
            "password": sample_user_data_2["password"]
        })
        user2_headers = {"Authorization": f"Bearer {user2_login.json()['access_token']}"}
        
        # Verificar isolamento de dados
        user1_headers = complete_setup["user"]["headers"]
        empresa1_id = complete_setup["empresa"]["id"]
        
        # Usuário 1 não deve acessar empresa 2
        user1_empresa2 = client.get(f"/api/v1/empresas/{empresa2_id}", headers=user1_headers)
        assert user1_empresa2.status_code == 403
        
        # Usuário 2 não deve acessar empresa 1
        user2_empresa1 = client.get(f"/api/v1/empresas/{empresa1_id}", headers=user2_headers)
        assert user2_empresa1.status_code == 403
        
        # Admin deve acessar ambas
        admin_empresa1 = client.get(f"/api/v1/empresas/{empresa1_id}", headers=admin_headers)
        admin_empresa2 = client.get(f"/api/v1/empresas/{empresa2_id}", headers=admin_headers)
        assert admin_empresa1.status_code == 200
        assert admin_empresa2.status_code == 200

    def test_role_promotion_workflow(self, client: TestClient, complete_setup):
        """Testar fluxo completo de promoção de usuário"""
        admin_headers = complete_setup["admin"]["headers"]
        user_data = complete_setup["user"]["data"]
        user_headers = complete_setup["user"]["headers"]
        user_id = user_data["id"]
        
        # 1. Verificar estado inicial (usuário comum)
        initial_perms = client.get("/api/v1/auth/me/permissions", headers=user_headers)
        assert initial_perms.json()["is_admin"] is False
        
        # Usuário não pode acessar endpoints admin
        admin_access = client.get("/api/v1/admin/users", headers=user_headers)
        assert admin_access.status_code == 403
        
        # 2. Admin promove usuário
        promote_response = client.post(f"/api/v1/admin/users/{user_id}/promote", headers=admin_headers)
        assert promote_response.status_code == 200
        
        # 3. Verificar novas permissões
        new_perms = client.get("/api/v1/auth/me/permissions", headers=user_headers)
        assert new_perms.json()["is_admin"] is True
        
        # Usuário agora pode acessar endpoints admin
        admin_access_new = client.get("/api/v1/admin/users", headers=user_headers)
        assert admin_access_new.status_code == 200
        
        # 4. Admin rebaixa usuário
        demote_response = client.post(f"/api/v1/admin/users/{user_id}/demote", headers=admin_headers)
        assert demote_response.status_code == 200
        
        # 5. Verificar perda de permissões
        final_perms = client.get("/api/v1/auth/me/permissions", headers=user_headers)
        assert final_perms.json()["is_admin"] is False
        
        # Usuário não pode mais acessar endpoints admin
        admin_access_final = client.get("/api/v1/admin/users", headers=user_headers)
        assert admin_access_final.status_code == 403

    def test_system_health_and_stats(self, client: TestClient, complete_setup):
        """Testar saúde do sistema e estatísticas"""
        admin_headers = complete_setup["admin"]["headers"]
        
        # 1. Verificar saúde da API
        health_response = client.get("/health")
        assert health_response.status_code == 200
        assert health_response.json()["status"] == "healthy"
        
        # 2. Verificar status geral
        root_response = client.get("/")
        assert root_response.status_code == 200
        assert root_response.json()["status"] == "online"
        
        # 3. Verificar estatísticas do sistema
        stats_response = client.get("/api/v1/admin/stats", headers=admin_headers)
        assert stats_response.status_code == 200
        
        stats = stats_response.json()
        assert "usuarios" in stats
        assert "empresas" in stats
        assert "modulos" in stats
        
        # Verificar que tem pelo menos os dados do setup
        assert stats["usuarios"]["total"] >= 2  # Admin + usuário comum
        assert stats["empresas"]["total"] >= 1
        assert stats["modulos"]["total"] >= 1

    def test_error_handling_and_edge_cases(self, client: TestClient, admin_headers):
        """Testar tratamento de erros e casos extremos"""
        
        # 1. Acessar recursos inexistentes
        not_found_cases = [
            "/api/v1/empresas/99999",
            "/api/v1/modulos/99999",
            "/api/v1/admin/users/99999"
        ]
        
        for endpoint in not_found_cases:
            response = client.get(endpoint, headers=admin_headers)
            assert response.status_code == 404
        
        # 2. Dados inválidos
        invalid_empresa = {
            "nome": "",  # Nome vazio
            "cnpj": "cnpj_invalido"
        }
        
        response = client.post("/api/v1/empresas/", json=invalid_empresa, headers=admin_headers)
        assert response.status_code == 422  # Validation error
        
        # 3. Associações duplicadas
        empresa_response = client.post("/api/v1/empresas/", json={
            "nome": "Empresa Teste Edge Case",
            "cnpj": "11.111.111/0001-11"
        }, headers=admin_headers)
        empresa_id = empresa_response.json()["id"]
        
        user_response = client.post("/api/v1/auth/register", json={
            "email": "edge@test.com",
            "full_name": "Edge Test User",
            "password": "test123456",
            "role": "comum"
        })
        user_id = user_response.json()["id"]
        
        # Primeira associação
        assoc1 = client.post(f"/api/v1/admin/users/{user_id}/empresas", json={
            "user_id": user_id,
            "empresa_id": empresa_id,
            "is_admin_empresa": False
        }, headers=admin_headers)
        assert assoc1.status_code == 200
        
        # Segunda associação (duplicada)
        assoc2 = client.post(f"/api/v1/admin/users/{user_id}/empresas", json={
            "user_id": user_id,
            "empresa_id": empresa_id,
            "is_admin_empresa": False
        }, headers=admin_headers)
        assert assoc2.status_code == 400  # Deve falhar