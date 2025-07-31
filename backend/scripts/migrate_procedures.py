#!/usr/bin/env python3
"""
Script para migrar dados do procedures.json para o banco de dados
"""
import sys
import json
from pathlib import Path
from decimal import Decimal

# Adicionar o diretório do projeto ao path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.empresa import Empresa
from app.models.procedimento import Procedimento, ProcedimentoCategoria
from app.models.insumo import Insumo, InsumoTipo, InsumoUnidade
from app.models.associations import ProcedimentoInsumo


def load_procedures_json():
    """Carregar dados do arquivo JSON do frontend"""
    json_path = project_root.parent / "src" / "data" / "procedures.json"
    
    if not json_path.exists():
        print(f"❌ Arquivo não encontrado: {json_path}")
        return None
    
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_or_create_insumo(db: Session, nome: str, valor: float) -> Insumo:
    """Buscar ou criar insumo"""
    # Buscar insumo existente
    insumo = db.query(Insumo).filter(Insumo.nome == nome).first()
    
    if insumo:
        return insumo
    
    # Determinar tipo do insumo baseado no nome
    nome_lower = nome.lower()
    if any(word in nome_lower for word in ['toxina', 'botox', 'ácido', 'hialurônico']):
        tipo = InsumoTipo.MEDICAMENTO
    elif any(word in nome_lower for word in ['gel', 'álcool', 'clorexidina', 'soro']):
        tipo = InsumoTipo.CONSUMIVEL
    elif any(word in nome_lower for word in ['seringa', 'agulha', 'espátula', 'lápis']):
        tipo = InsumoTipo.MATERIAL
    else:
        tipo = InsumoTipo.CONSUMIVEL
    
    # Criar novo insumo
    insumo = Insumo(
        nome=nome,
        tipo=tipo,
        unidade=InsumoUnidade.UNIDADE,
        preco_referencia=Decimal(str(valor)),
        descricao=f"Insumo importado do sistema anterior: {nome}"
    )
    
    db.add(insumo)
    db.commit()
    db.refresh(insumo)
    
    print(f"  📦 Insumo criado: {nome} - R$ {valor}")
    return insumo


def migrate_procedures(db: Session):
    """Migrar procedimentos do JSON para o banco"""
    print("🔄 Iniciando migração de procedimentos...")
    
    # Carregar dados do JSON
    procedures_data = load_procedures_json()
    if not procedures_data:
        return False
    
    print(f"📋 Encontrados {len(procedures_data)} procedimentos no JSON")
    
    # Buscar empresas existentes
    empresas = db.query(Empresa).filter(Empresa.is_active == True).all()
    if not empresas:
        print("❌ Nenhuma empresa encontrada no banco. Execute o setup inicial primeiro.")
        return False
    
    print(f"🏢 Empresas disponíveis:")
    for i, empresa in enumerate(empresas):
        print(f"  {i+1}. {empresa.nome}")
    
    # Mapear tipos do JSON para enum
    tipo_mapping = {
        "Entrada": "ESTETICO",
        "Recorrência": "ESTETICO", 
        "Alto Ticket": "DERMATOLOGICO"
    }
    
    categoria_mapping = {
        "comercial": ProcedimentoCategoria.COMERCIAL,
        "financeiro": ProcedimentoCategoria.FINANCEIRO
    }
    
    created_count = 0
    
    for proc_data in procedures_data:
        print(f"\n📋 Processando: {proc_data['nome']}")
        
        # Verificar se procedimento já existe
        existing = db.query(Procedimento).filter(Procedimento.nome == proc_data['nome']).first()
        if existing:
            print(f"  ⏭️  Procedimento já existe, pulando...")
            continue
        
        # Distribuir procedimentos entre empresas (round-robin)
        empresa_idx = (proc_data['id'] - 1) % len(empresas)
        empresa = empresas[empresa_idx]
        
        # Criar procedimento
        procedimento = Procedimento(
            nome=proc_data['nome'],
            descricao=proc_data['descricao'],
            categoria=categoria_mapping[proc_data['categoria']],
            tipo=proc_data.get('tipo', ''),
            preco_base=Decimal(str(proc_data['precoSugerido'])) if proc_data['precoSugerido'] > 0 else None,
            tempo_estimado=proc_data['tempoSessaoMin'],
            imagem_url=proc_data.get('imagem', ''),
            observacoes=f"Sessões: {proc_data['numeroSessoes']}, Custo Profissional: R$ {proc_data['custoProfissionalPorSessao']}",
            empresa_id=empresa.id
        )
        
        db.add(procedimento)
        db.commit()
        db.refresh(procedimento)
        
        print(f"  ✅ Procedimento criado na empresa '{empresa.nome}'")
        
        # Processar insumos
        for insumo_data in proc_data['insumos']:
            # Criar ou buscar insumo
            insumo = get_or_create_insumo(db, insumo_data['nome'], insumo_data['valor'])
            
            # Criar relacionamento procedimento-insumo
            proc_insumo = ProcedimentoInsumo(
                procedimento_id=procedimento.id,
                insumo_id=insumo.id,
                quantidade=Decimal('1.0'),
                custo_unitario=Decimal(str(insumo_data['valor'])),
                observacoes=f"Importado do JSON - valor original: R$ {insumo_data['valor']}"
            )
            
            db.add(proc_insumo)
        
        db.commit()
        created_count += 1
        print(f"  📦 {len(proc_data['insumos'])} insumos associados")
    
    print(f"\n🎉 Migração concluída!")
    print(f"   📋 {created_count} procedimentos criados")
    
    return True


def main():
    """Executar migração"""
    print("🚀 Migração de Procedimentos - CareFlow")
    print("=" * 50)
    
    db = SessionLocal()
    
    try:
        success = migrate_procedures(db)
        
        if success:
            print("\n✅ Migração realizada com sucesso!")
            print("\n📊 Resumo:")
            
            # Estatísticas
            total_procedimentos = db.query(Procedimento).count()
            total_insumos = db.query(Insumo).count()
            total_associacoes = db.query(ProcedimentoInsumo).count()
            
            print(f"   📋 Total de procedimentos: {total_procedimentos}")
            print(f"   📦 Total de insumos: {total_insumos}")
            print(f"   🔗 Total de associações: {total_associacoes}")
            
            # Procedimentos por empresa
            print(f"\n🏢 Distribuição por empresa:")
            empresas = db.query(Empresa).all()
            for empresa in empresas:
                count = db.query(Procedimento).filter(Procedimento.empresa_id == empresa.id).count()
                print(f"   {empresa.nome}: {count} procedimentos")
                
        else:
            print("\n❌ Migração falhou")
            return False
            
    except Exception as e:
        print(f"❌ Erro durante migração: {e}")
        db.rollback()
        return False
    finally:
        db.close()
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)