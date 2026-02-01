import { BoschSmartHomeBridge, BoschSmartHomeBridgeBuilder, BshbUtils } from '../src';
import { expect } from 'chai';
import { DefaultTestLogger } from './bshc-mock';
import { first, from, Observable, switchMap, timer } from 'rxjs';
import { promises as fs } from 'fs';
import { map } from 'rxjs/operators';

const host: string = process.env.BSHC_HOST!;
const identifier: string = process.env.BSHC_IDENTIFIER!;
const password: string = process.env.BSHC_PWD!;
const clientCert: string = '-----BEGIN CERTIFICATE-----\n' + process.env.BSHC_CERT! + '\n-----END CERTIFICATE-----';
const clientPrivateKey: string =
  '-----BEGIN RSA PRIVATE KEY-----\n' + process.env.BSHC_PRIV! + '\n-----END RSA PRIVATE KEY-----';

const pollUntil = <T>(pollInterval: number, responsePredicate: (res: T) => boolean) => {
  return (source$: Observable<T>) =>
    timer(0, pollInterval).pipe(
      switchMap(() => source$),
      first(responsePredicate)
    );
};

describe('BshbUtils', () => {
  let bshb: BoschSmartHomeBridge;
  before(async () => {
    const certResult = await BshbUtils.generateClientCertificate();
    bshb = BoschSmartHomeBridgeBuilder.builder()
      .withHost(host)
      .withClientCert(certResult.cert)
      .withClientPrivateKey(certResult.private)
      .withIgnoreCertificateCheck(true)
      .withLogger(new DefaultTestLogger())
      .build();
  });

  it('e2e get rooms', done => {
    let response: any;
    bshb
      .getBshcClient()
      .getRooms()
      .subscribe({
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

  it('e2e create backup and upload it', done => {
    let response: any;
    bshb
      .getBshcClient()
      .createBackup(password)
      .pipe(
        switchMap(_ => {
          return bshb
            .getBshcClient()
            .getBackupStatus()
            .pipe(pollUntil(2_000, res => res.parsedResponse.state === 'READY'));
        }),
        switchMap(_ => {
          return bshb.getBshcClient().getBackup();
        }),
        switchMap(response => {
          const file = `./${response.parsedResponse.fileName}`;
          return from(fs.writeFile(file, response.parsedResponse.data)).pipe(map(_ => file));
        }),
        switchMap(file => {
          return from(fs.readFile(file));
        }),
        switchMap(data => {
          return bshb.getBshcClient().uploadRestoreFile(data);
        }),
        switchMap(_ => {
          return bshb
            .getBshcClient()
            .getRestoreStatus()
            .pipe(pollUntil(2_000, res => res.parsedResponse.state === 'BACKUP_UPLOADED'));
        })
      )
      .subscribe({
        next: _ => {
          // nothing as it seems
        },
        error: error => {
          expect.fail(error, 'Expected that get status returns a result');
        },
        complete: () => {
          expect(response).to.be.not.null;
          done();
        },
      });
  });
});
