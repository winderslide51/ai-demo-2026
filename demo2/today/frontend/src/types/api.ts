// Shared shapes for every remote data flow in the project (frozen contract).
export interface ApiErrorBody {
  detail: string;
}

export type RequestState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
