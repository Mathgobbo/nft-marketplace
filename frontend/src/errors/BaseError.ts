export class BaseError extends Error {
  constructor(name: string, message: string) {
    super(message);
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}
