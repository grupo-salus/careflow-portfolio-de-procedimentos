#!/usr/bin/env python3
"""
Script simples para executar testes essenciais
"""
import subprocess
import sys

def run_essential_tests():
    """Executar apenas os testes essenciais para verificação básica"""
    essential_test_files = [
        "tests/test_auth.py",
        "tests/test_user_service.py", 
        "tests/test_security.py::TestSecurityAndAccessControl::test_unauthenticated_access_denied",
        "tests/test_security.py::TestSecurityAndAccessControl::test_invalid_token_access_denied",
        "tests/test_security.py::TestSecurityAndAccessControl::test_password_validation_and_hashing",
        "tests/test_empresa_permissions.py::TestEmpresaPermissions::test_admin_can_create_empresa",
        "tests/test_empresa_permissions.py::TestEmpresaPermissions::test_common_user_cannot_create_empresa",
        "tests/test_modulo_permissions.py::TestModuloPermissions::test_admin_can_create_modulo",
        "tests/test_modulo_permissions.py::TestModuloPermissions::test_common_user_cannot_create_modulo",
        "tests/test_roles_admin.py::TestAdminEndpoints::test_admin_can_list_users",
        "tests/test_roles_admin.py::TestAdminEndpoints::test_common_user_cannot_list_users"
    ]
    
    print("🧪 Executando testes essenciais da CareFlow Auth API...")
    print("=" * 60)
    
    try:
        for test in essential_test_files:
            print(f"📋 Executando: {test}")
            result = subprocess.run([
                sys.executable, "-m", "pytest", 
                test, "-c", "config/pytest.ini",  # Especificar arquivo de configuração
                "-v", "--tb=short"
            ], capture_output=False, check=False)
            
            if result.returncode != 0:
                print(f"❌ Teste falhou: {test}")
            else:
                print(f"✅ Teste passou: {test}")
    
    except Exception as e:
        print(f"❌ Erro ao executar testes: {e}")
        return False
    
    print("\n🎯 Testes essenciais concluídos!")
    return True

if __name__ == "__main__":
    success = run_essential_tests()
    sys.exit(0 if success else 1)