import {Logger} from './logger';
import {PairingClient} from './api/pairing-client';
import {catchError, concatMap, delay, retry, retryWhen, tap} from 'rxjs/operators';
import {iif, Observable, of, throwError} from 'rxjs';
import {BshcClient} from './api/bshc-client';
import {CertificateStorage} from './certificate-storage';
import {BshbResponse} from './bshb-response';
import {BoschSmartHomeBridgeBuilder} from './builder/bosch-smart-home-bridge-builder';

/**
 * The {@link BoschSmartHomeBridge} (BSHB) allows communication to Bosch Smart Home Controller (BSHC).
 * To allow communication BHSB needs to pair to BSHC.
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class BoschSmartHomeBridge {

    private readonly certificateStorage: CertificateStorage;

    private readonly pairingClient: PairingClient;
    private readonly bshcClient: BshcClient;

    private readonly host: string;
    private readonly logger: Logger;

    private readonly ignoreServerCertificateCheck: boolean;

    /**
     * Create a new instance for communication with BSHC
     *
     * @param bshbBuilder
     *        builder used to create an instance
     */
    constructor(bshbBuilder: BoschSmartHomeBridgeBuilder) {
        this.host = bshbBuilder.host;
        this.logger = bshbBuilder.logger;
        this.ignoreServerCertificateCheck = bshbBuilder.ignoreSeverCertificateCheck;
        this.certificateStorage = new CertificateStorage(bshbBuilder.clientCert, bshbBuilder.clientPrivateKey);
        this.pairingClient = new PairingClient(this.host, this.logger, this.ignoreServerCertificateCheck);
        this.bshcClient = new BshcClient(this.host, this.certificateStorage, this.logger, this.ignoreServerCertificateCheck);

        // remove sensitive data from builder
        bshbBuilder.withClientCert('');
        bshbBuilder.withClientPrivateKey('');
    }

    /**
     * get BSHC client after pairing which allows actual communication with BSHC
     * @return BSHC client
     */
    public getBshcClient(): BshcClient {
        return this.bshcClient;
    }

    /**
     * Pair to BSHC if not already paired.
     *
     * @param name
     *        name of the client if pairing is necessary. "OSS " prefix is added automatically
     * @param identifier
     *        identifier to use. "oss_" prefix is added automatically.
     * @param systemPassword
     *        system password of BSHC which is needed for pairing
     * @param pairingDelay
     *        delay during pairing. This will give the user some time to press the pairing button on BSHC
     * @param pairingAttempts
     *        attempts of pairing in case it is failing because pairing button not pressed on BSHC
     * @return the response object after pairing or undefined if already paired
     */
    public pairIfNeeded(name: string, identifier: string, systemPassword: string,
                        pairingDelay: number = 5000, pairingAttempts: number = 50)
        : Observable<BshbResponse<{ url: string, token: string } | undefined>> {

        return new Observable(observer => {
            this.logger.info(`Check if client with identifier: ${identifier} is already paired.`);

            this.bshcClient.getRooms().subscribe({
                next: () => {
                    this.logger.info(`Client with identifier: ${identifier} already paired. Using existing certificate`);
                    observer.next();
                    observer.complete();
                }, error: testConnectionError => {
                    this.logger.fine('Error during call to test if already paired.', testConnectionError);
                    this.logger.info(`Client with identifier: ${identifier} was not paired yet.`);

                    this.pairClient(name, identifier, systemPassword, pairingDelay, pairingAttempts).subscribe({
                        next: value => {
                            observer.next(value);
                            observer.complete();
                        }, error: error => {
                            observer.error(error);
                            observer.complete();
                        }
                    });
                }
            });
        });
    }

    private pairClient(name: string, identifier: string, systemPassword: string,
                       pairingDelay: number, pairingAttempts: number)
        : Observable<BshbResponse<{ url: string, token: string }>> {

        return new Observable(observer => {
            this.logger.info('Start pairing. Activate pairing on Bosch Smart Home Controller by pressing button until flashing.');
            this.pairingClient.sendPairingRequest(identifier, name, this.certificateStorage.clientCert, systemPassword)
                .pipe(
                    catchError(err => {
                        this.logger.warn(`Could not pair client. Did you press the paring button? Error details: ${err.cause}`)
                        return throwError(err);
                    }),
                    retry({
                        count: pairingAttempts,
                        delay: pairingDelay
                    })
                )
                .subscribe({
                    next: value => {
                        if (value.incomingMessage.statusCode === 201) {
                            this.logger.info('Pairing successful.');
                        } else {
                            this.logger.info('Unexpected pairing response. Most likely wrong input data. Check password, etc. Pairing stopped.');
                        }
                        observer.next(value);
                        observer.complete();
                    }, error: error => {
                        this.logger.warn(`Could not pair client. Did you press the paring button on Bosch Smart Home Controller? Error details: ${error.cause}`);
                        observer.error(error);
                    }
                });
        });
    }
}