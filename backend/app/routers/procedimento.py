"""
Endpoints para gerenciamento de procedimentos
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.permissions import require_admin, PermissionChecker, get_accessible_empresas_ids
from ..schemas.procedimento import (
    ProcedimentoCreate, ProcedimentoUpdate, ProcedimentoResponse, 
    ProcedimentoCompleto, ProcedimentoWithEmpresa
)
from ..models.procedimento import Procedimento, ProcedimentoCategoria
from ..models.user import User

router = APIRouter(tags=["procedimentos"])


@router.get("/", response_model=List[ProcedimentoWithEmpresa])
def listar_procedimentos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    categoria: Optional[ProcedimentoCategoria] = Query(None),
    tipo: Optional[str] = Query(None),
    empresa_id: Optional[int] = Query(None),
    accessible_empresas_ids: List[int] = Depends(get_accessible_empresas_ids),
    db: Session = Depends(get_db)
):
    """
    Listar procedimentos (filtrados pelas permissões do usuário)
    """
    query = db.query(Procedimento).filter(Procedimento.is_active == True)
    
    # Filtrar por empresas acessíveis
    if empresa_id:
        if empresa_id not in accessible_empresas_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado à empresa especificada"
            )
        query = query.filter(Procedimento.empresa_id == empresa_id)
    else:
        query = query.filter(Procedimento.empresa_id.in_(accessible_empresas_ids))
    
    # Filtros adicionais
    if categoria:
        query = query.filter(Procedimento.categoria == categoria)
    
    if tipo:
        query = query.filter(Procedimento.tipo.ilike(f"%{tipo}%"))
    
    # Buscar com relacionamento de empresa
    procedimentos = (
        query.join(Procedimento.empresa)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Converter para response com nome da empresa
    result = []
    for proc in procedimentos:
        proc_dict = proc.__dict__.copy()
        proc_dict['empresa_nome'] = proc.empresa.nome
        result.append(proc_dict)
    
    return result


@router.get("/{procedimento_id}", response_model=ProcedimentoCompleto)
def obter_procedimento(
    procedimento_id: int,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Obter procedimento completo com insumos
    """
    procedimento = db.query(Procedimento).filter(
        Procedimento.id == procedimento_id,
        Procedimento.is_active == True
    ).first()
    
    if not procedimento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procedimento não encontrado"
        )
    
    # Verificar permissão de acesso à empresa
    permission_checker.require_empresa_access(procedimento.empresa_id)
    
    # Calcular custo total dos insumos
    custo_total = sum(
        float(pi.custo_total) for pi in procedimento.insumos 
        if pi.is_active
    )
    
    # Converter para response
    response_data = procedimento.__dict__.copy()
    response_data['insumos'] = [
        {
            'id': pi.id,
            'insumo_id': pi.insumo_id,
            'insumo_nome': pi.insumo.nome,
            'quantidade': pi.quantidade,
            'custo_unitario': pi.custo_unitario,
            'custo_total': pi.custo_total,
            'observacoes': pi.observacoes
        }
        for pi in procedimento.insumos if pi.is_active
    ]
    response_data['custo_total_insumos'] = custo_total
    
    return response_data


@router.post("/", response_model=ProcedimentoResponse, status_code=status.HTTP_201_CREATED)
def criar_procedimento(
    procedimento_create: ProcedimentoCreate,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Criar novo procedimento
    """
    # Verificar permissão de gerenciar a empresa
    permission_checker.require_empresa_management(procedimento_create.empresa_id)
    
    # Criar procedimento
    procedimento = Procedimento(**procedimento_create.model_dump())
    
    db.add(procedimento)
    db.commit()
    db.refresh(procedimento)
    
    return procedimento


@router.put("/{procedimento_id}", response_model=ProcedimentoResponse)
def atualizar_procedimento(
    procedimento_id: int,
    procedimento_update: ProcedimentoUpdate,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Atualizar procedimento
    """
    procedimento = db.query(Procedimento).filter(
        Procedimento.id == procedimento_id,
        Procedimento.is_active == True
    ).first()
    
    if not procedimento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procedimento não encontrado"
        )
    
    # Verificar permissão de gerenciar a empresa
    permission_checker.require_empresa_management(procedimento.empresa_id)
    
    # Atualizar campos
    update_data = procedimento_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(procedimento, field, value)
    
    db.commit()
    db.refresh(procedimento)
    
    return procedimento


@router.delete("/{procedimento_id}")
def desativar_procedimento(
    procedimento_id: int,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Desativar procedimento (soft delete)
    """
    procedimento = db.query(Procedimento).filter(
        Procedimento.id == procedimento_id,
        Procedimento.is_active == True
    ).first()
    
    if not procedimento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procedimento não encontrado"
        )
    
    # Verificar permissão de gerenciar a empresa
    permission_checker.require_empresa_management(procedimento.empresa_id)
    
    procedimento.is_active = False
    db.commit()
    
    return {"message": "Procedimento desativado com sucesso"}


@router.get("/me/resumo")
def obter_resumo_procedimentos(
    accessible_empresas_ids: List[int] = Depends(get_accessible_empresas_ids),
    db: Session = Depends(get_db)
):
    """
    Obter resumo dos procedimentos do usuário
    """
    query = db.query(Procedimento).filter(
        Procedimento.is_active == True,
        Procedimento.empresa_id.in_(accessible_empresas_ids)
    )
    
    total = query.count()
    
    # Contar por categoria
    comerciais = query.filter(Procedimento.categoria == ProcedimentoCategoria.COMERCIAL).count()
    financeiros = query.filter(Procedimento.categoria == ProcedimentoCategoria.FINANCEIRO).count()
    
    # Contar por tipo
    tipos = {}
    for tipo in ['Alto Ticket', 'Entrada', 'Recorrência']:
        count = query.filter(Procedimento.tipo.ilike(f"%{tipo}%")).count()
        tipos[tipo.lower().replace(' ', '_')] = count
    
    return {
        "total": total,
        "por_categoria": {
            "comercial": comerciais,
            "financeiro": financeiros
        },
        "por_tipo": tipos,
        "empresas_com_procedimentos": len(accessible_empresas_ids)
    }