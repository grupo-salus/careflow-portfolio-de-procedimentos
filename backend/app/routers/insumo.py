"""
Endpoints para gerenciamento de insumos
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..core.permissions import require_admin, PermissionChecker
from ..schemas.insumo import (
    InsumoCreate, InsumoUpdate, InsumoResponse,
    ProcedimentoInsumoCreate, ProcedimentoInsumoUpdate
)
from ..models.insumo import Insumo, InsumoTipo
from ..models.procedimento import Procedimento
from ..models.associations import ProcedimentoInsumo
from ..models.user import User

router = APIRouter(prefix="/insumos", tags=["insumos"])


@router.get("/", response_model=List[InsumoResponse])
def listar_insumos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tipo: Optional[InsumoTipo] = Query(None),
    nome: Optional[str] = Query(None),
    only_active: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Listar insumos (apenas admins podem ver todos os insumos)
    """
    query = db.query(Insumo)
    
    if only_active:
        query = query.filter(Insumo.is_active == True)
    
    if tipo:
        query = query.filter(Insumo.tipo == tipo)
    
    if nome:
        query = query.filter(Insumo.nome.ilike(f"%{nome}%"))
    
    insumos = query.offset(skip).limit(limit).all()
    return insumos


@router.get("/{insumo_id}", response_model=InsumoResponse)
def obter_insumo(
    insumo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obter insumo por ID (apenas admins)
    """
    insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
    
    if not insumo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insumo não encontrado"
        )
    
    return insumo


@router.post("/", response_model=InsumoResponse, status_code=status.HTTP_201_CREATED)
def criar_insumo(
    insumo_create: InsumoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Criar novo insumo (apenas admins)
    """
    # Verificar se insumo com mesmo nome já existe
    existing = db.query(Insumo).filter(Insumo.nome == insumo_create.nome).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um insumo com este nome"
        )
    
    insumo = Insumo(**insumo_create.model_dump())
    
    db.add(insumo)
    db.commit()
    db.refresh(insumo)
    
    return insumo


@router.put("/{insumo_id}", response_model=InsumoResponse)
def atualizar_insumo(
    insumo_id: int,
    insumo_update: InsumoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Atualizar insumo (apenas admins)
    """
    insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
    
    if not insumo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insumo não encontrado"
        )
    
    # Atualizar campos
    update_data = insumo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(insumo, field, value)
    
    db.commit()
    db.refresh(insumo)
    
    return insumo


@router.delete("/{insumo_id}")
def desativar_insumo(
    insumo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Desativar insumo (apenas admins)
    """
    insumo = db.query(Insumo).filter(Insumo.id == insumo_id).first()
    
    if not insumo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insumo não encontrado"
        )
    
    insumo.is_active = False
    db.commit()
    
    return {"message": "Insumo desativado com sucesso"}


# Endpoints para gerenciar insumos em procedimentos
@router.post("/procedimento/{procedimento_id}/insumos")
def adicionar_insumo_procedimento(
    procedimento_id: int,
    insumo_data: ProcedimentoInsumoCreate,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Adicionar insumo a um procedimento
    """
    # Verificar se procedimento existe
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
    
    # Verificar se insumo existe
    insumo = db.query(Insumo).filter(Insumo.id == insumo_data.insumo_id).first()
    if not insumo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insumo não encontrado"
        )
    
    # Verificar se associação já existe
    existing = db.query(ProcedimentoInsumo).filter(
        ProcedimentoInsumo.procedimento_id == procedimento_id,
        ProcedimentoInsumo.insumo_id == insumo_data.insumo_id,
        ProcedimentoInsumo.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insumo já está associado a este procedimento"
        )
    
    # Criar associação
    proc_insumo = ProcedimentoInsumo(
        procedimento_id=procedimento_id,
        **insumo_data.model_dump()
    )
    
    db.add(proc_insumo)
    db.commit()
    db.refresh(proc_insumo)
    
    return {"message": "Insumo adicionado ao procedimento com sucesso", "id": proc_insumo.id}


@router.put("/procedimento/{procedimento_id}/insumos/{insumo_id}")
def atualizar_insumo_procedimento(
    procedimento_id: int,
    insumo_id: int,
    update_data: ProcedimentoInsumoUpdate,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Atualizar associação insumo-procedimento
    """
    # Verificar se procedimento existe
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
    
    # Buscar associação
    proc_insumo = db.query(ProcedimentoInsumo).filter(
        ProcedimentoInsumo.procedimento_id == procedimento_id,
        ProcedimentoInsumo.insumo_id == insumo_id,
        ProcedimentoInsumo.is_active == True
    ).first()
    
    if not proc_insumo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associação insumo-procedimento não encontrada"
        )
    
    # Atualizar campos
    update_fields = update_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(proc_insumo, field, value)
    
    db.commit()
    db.refresh(proc_insumo)
    
    return {"message": "Associação atualizada com sucesso"}


@router.delete("/procedimento/{procedimento_id}/insumos/{insumo_id}")
def remover_insumo_procedimento(
    procedimento_id: int,
    insumo_id: int,
    db: Session = Depends(get_db),
    permission_checker: PermissionChecker = Depends()
):
    """
    Remover insumo de um procedimento
    """
    # Verificar se procedimento existe
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
    
    # Buscar associação
    proc_insumo = db.query(ProcedimentoInsumo).filter(
        ProcedimentoInsumo.procedimento_id == procedimento_id,
        ProcedimentoInsumo.insumo_id == insumo_id,
        ProcedimentoInsumo.is_active == True
    ).first()
    
    if not proc_insumo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associação insumo-procedimento não encontrada"
        )
    
    # Desativar associação (soft delete)
    proc_insumo.is_active = False
    db.commit()
    
    return {"message": "Insumo removido do procedimento com sucesso"}