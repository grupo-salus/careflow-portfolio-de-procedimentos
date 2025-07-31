#!/usr/bin/env python3
"""
Script para migrar procedimentos a partir de planilha Excel/CSV
Este script permite importar procedimentos de uma planilha com as colunas necessárias
"""
import sys
import pandas as pd
from pathlib import Path
from decimal import Decimal
import argparse

# Adicionar o diretório do projeto ao path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.empresa import Empresa
from app.models.procedimento import Procedimento, ProcedimentoCategoria
from app.models.insumo import Insumo, InsumoTipo, InsumoUnidade
from app.models.associations import ProcedimentoInsumo


def validate_excel_columns(df):
    """Validar se a planilha tem as colunas necessárias"""
    required_columns = [
        'nome',
        'descricao', 
        'categoria',
        'preco_base',
        'tempo_estimado',
        'empresa_nome'
    ]
    
    optional_columns = [
        'tipo',
        'imagem_url',
        'observacoes',
        'insumos'  # JSON string com lista de insumos
    ]
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        print(f"❌ Colunas obrigatórias ausentes: {missing_columns}")
        print(f"\n📋 Colunas obrigatórias:")
        for col in required_columns:
            print(f"   - {col}")
        print(f"\n📋 Colunas opcionais:")
        for col in optional_columns:
            print(f"   - {col}")
        return False
    
    print(f"✅ Planilha válida com {len(df)} linhas")
    print(f"📋 Colunas encontradas: {list(df.columns)}")
    return True


def get_or_create_empresa(db: Session, nome_empresa: str) -> Empresa:
    """Buscar ou criar empresa"""
    empresa = db.query(Empresa).filter(Empresa.nome == nome_empresa).first()
    
    if not empresa:
        print(f"⚠️  Empresa '{nome_empresa}' não encontrada. Criando nova empresa...")
        # Criar empresa básica
        empresa = Empresa(
            nome=nome_empresa,
            razao_social=f"{nome_empresa} LTDA",
            cnpj="00.000.000/0001-00",  # CNPJ placeholder
            email=f"contato@{nome_empresa.lower().replace(' ', '')}.com",
            telefone="(00) 00000-0000",
            endereco="Endereço a ser definido"
        )
        db.add(empresa)
        db.commit()
        db.refresh(empresa)
        print(f"  ✅ Empresa '{nome_empresa}' criada")
    
    return empresa


def get_or_create_insumo(db: Session, nome: str, valor: float, tipo_str: str = None) -> Insumo:
    """Buscar ou criar insumo"""
    insumo = db.query(Insumo).filter(Insumo.nome == nome).first()
    
    if insumo:
        return insumo
    
    # Determinar tipo do insumo
    if tipo_str:
        tipo_map = {
            'medicamento': InsumoTipo.MEDICAMENTO,
            'consumivel': InsumoTipo.CONSUMIVEL,
            'material': InsumoTipo.MATERIAL
        }
        tipo = tipo_map.get(tipo_str.lower(), InsumoTipo.CONSUMIVEL)
    else:
        # Auto-detectar tipo baseado no nome
        nome_lower = nome.lower()
        if any(word in nome_lower for word in ['toxina', 'botox', 'ácido', 'hialurônico']):
            tipo = InsumoTipo.MEDICAMENTO
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
        descricao=f"Insumo importado da planilha: {nome}"
    )
    
    db.add(insumo)
    db.commit()
    db.refresh(insumo)
    
    return insumo


