import { BoschSmartHomeBridge, BoschSmartHomeBridgeBuilder, BshbUtils } from "../src";
import { expect } from "chai";
import { DefaultTestLogger } from "./bshc-mock";

const host: string = process.env.BSHC_HOST!;
const identifier: string = process.env.BSHC_IDENTIFIER!;
const password: string = process.env.BSHC_PWD!;
const clientCert: string = "-----BEGIN CERTIFICATE-----\n" + process.env.BSHC_CERT! + "\n-----END CERTIFICATE-----";
const clientPrivateKey: string =
  "-----BEGIN RSA PRIVATE KEY-----\n" + process.env.BSHC_PRIV! + "\n-----END RSA PRIVATE KEY-----";

describe("BshbUtils", () => {
  let bshb: BoschSmartHomeBridge;
  before(() => {
    const certResult = BshbUtils.generateClientCertificate();
    bshb = BoschSmartHomeBridgeBuilder.builder()
      .withHost(host)
      .withClientCert(clientCert)
      .withClientPrivateKey(clientPrivateKey)
      .withIgnoreCertificateCheck(true)
      .withLogger(new DefaultTestLogger())
      .build();
  });

  it("e2e get rooms", (done) => {
    let response: any;
    bshb
      .getBshcClient()
      .getRooms()
      .subscribe({
        next: (value) => (response = value),
        error: (error) => {
          expect.fail(error, "Expected that rooms returns a result");
        },
        complete: () => {
          expect(response).to.be.not.null;
          done();
        },
      });
  });
});
