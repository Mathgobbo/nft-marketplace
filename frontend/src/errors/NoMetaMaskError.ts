import { BaseError } from "./BaseError";

export class NoMetaMaskError extends BaseError {
  constructor() {
    super("NO_METAMASK", "Install metamask to interact with Project");
  }
}
