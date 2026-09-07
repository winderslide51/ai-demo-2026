// Typed errors thrown by the services and mapped to HTTP statuses by app.ts.

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 400 — the request itself is wrong (bad month, bad filter). */
export class RequeteInvalideError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

/** 404 — the resource does not exist. */
export class IntrouvableError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

/** 409 — the action conflicts with the current state. */
export class ConflitError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}
