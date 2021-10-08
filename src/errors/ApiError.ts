export default class ApiError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = ApiError.name; // stack traces display correctly now
  }
}
