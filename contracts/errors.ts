export class PendoError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "PendoError";
  }
}

export const Errors = {
  unauthorized: (msg = "Hujaruhusiwa") => new PendoError("UNAUTHORIZED", msg, 401),
  forbidden: (msg = "Huna ruhusa") => new PendoError("FORBIDDEN", msg, 403),
  notFound: (msg = "Hakuna") => new PendoError("NOT_FOUND", msg, 404),
  badRequest: (msg = "Ombi sio sahihi") => new PendoError("BAD_REQUEST", msg, 400),
  internal: (msg = "Hitilafu ya ndani") => new PendoError("INTERNAL", msg, 500),
  invalidPin: (msg = "PIN sio sahihi") => new PendoError("INVALID_PIN", msg, 401),
};
