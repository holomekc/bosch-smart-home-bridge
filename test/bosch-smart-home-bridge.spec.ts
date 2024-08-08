import { expect } from 'chai';
import { BoschSmartHomeBridge, BoschSmartHomeBridgeBuilder, BshbUtils } from '../src';
import { DefaultTestLogger, resetBshcAdminRouter, resetBshcRouter } from './bshc-mock';
import { Router } from 'express';

describe('BoschSmartHomeBridge', () => {
  let bshb: BoschSmartHomeBridge;
  let bshc: Router;
  let bshcAdmin: Router;
  before(() => {
    const certResult = BshbUtils.generateClientCertificate();
    bshb = BoschSmartHomeBridgeBuilder.builder()
      .withHost('127.0.0.1')
      .withClientCert(certResult.cert)
      .withClientPrivateKey(certResult.private)
      .withIgnoreCertificateCheck(true)
      .withLogger(new DefaultTestLogger())
      .build();
  });

  beforeEach(() => {
    bshc = resetBshcRouter();
    bshcAdmin = resetBshcAdminRouter();
  });

  it('should not be paired yet, and button is not pressed', done => {
    bshc.get('/smarthome/rooms', (req, res) => {
      res.statusCode = 401;
      res.json({});
    });
    bshcAdmin.post('/smarthome/clients', (req, res) => {
      res.statusCode = 401;
      res.json({});
    });

    const identifier = BshbUtils.generateIdentifier();

    bshb.pairIfNeeded('test', identifier, 'test', 1000, 0).subscribe({
      next: value => expect.fail('Expected not connected'),
      error: error => {
        expect(error).not.to.be.null;
        done();
      },
      complete: () => {
        expect.fail('Expected not connected');
      },
    });
  });

  it('should not be paired yet, and button is pressed', done => {
    bshc.get('/smarthome/rooms', (req, res) => {
      res.statusCode = 401;
      res.json({});
    });
    bshcAdmin.post('/smarthome/clients', (req, res) => {
      res.json({
        url: 'http://localhost:8884',
        token: 'someToken',
      });
    });

    const identifier = BshbUtils.generateIdentifier();

    let response: any;
    bshb.pairIfNeeded('test', identifier, 'test', 1000, 0).subscribe({
      next: value => (response = value),
      error: error => {
        expect.fail(error, 'Expected that pairing is successful');
      },
      complete: () => {
        expect(response).to.be.not.null;
        expect(response.url).to.be.not.null;
        expect(response.token).to.be.not.null;
        done();
      },
    });
  });

  it('should already be paired', done => {
    bshc.get('/smarthome/rooms', (req, res) => {
      res.json([
        {
          '@type': 'room',
          id: 'hz_1',
          iconId: 'icon_room_living_room',
          name: 'Wohnzimmer',
        },
      ]);
    });

    const identifier = BshbUtils.generateIdentifier();

    let response: any;
    bshb.pairIfNeeded('test', identifier, 'test', 1000, 0).subscribe({
      next: value => (response = value),
      error: error => {
        expect.fail(error, 'Expected that rooms returns a result');
      },
      complete: () => {
        expect(response).to.be.not.null;
        done();
      },
    });
  });
});
