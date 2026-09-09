---
name: fastapi-endpoint
description: Use when adding or changing a CRA FastAPI REST endpoint, including its schemas, service, repository, dependencies, status codes, errors, pagination, or filters.
---

# FastAPI endpoint

Follow the Python Do/Don't rules in `.claude/rules/` or the identical
`.github/instructions/` files. This example covers the `Mission` resource from US-003
and US-004.

## End-to-end layers

```text
app/routers/missions.py       HTTP transport and dependencies
app/schemas/mission.py        request and response contracts
app/services/mission.py       authorization and business rules
app/repositories/mission.py   SQLAlchemy queries
app/models/mission.py         persistence mapping
```

Routers validate transport input, call one service operation, and return a response.
They do not contain business rules or database queries.

## Route naming and status codes

| Action | Route | Status |
|---|---|---|
| list | `GET /api/missions` | `200` |
| read | `GET /api/missions/{mission_id}` | `200` |
| create | `POST /api/missions` | `201` |
| update | `PUT /api/missions/{mission_id}` | `200` |
| delete assignment | `DELETE /api/missions/{id}/affectations/{user_id}` | `204` |
| close | `POST /api/missions/{id}/cloturer` | `200` |

Use plural collection nouns and the French domain-action routes frozen in `specs/`.
Use `400` for malformed operations not represented by validation, `403` for denied
roles, `404` for unavailable resources, and `409` for domain-state conflicts.

## Pydantic schemas

Schemas inherit the project's camel-case base model: Python remains `snake_case` and
JSON uses `camelCase`.

```python
class MissionCreate(CamelModel):
    name: str = Field(min_length=1, max_length=120)
    client: str = Field(min_length=1, max_length=120)
    start_date: date
    end_date: date | None = None


class MissionRead(CamelModel):
    id: int
    name: str
    client: str
    start_date: date
    end_date: date | None
    is_closed: bool
```

Never accept server-owned fields such as `id`, `is_closed`, `user_id`, or workflow
status in a create payload.

## Repository

```python
def list_missions(
    db: Session, *, client: str | None, closed: bool | None, limit: int, offset: int
) -> Sequence[Mission]:
    query = select(Mission).order_by(Mission.name)
    if client:
        query = query.where(Mission.client.ilike(f"%{client}%"))
    if closed is not None:
        query = query.where(Mission.is_closed.is_(closed))
    return db.scalars(query.limit(limit).offset(offset)).all()
```

## Service

```python
def create_mission(db: Session, manager: User, payload: MissionCreate) -> Mission:
    if manager.role is not UserRole.MANAGER:
        raise ForbiddenError("Action réservée aux managers.")
    if payload.end_date and payload.end_date < payload.start_date:
        raise ConflictError("La date de fin précède la date de début.")
    return mission_repository.create(db, payload)
```

## Router and dependencies

```python
router = APIRouter(prefix="/api/missions", tags=["missions"])


@router.get("", response_model=list[MissionRead])
def list_missions(
    client: str | None = None,
    closed: bool | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Sequence[Mission]:
    return mission_service.list_visible(db, user, client, closed, limit, offset)


@router.post("", response_model=MissionRead, status_code=status.HTTP_201_CREATED)
def create_mission(
    payload: MissionCreate,
    db: Session = Depends(get_db),
    manager: User = Depends(require_manager),
) -> Mission:
    return mission_service.create_mission(db, manager, payload)
```

`get_current_user` reads `X-Demo-User`; `require_manager` returns `403` for consultants.
Ownership and visibility still belong in the service because they depend on the resource.

## Error mapping

Services raise typed domain errors. One global handler preserves the French API contract:

```python
@app.exception_handler(DomainError)
def handle_domain_error(_: Request, exc: DomainError) -> JSONResponse:
    return JSONResponse(exc.status_code, {"detail": exc.message})
```

Pydantic validation returns `422`. Successful deletion returns an empty `204` response.
Do not leak SQLAlchemy exceptions or return an error inside a `200` payload.

## Before considering the task complete

- [ ] Route, verb, payload, role, and status match the story or architecture contract.
- [ ] Separate request and response schemas are typed and use camel-case JSON aliases.
- [ ] Router contains no business rule or persistence query.
- [ ] DB session and current user are injected with `Depends`.
- [ ] Role, ownership, and visibility are enforced server-side.
- [ ] Pagination bounds and filters are explicit and tested.
- [ ] Every non-2xx response has `{"detail": "<message français>"}`.
- [ ] Happy path, conflict, missing resource, and wrong-role API tests pass.
- [ ] The endpoint renders correctly in `/docs`.
