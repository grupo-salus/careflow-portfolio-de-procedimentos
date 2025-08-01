#!/usr/bin/env python3
"""
Script completo para recriar o banco de dados do CareFlow
Este script:
1. Recria todas as tabelas (APAGA TODOS OS DADOS!)
2. Cria o usuário administrador
3. Cria os módulos padrão do sistema
4. Cria as 2 empresas de exemplo
5. Migra os procedimentos do JSON
"""
import os
import sys
import secrets
import string
from pathlib import Path

# Adicionar o diretório do projeto ao path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import Base, User, UserRole
from app.models.empresa import Empresa
from app.models.modulo import Modulo
from app.models.procedimento import Procedimento
from app.models.insumo import Insumo
from app.models.associations import ProcedimentoInsumo
from app.services.user_service import UserService
from app.services.empresa_service import EmpresaService
from app.services.modulo_service import ModuloService
from app.schemas.user import UserCreate
from app.schemas.empresa import EmpresaCreate
from app.schemas.modulo import ModuloCreate


def generate_secure_password(length: int = 12) -> str:
    """Gerar senha segura com requisitos mínimos"""
    # Caracteres que atendem aos requisitos
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    symbols = "!@#$%^&*"
    
    # Garantir pelo menos um de cada tipo
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
        secrets.choice(symbols)
    ]
    
    # Completar com caracteres aleatórios
    all_chars = lowercase + uppercase + digits + symbols
    password.extend(secrets.choice(all_chars) for _ in range(length - 4))
    
    # Embaralhar a senha
    password_list = list(password)
    secrets.SystemRandom().shuffle(password_list)
    
    return ''.join(password_list)


def associate_admin_to_all_entities(db: Session, admin_user: User):
    """Associar admin a todas as empresas e módulos"""
    print("🔗 Associando admin a todas as entidades...")
    
    # Associar a todas as empresas
    from app.models.empresa import Empresa
    from app.models.associations import user_empresa
    
    empresas = db.query(Empresa).all()
    for empresa in empresas:
        db.execute(
            user_empresa.insert().values(
                user_id=admin_user.id,
                empresa_id=empresa.id
            )
        )
    
    # Associar a todos os módulos
    from app.models.modulo import Modulo
    from app.models.associations import user_modulo
    
    modulos = db.query(Modulo).all()
    for modulo in modulos:
        db.execute(
            user_modulo.insert().values(
                user_id=admin_user.id,
                modulo_id=modulo.id
            )
        )
    
    db.commit()
    print(f"  ✅ Admin associado a {len(empresas)} empresas e {len(modulos)} módulos")


def recreate_database():
    """Recriar banco de dados"""
    print("🗄️  Recriando banco de dados...")
    
    from app.core.database import engine, Base
    from app.models.user import User
    from app.models.empresa import Empresa
    from app.models.modulo import Modulo
    from app.models.procedimento import Procedimento
    from app.models.insumo import Insumo
    
    # Drop e recriar todas as tabelas
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    print("  ✅ Banco de dados recriado")


def create_admin_user(db: Session):
    """Criar usuário administrador com senha segura"""
    print("👤 Criando usuário administrador...")
    
    user_service = UserService(db)
    
    # Gerar senha segura
    admin_password = generate_secure_password()
    
    admin_data = UserCreate(
        email="admin@careflow.com",
        full_name="Administrador do Sistema",
        password=admin_password,
        role=UserRole.ADMIN
    )
    
    admin_user = user_service.create_user(admin_data, setup_default_permissions=True)
    
    if admin_user:
        print(f"  ✅ Admin criado: {admin_user.email}")
        print("  🔑 CREDENCIAIS DE ACESSO:")
        print(f"     Email: admin@careflow.com")
        print(f"     Senha: {admin_password}")
        print("  ⚠️  IMPORTANTE: Guarde essas credenciais!")
        print("  ⚠️  IMPORTANTE: Altere a senha após o primeiro login!")
    else:
        print("❌ Erro ao criar admin")
        return None
    
    return admin_user, admin_password


def create_initial_modules(db: Session):
    """Criar módulos iniciais do sistema"""
    print("📋 Criando módulos iniciais...")
    
    modulo_service = ModuloService(db)
    
    modulos_iniciais = [
        {
            "nome": "Portfólio",
            "slug": "portfolio",
            "descricao": "Visualizar portfólio de procedimentos",
            "icone": "folder",
            "ordem": 1,
            "is_admin_only": False
        },
        {
            "nome": "Calculadora",
            "slug": "calculadora", 
            "descricao": "Calcular custos e margens de procedimentos",
            "icone": "calculator",
            "ordem": 2,
            "is_admin_only": False
        },
        {
            "nome": "Gerenciar Usuários",
            "slug": "admin_usuarios",
            "descricao": "Administrar usuários e permissões",
            "icone": "users",
            "ordem": 10,
            "is_admin_only": True
        },
        {
            "nome": "Gerenciar Empresas",
            "slug": "admin_empresas",
            "descricao": "Administrar empresas do sistema",
            "icone": "building",
            "ordem": 11,
            "is_admin_only": True
        },
        {
            "nome": "Configurações",
            "slug": "configuracoes",
            "descricao": "Configurações gerais do sistema",
            "icone": "settings",
            "ordem": 20,
            "is_admin_only": True
        }
    ]
    
    created_count = 0
    for modulo_data in modulos_iniciais:
        modulo_create = ModuloCreate(**modulo_data)
        modulo = modulo_service.create_modulo(modulo_create)
        if modulo:
            print(f"  ✅ Módulo '{modulo.nome}' criado")
            created_count += 1
        else:
            print(f"  ❌ Erro ao criar módulo '{modulo_data['nome']}'")
    
    print(f"📋 {created_count} módulos criados")


