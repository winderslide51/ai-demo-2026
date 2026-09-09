"""The single French error boundary for every non-2xx API response.

Registers three exception handlers so that ``create_app()`` guarantees the
invariant: every non-2xx response body is exactly ``{"detail": "<phrase
française>"}`` (see ADR 0001).
"""

import logging
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

FRENCH_DEFAULT_DETAIL: dict[int, str] = {
    400: "Requête invalide.",
    401: "Authentification requise.",
    403: "Accès refusé.",
    404: "Ressource introuvable.",
    405: "Méthode non autorisée.",
    409: "Conflit avec l'état actuel de la ressource.",
    422: "Données invalides.",
    500: "Une erreur interne est survenue.",
}

FRENCH_DEFAULT_DETAIL_FALLBACK = "Une erreur est survenue."

FRENCH_BY_TYPE: dict[str, str] = {
    "missing": "champ obligatoire",
    "string_too_short": "texte trop court",
    "string_too_long": "texte trop long",
    "string_type": "texte attendu",
    "int_parsing": "nombre attendu",
    "int_type": "nombre attendu",
    "float_parsing": "nombre attendu",
    "float_type": "nombre attendu",
    "bool_parsing": "booléen attendu",
    "bool_type": "booléen attendu",
    "date_parsing": "date invalide",
    "date_from_datetime_parsing": "date invalide",
    "date_type": "date invalide",
    "enum": "valeur non autorisée",
    "literal_error": "valeur non autorisée",
    "greater_than": "valeur hors limites",
    "greater_than_equal": "valeur hors limites",
    "less_than": "valeur hors limites",
    "less_than_equal": "valeur hors limites",
}

FRENCH_BY_TYPE_FALLBACK = "valeur invalide"

_LOCATION_PREFIXES = {"body", "query", "path", "header", "cookie"}


def _french_http_detail(status_code: int, detail: object) -> str:
    """Return the French detail for an ``HTTPException``.

    Application code always raises French details; only the English
    standard phrase produced by Starlette's own defaults is replaced.
    """
    default_french = FRENCH_DEFAULT_DETAIL.get(status_code, FRENCH_DEFAULT_DETAIL_FALLBACK)
    try:
        english_phrase = HTTPStatus(status_code).phrase
    except ValueError:
        english_phrase = None
    if not isinstance(detail, str) or detail == english_phrase:
        return default_french
    return detail


async def handle_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Normalise every ``HTTPException`` to ``{"detail": "<phrase française>"}``."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": _french_http_detail(exc.status_code, exc.detail)},
        headers=exc.headers,
    )


def _flatten_validation_errors(errors: list[dict[str, object]]) -> str:
    """Flatten a Pydantic ``422`` error list into one French sentence."""
    parts: list[str] = []
    for error in errors:
        loc = error.get("loc", ())
        field = ".".join(str(part) for part in loc if part not in _LOCATION_PREFIXES)
        error_type = str(error.get("type", ""))
        message = FRENCH_BY_TYPE.get(error_type, FRENCH_BY_TYPE_FALLBACK)
        parts.append(f"{field} : {message}" if field else message)
    if not parts:
        return "Données invalides."
    return "Données invalides : " + " ; ".join(parts)


async def handle_validation_error(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Flatten FastAPI's list-shaped ``422`` payload into one French sentence."""
    return JSONResponse(
        status_code=422,
        content={"detail": _flatten_validation_errors(exc.errors())},
    )


async def handle_unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
    """Catch every unhandled exception, log it, and never leak its content."""
    logger.exception("Unhandled exception while processing %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": FRENCH_DEFAULT_DETAIL[500]},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register the three handlers that form the application's error boundary."""
    app.add_exception_handler(StarletteHTTPException, handle_http_exception)
    app.add_exception_handler(RequestValidationError, handle_validation_error)
    app.add_exception_handler(Exception, handle_unhandled_exception)