def migrate_from_excel(db: Session, file_path: str, clear_existing: bool = False):
    """Migrar procedimentos da planilha"""
    print(f"📊 Carregando planilha: {file_path}")
    
    # Carregar planilha
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except Exception as e:
        print(f"❌ Erro ao carregar planilha: {e}")
        return False
    
    # Validar colunas
    if not validate_excel_columns(df):
        return False
    
    # Limpar procedimentos existentes se solicitado
    if clear_existing:
        print("🗑️  Removendo procedimentos existentes...")
        db.query(ProcedimentoInsumo).delete()
        db.query(Procedimento).delete()
        db.commit()
        print("✅ Procedimentos removidos")
    
    # Mapear categorias
    categoria_mapping = {
        'comercial': ProcedimentoCategoria.COMERCIAL,
        'financeiro': ProcedimentoCategoria.FINANCEIRO
    }
    
    created_count = 0
    error_count = 0
    
    for index, row in df.iterrows():
        try:
            print(f"\n📋 Processando linha {index + 1}: {row['nome']}")
            
            # Verificar se procedimento já existe
            existing = db.query(Procedimento).filter(Procedimento.nome == row['nome']).first()
            if existing and not clear_existing:
                print(f"  ⏭️  Procedimento já existe, pulando...")
                continue
            
            # Buscar/criar empresa
            empresa = get_or_create_empresa(db, row['empresa_nome'])
            
            # Mapear categoria
            categoria = categoria_mapping.get(row['categoria'].lower(), ProcedimentoCategoria.COMERCIAL)
            
            # Criar procedimento
            procedimento = Procedimento(
                nome=row['nome'],
                descricao=row['descricao'],
                categoria=categoria,
                tipo=row.get('tipo', ''),
                preco_base=Decimal(str(row['preco_base'])) if pd.notna(row['preco_base']) and row['preco_base'] > 0 else None,
                tempo_estimado=int(row['tempo_estimado']) if pd.notna(row['tempo_estimado']) else 60,
                imagem_url=row.get('imagem_url', ''),
                observacoes=row.get('observacoes', ''),
                empresa_id=empresa.id
            )
            
            db.add(procedimento)
            db.commit()
            db.refresh(procedimento)
            
            print(f"  ✅ Procedimento criado na empresa '{empresa.nome}'")
            
            # Processar insumos se existirem
            if 'insumos' in row and pd.notna(row['insumos']):
                try:
                    import json
                    insumos_data = json.loads(row['insumos'])
                    
                    for insumo_data in insumos_data:
                        insumo = get_or_create_insumo(
                            db, 
                            insumo_data['nome'], 
                            insumo_data['valor'],
                            insumo_data.get('tipo')
                        )
                        
                        # Criar relacionamento
                        proc_insumo = ProcedimentoInsumo(
                            procedimento_id=procedimento.id,
                            insumo_id=insumo.id,
                            quantidade=Decimal(str(insumo_data.get('quantidade', 1.0))),
                            custo_unitario=Decimal(str(insumo_data['valor'])),
                            observacoes=f"Importado da planilha"
                        )
                        
                        db.add(proc_insumo)
                    
                    db.commit()
                    print(f"  📦 {len(insumos_data)} insumos associados")
                    
                except json.JSONDecodeError:
                    print(f"  ⚠️  Erro ao processar insumos (JSON inválido)")
                except Exception as e:
                    print(f"  ⚠️  Erro ao processar insumos: {e}")
            
            created_count += 1
            
        except Exception as e:
            print(f"  ❌ Erro ao processar linha {index + 1}: {e}")
            error_count += 1
            db.rollback()
    
    print(f"\n🎉 Migração concluída!")
    print(f"   ✅ {created_count} procedimentos criados")
    print(f"   ❌ {error_count} erros")
    
    return True


def main():
    """Executar migração da planilha"""
    parser = argparse.ArgumentParser(description='Migrar procedimentos de planilha Excel/CSV')
    parser.add_argument('file_path', help='Caminho para o arquivo Excel/CSV')
    parser.add_argument('--clear', action='store_true', help='Limpar procedimentos existentes antes da importação')
    
    args = parser.parse_args()
    
    print("🚀 MIGRAÇÃO DE PROCEDIMENTOS - Planilha")
    print("=" * 50)
    
    # Verificar se arquivo existe
    if not Path(args.file_path).exists():
        print(f"❌ Arquivo não encontrado: {args.file_path}")
        return False
    
    if args.clear:
        print("⚠️  ATENÇÃO: Procedimentos existentes serão removidos!")
        response = input("Deseja continuar? (digite 'SIM' para confirmar): ")
        if response.upper() != 'SIM':
            print("❌ Operação cancelada.")
            return False
    
    db = SessionLocal()
    
    try:
        success = migrate_from_excel(db, args.file_path, args.clear)
        
        if success:
            # Estatísticas finais
            total_procedimentos = db.query(Procedimento).count()
            total_insumos = db.query(Insumo).count()
            total_empresas = db.query(Empresa).count()
            
            print(f"\n📊 Estatísticas finais:")
            print(f"   📋 Total de procedimentos: {total_procedimentos}")
            print(f"   📦 Total de insumos: {total_insumos}")
            print(f"   🏢 Total de empresas: {total_empresas}")
            
        return success
        
    except Exception as e:
        print(f"❌ Erro durante migração: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)