def create_sample_empresas(db: Session):
    """Criar as 2 empresas padrão"""
    print("🏢 Criando empresas padrão...")
    
    empresa_service = EmpresaService(db)
    
    empresas_padrao = [
        {
            "nome": "Gio Estética Avançada",
            "razao_social": "Gio Estética Avançada LTDA",
            "cnpj": "12.345.678/0001-90",
            "email": "contato@gioestetica.com.br",
            "telefone": "(11) 99999-9999",
            "endereco": "Rua das Flores, 123 - São Paulo/SP"
        },
        {
            "nome": "Sorridents",
            "razao_social": "Sorridents Odontologia LTDA",
            "cnpj": "98.765.432/0001-10",
            "email": "contato@sorridents.com.br",
            "telefone": "(11) 88888-8888",
            "endereco": "Avenida Paulista, 456 - São Paulo/SP"
        }
    ]
    
    created_count = 0
    for empresa_data in empresas_padrao:
        empresa_create = EmpresaCreate(**empresa_data)
        empresa = empresa_service.create_empresa(empresa_create)
        if empresa:
            print(f"  ✅ Empresa '{empresa.nome}' criada")
            created_count += 1
        else:
            print(f"  ❌ Erro ao criar empresa '{empresa_data['nome']}'")
    
    print(f"🏢 {created_count} empresas criadas")


def migrate_procedures_from_json(db: Session):
    """Migrar procedimentos do JSON existente"""
    print("🔄 Migrando procedimentos do JSON...")
    
    # Importar e executar a migração
    try:
        from migrate_procedures import migrate_procedures
        success = migrate_procedures(db)
        
        if success:
            # Estatísticas
            total_procedimentos = db.query(Procedimento).count()
            total_insumos = db.query(Insumo).count()
            total_associacoes = db.query(ProcedimentoInsumo).count()
            
            print(f"✅ Migração concluída!")
            print(f"   📋 {total_procedimentos} procedimentos")
            print(f"   📦 {total_insumos} insumos")
            print(f"   🔗 {total_associacoes} associações")
        else:
            print("❌ Falha na migração de procedimentos")
            
    except Exception as e:
        print(f"❌ Erro na migração: {e}")
        print("⚠️  Continuando sem migração de procedimentos...")


def main():
    """Executar setup completo do banco de dados"""
    print("🚀 SETUP COMPLETO DO BANCO DE DADOS - CareFlow")
    print("=" * 60)
    print("⚠️  ATENÇÃO: Este script VAI APAGAR TODOS OS DADOS EXISTENTES!")
    print("=" * 60)
    
    # Confirmação
    response = input("\n❓ Deseja continuar? (digite 'SIM' para confirmar): ")
    if response.upper() != 'SIM':
        print("❌ Operação cancelada.")
        return False
    
    print("\n🔄 Iniciando setup completo...\n")
    
    try:
        # 1. Recriar banco
        recreate_database()
        print()
        
        # 2. Criar sessão
        db = SessionLocal()
        
        try:
            # 3. Criar usuário admin
            admin_user, admin_password = create_admin_user(db)
            if not admin_user:
                print("❌ Falha crítica: não foi possível criar usuário admin")
                return False
            print()
            
            # 4. Criar módulos
            create_initial_modules(db)
            print()
            
            # 5. Criar empresas
            create_sample_empresas(db)
            print()
            
            # 6. Migrar procedimentos
            migrate_procedures_from_json(db)
            print()
            
            # 7. Associar admin a todas as empresas e módulos
            print("🔗 Associando admin a todas as empresas e módulos...")
            associate_admin_to_all_entities(db, admin_user)
            print("✅ Admin associado a todas as empresas e módulos")
            print()
            
            print("🎉 SETUP COMPLETO CONCLUÍDO COM SUCESSO!")
            print("=" * 60)
            print("📋 Resumo do que foi criado:")
            print("   ✅ Banco de dados recriado")
            print("   ✅ Usuário administrador criado")
            print("   ✅ Módulos do sistema criados")
            print("   ✅ Empresas padrão criadas")
            print("   ✅ Procedimentos migrados do JSON")
            
            print("\n🔑 Credenciais de acesso:")
            print("   Email: admin@careflow.com")
            print("   Senha: (senha gerada automaticamente)")
            
            print("\n⚠️  PRÓXIMOS PASSOS:")
            print("   1. Altere a senha do administrador")
            print("   2. Configure as empresas conforme necessário")
            print("   3. Para popular com nova planilha, use o script de migração específico")
            
            return True
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Erro crítico durante setup: {e}")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)