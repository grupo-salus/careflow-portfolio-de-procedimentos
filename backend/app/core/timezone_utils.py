from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Optional
from .config import settings


def get_timezone() -> ZoneInfo:
    """Retorna o timezone configurado na aplicação"""
    return ZoneInfo(settings.TIMEZONE)


def now_with_timezone() -> datetime:
    """Retorna o datetime atual com o timezone configurado"""
    return datetime.now(get_timezone())


def utc_to_local(utc_dt: datetime) -> datetime:
    """Converte datetime UTC para o timezone local configurado"""
    if utc_dt.tzinfo is None:
        # Se não tem timezone, assume que é UTC
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    return utc_dt.astimezone(get_timezone())


def local_to_utc(local_dt: datetime) -> datetime:
    """Converte datetime local para UTC"""
    if local_dt.tzinfo is None:
        # Se não tem timezone, assume que é o timezone local configurado
        local_dt = local_dt.replace(tzinfo=get_timezone())
    return local_dt.astimezone(timezone.utc)


def format_datetime_local(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Formata datetime para o timezone local configurado"""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    local_dt = dt.astimezone(get_timezone())
    return local_dt.strftime(format_str)


def create_aware_datetime(year: int, month: int, day: int, 
                         hour: int = 0, minute: int = 0, second: int = 0) -> datetime:
    """Cria um datetime com timezone configurado"""
    return datetime(year, month, day, hour, minute, second, tzinfo=get_timezone())