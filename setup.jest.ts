import { TestEnvironment } from "jest-environment-jsdom";

export default class CustomTestEnvironment extends TestEnvironment {
  async setup() {
      await super.setup();
      this.global.TextEncoder = TextEncoder;
      this.global.TextDecoder = TextDecoder;
      this.global.Response = Response;
      this.global.Request = Request;
  }
}
