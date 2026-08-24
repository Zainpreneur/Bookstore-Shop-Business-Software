// A typed error carrying an HTTP status code, so the error middleware can
// respond with the right status instead of always returning 500.
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}
