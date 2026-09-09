"""Unit tests for the shared ``CamelModel`` base (ADR 0004)."""

from app.schemas.common import CamelModel


class SampleModel(CamelModel):
    """A throwaway multi-word-field schema used only to pin the behaviour."""

    api_version: str
    first_name: str


def test_model_dump_by_alias_emits_camel_case() -> None:
    """Serialisation with ``by_alias=True`` produces camelCase keys."""
    model = SampleModel(api_version="0.1.0", first_name="Jean")

    dumped = model.model_dump(by_alias=True)

    assert dumped == {"apiVersion": "0.1.0", "firstName": "Jean"}


def test_model_can_be_built_from_python_field_names() -> None:
    """``populate_by_name=True`` lets Python code build with snake_case names."""
    model = SampleModel(api_version="0.1.0", first_name="Jean")

    assert model.api_version == "0.1.0"
    assert model.first_name == "Jean"


def test_model_can_be_built_from_camel_case_aliases() -> None:
    """The model also validates input given by its camelCase alias."""
    model = SampleModel.model_validate({"apiVersion": "0.1.0", "firstName": "Jean"})

    assert model.api_version == "0.1.0"
    assert model.first_name == "Jean"


def test_json_schema_exposes_camel_case_aliases() -> None:
    """The generated JSON schema (used for OpenAPI) reflects the wire shape."""
    schema = SampleModel.model_json_schema(by_alias=True)

    assert set(schema["properties"]) == {"apiVersion", "firstName"}
