# Python / FastAPI — Don't

- Do not put business rules or domain calculations in routers.
- Do not query or mutate the database directly from routers.
- Do not write raw SQL when SQLAlchemy can express the operation.
- Do not return SQLAlchemy models directly from endpoints.
- Do not create endpoints without Pydantic request and response schemas.
- Do not create endpoints without `response_model` or an explicit creation status code.
- Do not use untyped `dict`, `list`, or `Any` for API contracts.
- Do not reuse one schema for both input and output when their fields differ.
- Do not accept client-controlled identifiers, roles, owners, or workflow statuses unnecessarily.
- Do not compare enum fields with scattered raw strings.
- Do not trust client-side role checks or hidden UI controls for authorization.
- Do not let consultants access another consultant's CRA.
- Do not mutate a submitted or approved CRA outside an allowed lifecycle transition.
- Do not persist totals or other values that can be derived reliably.
- Do not swallow exceptions or return successful responses containing errors.
- Do not weaken tests to accommodate an incorrect implementation.
