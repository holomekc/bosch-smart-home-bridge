import {Observable, Subscriber} from 'rxjs';
import * as https from 'https';
import {RequestOptions} from 'https';
import {Logger} from '../logger';
import {CertificateStorage} from '../certificate-storage';
import {BshbResponse} from '../bshb-response';
import {BshbError} from '../error/bshb-error';
import {BshbErrorType} from '../error/bshb-error-type';
import {BshbCallOptions} from '../bshb-call-options';
import {BshbUtils} from '../bshb-utils';

/**
 * This class provides a simple call for all defined clients
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export abstract class AbstractBshcClient {

    protected static PAIR_PORT = 8443;

    private static DEFAULT_TIMEOUT = 5000;

    /**
     * Needed parameters for a {@link AbstractBshcClient}
     *
     * @param host
     *        host name / ip address of BSHC
     * @param logger
     *        Logger to use
     */
    protected constructor(protected host: string, protected logger: Logger) {
    }

    /**
     * A simple call to the Bosch Smart Home Controller (BSHC)
     * @param port
     *        port to use for the call
     * @param method
     *        HTTP method type
     * @param path
     *        path to use
     * @param data
     *        body of request. If not defined no content will be set
     * @param options
     *        a set of options to specify the call regarding security.
     */
    protected simpleCall<T>(port: number, method: string, path: string, data?: any,
                            options?: {
                                certificateStorage?: CertificateStorage, systemPassword?: string,
                                bshbCallOptions?: BshbCallOptions
                            }): Observable<BshbResponse<T>> {

        const requestOptions: RequestOptions = {};
        requestOptions.timeout = AbstractBshcClient.DEFAULT_TIMEOUT;
        requestOptions.hostname = this.host;
        requestOptions.port = port;
        requestOptions.path = path;
        requestOptions.method = method;
        requestOptions.rejectUnauthorized = true;
        (requestOptions as any).checkServerIdentity = (host: string) => {
            // we cannot use tls.checkServerIdentity because it would fail altname check
            host = '' + host;

            if (host === this.host) {
                return undefined;
            } else {
                throw new BshbError(`Hostname verification failed. server=${host} expected=${this.host}`, BshbErrorType.ERROR);
            }
        };
        requestOptions.ca = BshbUtils.getBoschSmartHomeControllerRootCa();
        if (!requestOptions.headers) {
            requestOptions.headers = {};
        }

        requestOptions.headers['Content-Type'] = 'application/json';
        requestOptions.headers['Accept'] = 'application/json';
        requestOptions.headers['api-version'] = '2.1';

        if (options && options.bshbCallOptions && options.bshbCallOptions) {
            Object.keys(options.bshbCallOptions).forEach(key => {
                (requestOptions as any)[key] = (options.bshbCallOptions as any)[key];
            });
        }

        if (options && options.certificateStorage) {
            requestOptions.key = options.certificateStorage.clientPrivateKey;
            requestOptions.cert = options.certificateStorage.clientCert;
        }

        if (options && options.systemPassword) {
            requestOptions.headers['Systempassword'] = Buffer.from(options.systemPassword).toString('base64');
        }

        this.logger.fine('requestOptions: ', requestOptions);

        let postData: string | undefined = undefined;
        if (data) {
            if (typeof data === 'string') {
                postData = data;
            } else {
                postData = JSON.stringify(data);
            }
            requestOptions.headers['Content-Length'] = postData.length;
        }

        this.logger.fine('');
        this.logger.fine('call:\n' + requestOptions.method + ' | ' + requestOptions.hostname + ':' + requestOptions.port + requestOptions.path);
        this.logger.fine('headers:\n', requestOptions.headers);
        this.logger.fine('body:\n', postData ? postData : '');
        this.logger.fine('');

        return new Observable<BshbResponse<T>>(observer => {
            const req = https.request(requestOptions, res => {
                this.logger.fine('');
                this.logger.fine('response information:');
                this.logger.fine('status:', res.statusCode);
                this.logger.fine('headers:', res.headers);

                let chunks: any[] = [];

                res.on('data', data => {
                    chunks.push(data);
                }).on('end', () => {

                    let dataString = undefined;
                    if (chunks.length > 0) {
                        const data = Buffer.concat(chunks);
                        dataString = data.toString('utf-8');
                    }

                    this.logger.fine('content: ', dataString);
                    this.logger.fine('');

                    try {
                        let parsedData = undefined;
                        if (dataString) {
                            parsedData = JSON.parse(dataString);
                        }

                        if (res.statusCode && res.statusCode >= 300) {
                            this.handleError(observer, BshbErrorType.ERROR, `call to BSHC failed with HTTP status=${res.statusCode}`);
                        } else {
                            observer.next(new BshbResponse<T>(res, parsedData));
                        }
                    } catch (e) {
                        observer.error(new BshbError('error during parsing response from BSHC:',
                            BshbErrorType.PARSING, e));
                    } finally {
                        observer.complete();
                    }
                }).on('error', err => {
                    this.handleError(observer, BshbErrorType.ERROR, err);
                });
            });

            // error and socket handling
            req.on('error', err => {
                this.handleError(observer, BshbErrorType.ERROR, err);
            }).on('abort', () => {
                this.handleError(observer, BshbErrorType.ABORT, 'call to BSHC aborted by client');
            }).on('timeout', () => {
                this.handleError(observer, BshbErrorType.TIMEOUT, 'timeout during call to BSHC');
            });

            if (postData) {
                req.write(postData);
            }

            req.end();
        });
    }

    private handleError<T>(observer: Subscriber<BshbResponse<T>>, errorType: BshbErrorType, errorDetails: any): void {
        this.logger.error('error during call to BSHC: ', errorDetails);
        try {
            if (errorDetails instanceof Error) {
                observer.error(new BshbError('error during call to BSHC: ', errorType, errorDetails));
            } else if (typeof errorDetails === 'string') {
                observer.error(new BshbError(errorDetails, errorType));
            } else {
                observer.error(new BshbError('error during call to BSHC', errorType));
            }
        } finally {
            observer.complete();
        }
    }
}