# React / TypeScript — Don't

- Do not write class components.
- Do not use `any`, `as any`, `@ts-ignore`, or unguarded non-null assertions.
- Do not call `fetch` or another HTTP client directly from pages or components.
- Do not mix API orchestration with reusable presentation logic.
- Do not duplicate DTO definitions across files.
- Do not introduce Redux, Zustand, or another global state library without a demonstrated need.
- Do not copy server data into local state when the API hook is already its source of truth.
- Do not store derived totals, filters, or counters in state.
- Do not mutate state objects or arrays in place.
- Do not use an array index as a key when a stable business identifier exists.
- Do not omit loading, error, or empty states for remote data.
- Do not expose raw enums, ISO dates, or English technical messages in the French UI.
- Do not rely on color alone to communicate status or meaning.
- Do not use clickable `div` elements where a button or link provides correct semantics.
- Do not test CSS classes or implementation details instead of user-visible behavior.
