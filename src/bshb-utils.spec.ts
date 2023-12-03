// src/add.spec.ts
import { BshbUtils } from "./bshb-utils";

describe("identifier", () => {
  it("should add two numbers", () => {
    const identifier = BshbUtils.generateIdentifier();

    expect(identifier).not.toBeNull();
    expect(identifier.length).toBeGreaterThan(0);
  });
});
