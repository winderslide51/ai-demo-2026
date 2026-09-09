---
applyTo: "backend/**"
---

# Python / FastAPI — Do

- Keep FastAPI routers thin by validating input, calling a service, and returning a schema.
- Put business rules in `app/services/` so they can be tested without HTTP.
- Use SQLAlchemy models and sessions for persistence from services or repositories.
- Define separate Pydantic request and response schemas for every API operation.
- Declare `response_model` and an explicit success status code on every endpoint.
- Inherit API schemas from the shared camel-case base model.
- Add type hints to every function parameter and return value.
- Represent roles, CRA statuses, and entry types with enums.
- Inject database sessions and authenticated users with FastAPI dependencies.
- Enforce role, ownership, and lifecycle checks on the server.
- Return French error details with the correct HTTP status code.
- Use `409 Conflict` for domain-state conflicts and `403 Forbidden` for denied roles.
- Write pytest API tests from acceptance criteria before implementing endpoints.
- Add focused service tests for every business invariant.
- Keep backend coverage at or above 70% and use Ruff for formatting and linting.
