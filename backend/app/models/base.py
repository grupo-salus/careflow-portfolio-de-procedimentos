from sqlalchemy import Column, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from app.core.timezone_utils import now_with_timezone

Base = declarative_base()


class TimestampMixin:
    """Mixin para adicionar campos de timestamp com timezone"""
    
    created_at = Column(
        DateTime(timezone=True), 
        default=now_with_timezone,
        server_default=func.now(),
        nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True), 
        default=now_with_timezone,
        onupdate=now_with_timezone,
        server_default=func.now(),
        nullable=False
    )