---
name: fastapi-testing
description: Use when writing or fixing CRA backend pytest tests, especially acceptance-first API tests, in-memory SQLite fixtures, service rules, authorization, and coverage.
---

# FastAPI testing

Follow the Python Do/Don't rules in `.claude/rules/` or the identical
`.github/instructions/` files. Tests prove the story contract and business behavior.

## Required order

1. Read the story acceptance criteria and the API contract frozen by `architect`.
2. Write API tests first, one per criterion that crosses the HTTP boundary.
3. Run them and confirm they fail for the missing behavior.
4. Implement until they pass; never weaken, skip, or delete a test to make code green.
5. Add focused service unit tests until meaningful coverage clears 70%.

Name tests after the criterion they prove:

```python
def test_submit_cra_when_no_entry_returns_409() -> None:
    """US-012 — « Soumettre un CRA sans aucune saisie est refusé. »"""
```

## Layout

```text
backend/tests/
  conftest.py
  api/test_auth.py
  api/test_missions.py
  api/test_cra.py
  services/test_cra_rules.py
```

API tests are acceptance tests. Service tests isolate domain rules without HTTP.

## Isolated fixtures

```python
@pytest.fixture
def db() -> Iterator[Session]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def as_jean(client: TestClient, users: dict[str, User]) -> TestClient:
    client.headers["X-Demo-User"] = str(users["jean"].id)
    return client
```

Each test receives a fresh in-memory database. Never depend on `cra.db`, real HTTP, test
order, wall-clock sleeps, or mutable module-level state. If the application is async,
use `httpx.AsyncClient` with `ASGITransport(app=app)` and async fixtures instead.
Seed Jean and Marie as consultants and Paul as manager in a `users` fixture.

## Naming

Use `test_<action>_<condition>_<expected>`:

```python
def test_submit_cra_when_empty_returns_409(...): ...
def test_add_entry_when_day_is_full_returns_409(...): ...
def test_create_mission_as_consultant_returns_403(...): ...
def test_list_missions_as_consultant_returns_assigned_only(...): ...
```

## API tests

```python
def test_create_mission_as_manager_returns_201(as_paul: TestClient) -> None:
    payload = {"name": "Refonte portail", "client": "ACME", "startDate": "2026-01-05"}
    response = as_paul.post("/api/missions", json=payload)
    assert response.status_code == 201
    assert response.json()["name"] == "Refonte portail"
    assert response.json()["isClosed"] is False


def test_create_mission_as_consultant_returns_403(as_jean: TestClient) -> None:
    payload = {"name": "Refonte portail", "client": "ACME", "startDate": "2026-01-05"}
    response = as_jean.post("/api/missions", json=payload)
    assert response.status_code == 403
    assert response.json()["detail"]
```

Assert status first, then business-relevant payload fields. For errors, normally assert
the status and a non-empty French `detail`; assert exact wording only when the story fixes it.

## Business-rule tests

```python
def test_add_entry_when_day_is_full_raises(
    db: Session, users: dict[str, User], mission: Mission
) -> None:
    cra = cra_service.get_or_create(db, users["jean"], 2026, 3)
    cra_service.add_entry(
        db, cra, date(2026, 3, 2), EntryType.MISSION, 1.0, mission.id
    )

    with pytest.raises(DayAlreadyFullError):
        cra_service.add_entry(
            db, cra, date(2026, 3, 2), EntryType.RTT, 0.5, None
        )
```

Pin every important rule:

- daily fractions total at most `1.0`;
- weekends and French public holidays are rejected;
- mission entries require an active assignment on the entry date;
- absence entries cannot reference a mission;
- lifecycle transitions reject editing submitted or approved CRAs;
- consultants cannot access another consultant's CRA;
- managers see and review only their own team.

Use representative holiday cases such as 1 May, Easter Monday, and 14 July.

## Coverage configuration

```toml
[tool.pytest.ini_options]
addopts = "--cov=app --cov-report=term-missing --cov-fail-under=70"
```

```text
uv run pytest
uv run pytest tests/api/test_cra.py --no-cov
```

Use `--no-cov` only for a tight local iteration. Before completion, run the configured
suite. Read `term-missing`: cover untested behavior, not trivial getters chosen to inflate
the percentage.

## Before considering the task complete

- [ ] API tests were written from acceptance criteria before implementation.
- [ ] Each acceptance criterion maps to a clearly named test.
- [ ] No test was weakened, skipped, or deleted to accommodate the implementation.
- [ ] Every endpoint covers success, domain failure, wrong role, and ownership as relevant.
- [ ] Every business invariant fails a focused service test when removed.
- [ ] Tests use isolated in-memory data and no execution-order dependency.
- [ ] Coverage is at least 70%, with remaining lines reviewed in `term-missing`.
- [ ] `uv run pytest` passes with coverage enforcement.
