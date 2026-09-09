"""Shared Pydantic base model enforcing the camelCase wire contract."""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base schema: snake_case in Python, camelCase on the wire.

    Every request and response schema in the project inherits from this
    class, with no exception (see ADR 0004).
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
