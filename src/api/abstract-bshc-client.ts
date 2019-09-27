import {Observable} from 'rxjs';
import * as https from 'https';
import {Logger} from '../logger';
import {CertificateStorage} from '../certificate-storage';

/**
 * This class provides a simple call for all defined clients
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export abstract class AbstractBshcClient {

    protected static PAIR_PORT = 8443;

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
    protected simpleCall<T>(port: number, method: string, path: string, data?: any, options?: { certificateStorage?: CertificateStorage, identifier?: string, systemPassword?: string, requestOptions?: any }): Observable<T> {

        const requestOptions: any = {};

        if (options && options.requestOptions) {
            Object.keys(options.requestOptions).forEach(key => {
                requestOptions[key] = options.requestOptions[key];
            })
        }

        requestOptions.hostname = this.host;
        requestOptions.port = port;
        requestOptions.path = path;
        requestOptions.method = method;
        requestOptions.rejectUnauthorized = false; // self signed cert ignored of BSHC. Maybe we could add an option to set the caCert as well which would make it more secure.
        if (!requestOptions.headers) {
            requestOptions.headers = {};
        }

        requestOptions.headers['Content-Type'] = 'application/json';
        requestOptions.headers['Accept'] = 'application/json';

        if (options && options.requestOptions) {
            Object.keys(options.requestOptions).forEach(key => {
                requestOptions[key] = options.requestOptions[key];
            });
        }

        if(options && options.certificateStorage && options.identifier) {
            requestOptions.key = options.certificateStorage.getClientCertificateKey(options.identifier);
            requestOptions.cert = options.certificateStorage.getClientCertificate(options.identifier);
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

        return new Observable(observer => {
            const req = https.request(requestOptions, res => {
                this.logger.fine('');
                this.logger.fine('response information:');
                this.logger.fine('response:\nstatus:', res.statusCode);
                this.logger.fine('headers:', res.headers);


                let chunks: any[] = [];

                res.on('data', data => {
                    chunks.push(data);
                }).on('end', () => {

                    if (res.statusCode !== undefined && res.statusCode === 204) {
                        observer.next(undefined);
                    } else {
                        const data = Buffer.concat(chunks);
                        const dataString = data.toString('utf-8');

                        this.logger.fine('content: ', dataString);
                        this.logger.fine('');

                        const dataObj = JSON.parse(dataString);

                        observer.next(dataObj);
                    }
                    observer.complete();
                });
            });

            req.on('error', err => {
                this.logger.fine('error: ', err);
                return observer.error(err);
            });

            if (postData) {
                req.write(postData);
            }
            req.end();
        });
    }
}