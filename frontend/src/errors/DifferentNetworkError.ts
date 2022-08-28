import { BaseError } from "./BaseError";

export class DifferentNetworkError extends BaseError {
  constructor() {
    super(
      "DIFFERENT_NETWORK_ERROR",
      "Not connected to Mumbai Network. Please change your Network in Metamask and Refresh the page to interact"
    );
  }
}
