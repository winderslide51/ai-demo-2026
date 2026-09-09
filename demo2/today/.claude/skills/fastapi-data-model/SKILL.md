---
name: fastapi-data-model
description: Use when creating or changing CRA SQLAlchemy models, enums, relationships, constraints, migrations, schema conversion, or deterministic seed data.
---

# CRA data model

Follow the Python Do/Don't rules in `.claude/rules/` or the identical
`.github/instructions/` files. Keep one model module per aggregate under `app/models/`.

## Entities

| Entity | Purpose | Structural fields |
|---|---|---|
| `User` | consultant or manager | `id`, `first_name`, `last_name`, `role`, `manager_id` |
| `Mission` | client engagement | `id`, `name`, `client`, dates, `is_closed` |
| `Assignment` | consultant-to-mission link | `user_id`, `mission_id` |
| `Cra` | one monthly report | `user_id`, `year`, `month`, `status`, workflow dates |
| `CraEntry` | one declaration on one day | `cra_id`, `day`, `entry_type`, `mission_id`, `fraction` |
| `Notification` | in-app workflow message | `user_id`, `kind`, `message`, `target_url`, dates |

## Closed enums

Use the values defined by `AGENT.md` and the API stories; do not translate wire values:

```python
class UserRole(StrEnum):
    CONSULTANT = "CONSULTANT"
    MANAGER = "MANAGER"


class CraStatus(StrEnum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"


class EntryType(StrEnum):
    MISSION = "MISSION"
    CONGE_PAYE = "CONGE_PAYE"
    RTT = "RTT"
    MALADIE = "MALADIE"
    SANS_SOLDE = "SANS_SOLDE"
    FORMATION = "FORMATION"
```

Rejection returns a CRA to `DRAFT`; it is not a persisted `REJECTED` status.
French display labels belong in the frontend label map.

## SQLAlchemy mapping

```python
class Cra(Base):
    __tablename__ = "cra"
    __table_args__ = (
        UniqueConstraint("user_id", "year", "month", name="uq_cra_user_month"),
        CheckConstraint("month BETWEEN 1 AND 12", name="ck_cra_month"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), index=True)
    year: Mapped[int]
    month: Mapped[int]
    status: Mapped[CraStatus] = mapped_column(default=CraStatus.DRAFT)
    submitted_at: Mapped[datetime | None] = mapped_column(default=None)
    rejection_comment: Mapped[str | None] = mapped_column(String(500), default=None)

    entries: Mapped[list["CraEntry"]] = relationship(
        back_populates="cra", cascade="all, delete-orphan"
    )
```

```python
class CraEntry(Base):
    __tablename__ = "cra_entry"
    __table_args__ = (
        CheckConstraint("fraction IN (0.5, 1.0)", name="ck_entry_fraction"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cra_id: Mapped[int] = mapped_column(ForeignKey("cra.id"), index=True)
    mission_id: Mapped[int | None] = mapped_column(ForeignKey("mission.id"), index=True)
    day: Mapped[date]
    entry_type: Mapped[EntryType]
    fraction: Mapped[Decimal] = mapped_column(Numeric(2, 1))
```

## Relationships and invariants

- Index foreign keys used in joins or visibility filters.
- Use `delete-orphan` only for records owned by the parent, such as CRA entries.
- Enforce one CRA per consultant and month with the unique constraint.
- Enforce individual fractions in the database and daily total `<= 1.0` in the service.
- A `MISSION` entry requires a mission; absence entries forbid one.
- Entries are allowed only on working days and on an active assigned mission.
- Submitted and approved CRAs are immutable except through allowed transitions.

## Derived values and schema conversion

Monthly totals, days per mission, and remaining working days are calculated from entries
when read; never persist them.

```python
class CraRead(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    year: int
    month: int
    status: CraStatus
```

Use explicit response assembly for derived fields; do not add presentation properties to
SQLAlchemy models.

## Migrations and seed

For the demo, add a small ordered migration or recreate only an explicitly disposable
local database. Never silently delete user data at startup.

`app/db/seed.py` runs only when the user table is empty and creates deterministic data:
manager Paul Durand; consultants Jean Dupont and Marie Martin; three missions and their
assignments; one previous approved CRA. Use fixed business dates and no randomness.

## Before considering the task complete

- [ ] Enum values match `AGENT.md` and the API stories exactly.
- [ ] Foreign keys, indexes, relationships, and cascades are intentional.
- [ ] One-CRA-per-month and fraction constraints exist and are tested.
- [ ] Cross-row and lifecycle invariants are enforced in a service.
- [ ] No derived total or display label is persisted.
- [ ] Pydantic read schemas enable `from_attributes=True`.
- [ ] Migration behavior is explicit and does not destroy existing data.
- [ ] Seed is deterministic, idempotent, and runs only on an empty database.
