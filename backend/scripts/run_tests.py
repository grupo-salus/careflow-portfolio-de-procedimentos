#!/usr/bin/env python3
"""
Script para executar os testes da API
"""
import sys
import subprocess
from pathlib import Path


def run_tests():
    """Executar todos os testes"""
    print("🧪 Executando testes da CareFlow Auth API...")
    print("=" * 50)
    
    # Comando pytest com opções úteis
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/",
        "-c", "config/pytest.ini",  # Especificar arquivo de configuração
        "-v",                    # Verbose
        "--tb=short",           # Traceback curto
        "--strict-markers",     # Validar markers
        "--color=yes",          # Colorir output
        "-x",                   # Parar no primeiro erro (opcional)
    ]
    
    try:
        result = subprocess.run(cmd, check=False)
        
        if result.returncode == 0:
            print("\n✅ Todos os testes passaram!")
            return True
        else:
            print(f"\n❌ Alguns testes falharam (código: {result.returncode})")
            return False
            
    except Exception as e:
        print(f"\n💥 Erro ao executar testes: {e}")
        return False


def run_tests_with_coverage():
    """Executar testes com relatório de cobertura"""
    print("🧪 Executando testes com cobertura...")
    print("=" * 50)
    
    # Instalar pytest-cov se necessário
    try:
        import pytest_cov
    except ImportError:
        print("📦 Instalando pytest-cov...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pytest-cov"], check=True)
    
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/",
        "--cov=app",            # Cobertura da pasta app
        "--cov-report=html",    # Relatório HTML
        "--cov-report=term",    # Relatório no terminal
        "--cov-fail-under=80",  # Falhar se cobertura < 80%
        "-v"
    ]
    
    try:
        result = subprocess.run(cmd, check=False)
        
        if result.returncode == 0:
            print("\n✅ Todos os testes passaram com boa cobertura!")
            print("📊 Relatório de cobertura gerado em: htmlcov/index.html")
            return True
        else:
            print(f"\n❌ Testes ou cobertura falharam (código: {result.returncode})")
            return False
            
    except Exception as e:
        print(f"\n💥 Erro ao executar testes: {e}")
        return False


def run_specific_test(test_path: str):
    """Executar teste específico"""
    print(f"🧪 Executando teste: {test_path}")
    print("=" * 50)
    
    cmd = [
        sys.executable, "-m", "pytest",
        test_path,
        "-v",
        "--tb=short"
    ]
    
    try:
        result = subprocess.run(cmd, check=False)
        return result.returncode == 0
    except Exception as e:
        print(f"\n💥 Erro ao executar teste: {e}")
        return False


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Executar testes da CareFlow Auth API")
    parser.add_argument(
        "--coverage", "-c",
        action="store_true",
        help="Executar testes com relatório de cobertura"
    )
    parser.add_argument(
        "--test", "-t",
        type=str,
        help="Executar teste específico (ex: tests/test_auth.py::TestAuthEndpoints::test_login_success)"
    )
    
    args = parser.parse_args()
    
    success = False
    
    if args.test:
        success = run_specific_test(args.test)
    elif args.coverage:
        success = run_tests_with_coverage()
    else:
        success = run_tests()
    
    sys.exit(0 if success else 1)