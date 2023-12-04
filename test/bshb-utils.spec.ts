import { BshbUtils } from "../src/bshb-utils";
import { expect } from "chai";

describe("BshbUtils", () => {
  it("generate identifier", () => {
    const identifier = BshbUtils.generateIdentifier();

    expect(identifier).to.not.be.null;
    expect(identifier.length).to.be.greaterThan(0);
  });

  it("generate client certificate", () => {
    const result = BshbUtils.generateClientCertificate();

    expect(result).to.not.be.null;
    expect(result.cert).to.not.be.null;
    expect(result.private).to.not.be.null;
  });
});
