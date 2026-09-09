---
applyTo: "frontend/**"
---

# React / TypeScript — Do

- Write function components with hooks and keep one primary component per file.
- Put route-level orchestration in `src/pages/` and reusable presentation in `src/components/`.
- Keep presentational components pure by receiving data and callbacks through typed props.
- Put HTTP calls in typed `src/api/` clients and expose remote data through hooks.
- Define API DTOs and closed value sets in `src/types/`.
- Enable TypeScript strict mode and type every prop, state value, payload, and response.
- Handle loading, error, and empty states explicitly for every remote data flow.
- Keep state local and lift it only when multiple sibling components need the same value.
- Use `useState`, `useReducer`, or a small React context before considering external state tools.
- Derive totals, filters, and display values during render instead of duplicating them in state.
- Use stable business identifiers as React list keys.
- Write user-visible labels and error messages in French.
- Give interactive controls semantic elements, accessible names, and visible focus states.
- Test behavior through accessible roles, labels, and user interactions with Vitest and Testing Library.
