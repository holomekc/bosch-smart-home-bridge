// src/add.spec.ts
import { BshbUtils } from "./bshb-utils";

describe("BshbUtils", () => {
  it("generate identifier", () => {
    const identifier = BshbUtils.generateIdentifier();

    expect(identifier).not.toBeNull();
    expect(identifier.length).toBeGreaterThan(0);
  });

  it("generate client certificate", () => {
    const result = BshbUtils.generateClientCertificate();

    expect(result).not.toBeNull();
    expect(result.cert).not.toBeNull();
    expect(result.private).not.toBeNull();
  });
});
