from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin


class Modulo(Base, TimestampMixin):
    __tablename__ = "modulos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)  # URL-friendly name
    descricao = Column(Text, nullable=True)
    icone = Column(String(50), nullable=True)  # Nome do ícone (ex: "portfolio", "calculator")
    ordem = Column(Integer, default=0)  # Para ordenação no menu
    is_admin_only = Column(Boolean, default=False)  # Se só admins podem acessar
    is_active = Column(Boolean, default=True)
    # Campos de timestamp herdados do TimestampMixin
    
    # Relacionamentos
    usuarios = relationship("User", secondary="usuario_modulos", back_populates="modulos")
    
    def __repr__(self):
        return f"<Modulo(nome='{self.nome}', slug='{self.slug}')>"