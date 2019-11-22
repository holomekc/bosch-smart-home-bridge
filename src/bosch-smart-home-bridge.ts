import {Logger} from './logger';
import {PairingClient} from './api/pairing-client';
import {concatMap, delay, retryWhen, tap} from 'rxjs/operators';
import {iif, Observable, of, throwError} from 'rxjs';
import {BshcClient} from './api/bshc-client';
import {CertificateStorage} from './certificate-storage';
import {BshbResponse} from "./bshb-response";

/**
 * The {@link BoschSmartHomeBridge} (BSHB) allows communication to Bosch Smart Home Controller (BSHC).
 * To allow communication BHSB needs to pair to BSHC. Therefore, BSHB is creating a client certificate via openssl.
 * If for some reason this is not possible you can create the client certificate / key yourself, place it in specified
 * directory and name it:
 * <identifier>.pem and <identifier>-key.pem
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class BoschSmartHomeBridge {

    private readonly certificateStorage: CertificateStorage;

    private readonly pairingClient: PairingClient;
    private readonly bshcClient: BshcClient;

    /**
     * Create a new instance for communication with BSHC
     *
     * @param host
     *        host name / ip address of BSHC
     * @param identifier
     *        unique identifier to use (during pairing or for communication). "oss_" prefix is added automatically.
     * @param certPath
     *        absolute directory where client certificate is located
     * @param logger
     *        logger to use
     */
    constructor(private host: string, private identifier: string, certPath: string, private logger: Logger) {
        this.certificateStorage = new CertificateStorage(certPath, this.logger);
        this.pairingClient = new PairingClient(this.host, this.logger);
        this.bshcClient = new BshcClient(this.host, this.identifier, this.certificateStorage, this.logger);
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
     * @param systemPassword
     *        system password of BSHC which is needed for pairing
     * @param pairingDelay
     *        delay during pairing. This will give the user some time to press the pairing button on BSHC
     * @param pairingAttempts
     *        attempts of pairing in case it is failing because pairing button not pressed on BSHC
     * @return the response object after pairing or undefined if already paired
     */
    public pairIfNeeded(name: string, systemPassword: string, pairingDelay: number = 5000, pairingAttempts: number = 50)
        : Observable<BshbResponse<{ url: string, token: string } | undefined>> {

        return new Observable(observer => {
            this.logger.info(`Check if client with identifier: ${this.identifier} is already paired.`);

            this.bshcClient.getRooms().subscribe(() => {
                this.logger.info(`Client with identifier: ${this.identifier} already paired. Using existing certificate`);
                observer.next();
                observer.complete();
            }, testConnectionError => {
                this.logger.fine('Error during call to test if already paired.', testConnectionError);
                this.logger.info(`Client with identifier: ${this.identifier} was not paired yet.`);

                this.pairClient(name, systemPassword, pairingDelay, pairingAttempts).subscribe(value => {
                    observer.next(value);
                    observer.complete();
                }, error => {
                    observer.error(error);
                    observer.complete();
                });
            });
        });
    }

    private pairClient(name: string, systemPassword: string, pairingDelay: number, pairingAttempts: number): Observable<BshbResponse<{ url: string, token: string }>> {
        return new Observable(observer => {
            const clientCertificate = this.certificateStorage.getClientCertificate(this.identifier);
            this.logger.info('Start pairing. Activate pairing on Bosch Smart Home Controller by pressing button until flashing.');

            this.pairingClient.sendPairingRequest(this.identifier, name, clientCertificate, systemPassword)
                .pipe(
                    retryWhen(errors => errors.pipe(concatMap((e, i) => iif(() => i > pairingAttempts,
                        throwError(e),
                        of(e).pipe(tap(() => this.logger.warn('Could not pair client. Did you press the paring button?')),
                            delay(pairingDelay))))))
                )
                .subscribe(value => {
                    observer.next(value);
                    observer.complete();
                }, error => {
                    this.logger.warn(`Could not pair client. Did you press the paring button on Bosch Smart Home Controller? Error details: ${error}`);
                    observer.error(error);
                });
        });
    }
}