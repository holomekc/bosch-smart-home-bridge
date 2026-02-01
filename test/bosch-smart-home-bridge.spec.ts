import { expect } from 'chai';
import { BinaryResponse, BoschSmartHomeBridge, BoschSmartHomeBridgeBuilder, BshbResponse, BshbUtils } from '../src';
import { DefaultTestLogger, resetBshcAdminRouter, resetBshcRouter } from './bshc-mock';
import { Router } from 'express';

describe('BoschSmartHomeBridge', () => {
  let bshb: BoschSmartHomeBridge;
  let bshc: Router;
  let bshcAdmin: Router;
  before(async () => {
    const certResult = await BshbUtils.generateClientCertificate();
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

  it('should not allow backup download if it does not exists', done => {
    bshc.get('/smarthome/system/backup', (req, res) => {
      res.statusCode = 412;
      res.end();
    });

    bshb
      .getBshcClient()
      .getBackup()
      .subscribe({
        next: _ => expect.fail('Expected that backup retrieval is not possible'),
        error: err => {
          expect(err).to.be.not.null;
          done();
        },
      });
  });

  it('should allow backup download', done => {
    bshc.get('/smarthome/system/backup', (req, res) => {
      res.statusCode = 200;
      const byteData = Buffer.from('Test', 'utf-8');
      res.set('Content-Type', 'application/octet-stream');
      res.set('content-disposition', 'attachment; filename="shc-20250105.home"');
      res.send(byteData);
    });

    let response: BinaryResponse;
    bshb
      .getBshcClient()
      .getBackup()
      .subscribe({
        next: value => (response = value.parsedResponse),
        error: error => {
          expect.fail(error, 'Expected that backup creation is allowed');
        },
        complete: () => {
          expect(response).to.be.not.null;
          expect(response.fileName).to.be.equal('shc-20250105.home');
          expect(response.contentDisposition).to.be.equal('attachment; filename="shc-20250105.home"');
          expect(response.data.toString('utf-8')).to.be.equal('Test');
          done();
        },
      });
  });

  it('should not allow backup creation if it already exists', done => {
    bshc.put('/smarthome/system/backup', (req, res) => {
      res.statusCode = 405;
      res.end();
    });

    bshb
      .getBshcClient()
      .createBackup('Test')
      .subscribe({
        next: _ => expect.fail('Expected that backup creation is not possible'),
        error: err => {
          expect(err).to.be.not.null;
          done();
        },
      });
  });

  it('should allow backup creation with systempassword', done => {
    bshc.put('/smarthome/system/backup', (req, res) => {
      expect(req.body.encryptionPassword).to.be.equal('Test');
      expect(req.headers.systempassword).to.be.equal(Buffer.from('Test').toString('base64'));
      res.statusCode = 201;
      res.end();
    });

    let response: any;
    bshb
      .getBshcClient()
      .createBackup('Test')
      .subscribe({
        next: value => (response = value),
        error: error => {
          expect.fail(error, 'Expected that backup creation is allowed');
        },
        complete: () => {
          expect(response).to.be.not.null;
          done();
        },
      });
  });

  it('should allow backup creation with custom password', done => {
    bshc.put('/smarthome/system/backup', (req, res) => {
      expect(req.body.encryptionPassword).to.be.equal('Encrypt');
      expect(req.headers.systempassword).to.be.equal(Buffer.from('Test').toString('base64'));
      res.statusCode = 201;
      res.end();
    });

    let response: any;
    bshb
      .getBshcClient()
      .createBackup('Test', 'Encrypt')
      .subscribe({
        next: value => (response = value),
        error: error => {
          expect.fail(error, 'Expected that backup creation is allowed');
        },
        complete: () => {
          expect(response).to.be.not.null;
          done();
        },
      });
  });

  it('should not allow backup deletion if it does not exist', done => {
    bshc.delete('/smarthome/system/backup', (req, res) => {
      res.statusCode = 403;
      res.end();
    });

    bshb
      .getBshcClient()
      .deleteBackup()
      .subscribe({
        next: _ => expect.fail('Expected that backup deletion is not possible'),
        error: err => {
          expect(err).to.be.not.null;
          done();
        },
      });
  });

  it('should allow backup deletion if it exists', done => {
    bshc.delete('/smarthome/system/backup', (req, res) => {
      res.statusCode = 201;
      res.end();
    });

    let response: any;
    bshb
      .getBshcClient()
      .deleteBackup()
      .subscribe({
        next: value => (response = value),
        error: error => {
          expect.fail(error, 'Expected that backup deletion is allowed');
        },
        complete: () => {
          expect(response).to.be.not.null;
          done();
        },
      });
  });

  it('should get backup status', done => {
    bshc.get('/smarthome/system/backup/status', (req, res) => {
      res.statusCode = 200;
      res.json({
        '@type': 'BackupStatus',
        state: 'NONE',
        statuscode: 200,
        isDeleted: false,
      });
    });

    let response: BshbResponse<any>;
    bshb
      .getBshcClient()
      .getBackupStatus()
      .subscribe({
        next: value => (response = value),
        error: error => {
          expect.fail(error, 'Expected that backup status retrieval works');
        },
        complete: () => {
          expect(response).to.be.not.null;
          expect(response.parsedResponse).to.be.not.null;
          done();
        },
      });
  });

  it('should upload restore file', done => {
    bshc.post('/smarthome/system/restore', (req, res) => {
      expect(req.body.toString('utf-8')).to.be.equal('Test');
      res.statusCode = 200;
      res.end();
    });

    let response: BshbResponse<any>;
    bshb
      .getBshcClient()
      .uploadRestoreFile(Buffer.from('Test', 'utf-8'))
      .subscribe({
        next: value => (response = value),
        error: error => {
          expect.fail(error, 'Expected that backup status retrieval works');
        },
        complete: () => {
          expect(response).to.be.not.null;
          done();
        },
      });
  });

  it('should not allow upload restore file if it already exists', done => {
    bshc.post('/smarthome/system/restore', (req, res) => {
      res.statusCode = 412;
      res.end();
    });

    bshb
      .getBshcClient()
      .uploadRestoreFile(Buffer.from('Test', 'utf-8'))
      .subscribe({
        next: _ => expect.fail('Expected that restore file upload is not possible'),
        error: err => {
          expect(err).to.be.not.null;
          done();
        },
      });
  });

  it('should trigger restore', done => {
    bshc.put('/smarthome/system/restore', (req, res) => {
      expect(req.body.encryptionPassword).to.be.equal('Test');
      res.statusCode = 200;
      res.end();
    });

    let response: BshbResponse<any>;
    bshb
      .getBshcClient()
      .startRestoreProcess('Test')
      .subscribe({
        next: value => (response = value),
        error: error => {
          expect.fail(error, 'Expected that restore trigger works');
        },
        complete: () => {
          expect(response).to.be.not.null;
          done();
        },
      });
  });

  it('should not trigger restore without confirmation', done => {
    bshc.put('/smarthome/system/restore', (req, res) => {
      res.statusCode = 412;
      res.end();
    });

    bshb
      .getBshcClient()
      .startRestoreProcess('Test')
      .subscribe({
        next: _ => expect.fail('Expected that restore file upload is not possible'),
        error: err => {
          expect(err).to.be.not.null;
          done();
        },
      });
  });

  it('should not allow restore file deletion if it does not exist', done => {
    bshc.delete('/smarthome/system/restore', (req, res) => {
      res.statusCode = 403;
      res.end();
    });

    bshb
      .getBshcClient()
      .deleteRestoreFile()
      .subscribe({
        next: _ => expect.fail('Expected that restore file deletion is not possible'),
        error: err => {
          expect(err).to.be.not.null;
          done();
        },
      });
  });

  it('should allow restore deletion if it exists', done => {
    bshc.delete('/smarthome/system/restore', (req, res) => {
      res.statusCode = 201;
      res.end();
    });

    let response: any;
    bshb
      .getBshcClient()
      .deleteRestoreFile()
      .subscribe({
        next: value => (response = value),
        error: error => {
          expect.fail(error, 'Expected that restore file deletion is allowed');
        },
        complete: () => {
          expect(response).to.be.not.null;
          done();
        },
      });
  });

  it('should get restore status', done => {
    bshc.get('/smarthome/system/restore/status', (req, res) => {
      res.statusCode = 200;
      res.json({
        '@type': 'RestoreStatus',
        state: 'NONE',
        statuscode: 200,
        isDeleted: false,
      });
    });

    let response: BshbResponse<any>;
    bshb
      .getBshcClient()
      .getRestoreStatus()
      .subscribe({
        next: value => (response = value),
        error: error => {
          expect.fail(error, 'Expected that restore status retrieval works');
        },
        complete: () => {
          expect(response).to.be.not.null;
          expect(response.parsedResponse).to.be.not.null;
          done();
        },
      });
  });

  it('should get partner restore status', done => {
    bshc.get('/smarthome/system/restore/partners', (req, res) => {
      res.statusCode = 200;
      res.json([
        {
          serviceId: 'camera',
          restored: true,
        },
      ]);
    });

    let response: BshbResponse<any>;
    bshb
      .getBshcClient()
      .getPartnerRestoreStatus()
      .subscribe({
        next: value => (response = value),
        error: error => {
          expect.fail(error, 'Expected that partner restore status retrieval works');
        },
        complete: () => {
          expect(response).to.be.not.null;
          expect(response.parsedResponse).to.be.not.null;
          done();
        },
      });
  });

  it('should not get partner restore status if not restored', done => {
    bshc.get('/smarthome/system/restore/partners', (req, res) => {
      res.statusCode = 403;
      res.end();
    });

    bshb
      .getBshcClient()
      .getPartnerRestoreStatus()
      .subscribe({
        next: _ => expect.fail('Expected that partner restore status retrieval is not possible'),
        error: err => {
          expect(err).to.be.not.null;
          done();
        },
      });
  });
});
