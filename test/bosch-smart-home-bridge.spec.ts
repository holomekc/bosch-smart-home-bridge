import { expect } from "chai";
import { BshbUtils } from "../src/bshb-utils";
import { BoschSmartHomeBridge, BoschSmartHomeBridgeBuilder } from "../src";
import { createBshcRouter } from "./bshc-mock";
import { Router } from "express";

describe("BoschSmartHomeBridge", () => {
  let bshb: BoschSmartHomeBridge;
  let bshc: Router;
  before(() => {
    const certResult = BshbUtils.generateClientCertificate();
    bshb = BoschSmartHomeBridgeBuilder.builder()
      .withHost("127.0.0.1")
      .withClientCert(certResult.cert)
      .withClientPrivateKey(certResult.private)
      .withIgnoreCertificateCheck(true)
      /*.withLogger(
        new (class implements Logger {
          fine(message?: any, ...optionalParams: any[]): void {}

          debug(message?: any, ...optionalParams: any[]): void {}

          info(message?: any, ...optionalParams: any[]): void {}

          warn(message?: any, ...optionalParams: any[]): void {}

          error(message?: any, ...optionalParams: any[]): void {}
        })()
      )*/
      .build();
  });

  beforeEach(() => {
    bshc = createBshcRouter();
  });

  it("test not paired", (done) => {
    bshc.get("/smarthome/rooms", (req, res) => {
      res.statusCode = 401;
      res.json({});
    });

    const identifier = BshbUtils.generateIdentifier();

    let response: any;
    bshb.pairIfNeeded("test", identifier, "test", 1000, 1).subscribe({
      next: (value) => expect.fail("Expected not connected"),
      error: (error) => {
        expect(error).not.to.be.null;
        done();
      },
      complete: () => {
        expect.fail("Expected not connected");
      },
    });
  });

  it("test already pairing", (done) => {
    bshc.get("/smarthome/rooms", (req, res) => {
      res.json([
        {
          "@type": "room",
          id: "hz_1",
          iconId: "icon_room_living_room",
          name: "Wohnzimmer",
        },
      ]);
    });

    const identifier = BshbUtils.generateIdentifier();

    let response: any;
    bshb.pairIfNeeded("test", identifier, "test", 1000, 1).subscribe({
      next: (value) => (response = value),
      error: (error) => {
        expect.fail("Expected that rooms returns a result");
      },
      complete: () => {
        expect(response).to.be.not.null;
        done();
      },
    });
  });
});
