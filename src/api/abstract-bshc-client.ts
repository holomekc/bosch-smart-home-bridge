import { Observable, Subscriber } from 'rxjs';
import * as https from 'https';
import { RequestOptions } from 'https';
import { Logger } from '../logger';
import { CertificateStorage } from '../certificate-storage';
import { BshbResponse } from '../bshb-response';
import { BshbError } from '../error/bshb-error';
import { BshbErrorType } from '../error/bshb-error-type';
import { BshbCallOptions } from '../bshb-call-options';
import { BshbUtils } from '../bshb-utils';
import * as util from 'util';
import * as http from 'http';
import { Buffer } from 'node:buffer';
import { BinaryResponse } from '../model/binary-response';

/**
 * This class provides a simple call for all defined clients
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export abstract class AbstractBshcClient {
  protected static PAIR_PORT = 8443;

  private static DEFAULT_TIMEOUT = 5000;

  private static CONTENT_DISPOSITION_FILE_NAME_REGEX = /filename="([^"]+)"/;

  /**
   * Needed parameters for a {@link AbstractBshcClient}
   *
   * @param host
   *        host name / ip address of BSHC
   * @param logger
   *        Logger to use
   * @param ignoreServerCertificateCheck
   *        Ignores the server certificate.
   */
  protected constructor(
    protected host: string,
    protected logger: Logger,
    protected ignoreServerCertificateCheck: boolean
  ) {}

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
  protected simpleCall<T>(
    port: number,
    method: string,
    path: string,
    data?: any,
    options?: {
      certificateStorage?: CertificateStorage;
      systemPassword?: string;
      isBinaryResponse?: boolean;
      bshbCallOptions?: BshbCallOptions;
    }
  ): Observable<BshbResponse<T>> {
    const requestOptions: RequestOptions = {};
    requestOptions.timeout = AbstractBshcClient.DEFAULT_TIMEOUT;
    requestOptions.hostname = this.host;
    requestOptions.port = port;
    requestOptions.path = path;
    requestOptions.method = method;
    requestOptions.rejectUnauthorized = !this.ignoreServerCertificateCheck;
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

    if (data instanceof Buffer) {
      requestOptions.headers['Content-Type'] = 'application/octet-stream';
    } else {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.headers['Accept'] = 'application/json';
      requestOptions.headers['api-version'] = '3.12';
    }

    const isBinaryResponse = options?.isBinaryResponse || false;

    if (isBinaryResponse) {
      requestOptions.headers['Accept'] = 'application/octet-stream';
    }

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

    let postData: string | Buffer | undefined = undefined;
    if (data) {
      if (typeof data === 'string') {
        postData = data;
      } else if (data instanceof Buffer) {
        postData = data;
      } else {
        postData = JSON.stringify(data);
      }
      requestOptions.headers['Content-Length'] = postData.length;
    }

    return new Observable<BshbResponse<T>>(observer => {
      this.logger.debug(
        `
Request: (${requestOptions.method}) ${requestOptions.hostname}:${requestOptions.port}${requestOptions.path}
Headers:
${util.inspect(requestOptions.headers, { colors: true })}
Body:
${util.inspect(data, { colors: true, depth: 10 })}
`
      );
      const req = https.request(requestOptions, res => {
        const chunks: any[] = [];

        res
          .on('data', chunk => {
            chunks.push(chunk);
          })
          .on('end', () => {
            let data: any = undefined;
            if (chunks.length > 0) {
              const dataBuffer = Buffer.concat(chunks);
              if (isBinaryResponse) {
                data = dataBuffer;
              } else {
                data = dataBuffer.toString('utf-8');
              }
            }

            try {
              if (res.statusCode && res.statusCode >= 300) {
                this.logResponse(requestOptions, res, data);

                this.handleError(
                  observer,
                  BshbErrorType.ERROR,
                  `call to BSHC failed with HTTP status=${res.statusCode}`
                );
              } else {
                let parsedData = undefined;
                if (data) {
                  if (isBinaryResponse) {
                    parsedData = {
                      data: data,
                      contentDisposition: res.headers['content-disposition'],
                      fileName: this.extractFileName(res.headers['content-disposition']),
                    } as BinaryResponse;
                  } else {
                    parsedData = JSON.parse(data);
                  }
                }

                this.logResponse(requestOptions, res, parsedData);

                observer.next(new BshbResponse<T>(res, parsedData));
              }
            } catch (e) {
              this.logResponse(requestOptions, res, data);
              observer.error(new BshbError('error during parsing response from BSHC', BshbErrorType.PARSING, e));
            } finally {
              observer.complete();
            }
          })
          .on('error', err => {
            this.logResponse(requestOptions, res, undefined);
            this.handleError(observer, BshbErrorType.ERROR, err);
          });
      });

      // error and socket handling
      req
        .on('error', err => {
          this.handleError(observer, BshbErrorType.ERROR, err);
        })
        .on('abort', () => {
          this.handleError(observer, BshbErrorType.ABORT, 'call to BSHC aborted by client');
        })
        .on('timeout', () => {
          this.handleError(observer, BshbErrorType.TIMEOUT, 'timeout during call to BSHC');
        });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  }

  private handleError<T>(observer: Subscriber<BshbResponse<T>>, errorType: BshbErrorType, errorDetails: any): void {
    this.logger.error('Error during call to BSHC: ', errorDetails);
    try {
      if (errorDetails instanceof Error) {
        observer.error(new BshbError('Error during call to BSHC: ', errorType, errorDetails));
      } else if (typeof errorDetails === 'string') {
        observer.error(new BshbError(errorDetails, errorType));
      } else {
        observer.error(new BshbError('Error during call to BSHC', errorType));
      }
    } finally {
      observer.complete();
    }
  }

  private logResponse(requestOptions: RequestOptions, res: http.IncomingMessage, data?: any) {
    this.logger.debug(`
Response: (${requestOptions.method}) ${requestOptions.hostname}:${requestOptions.port}${requestOptions.path}
Status: ${util.inspect(res.statusCode, { colors: true })}
Headers:
${util.inspect(res.headers, { colors: true })}
Content:
${typeof data === 'object' ? util.inspect(data, { colors: true }) : data}
`);
  }

  private extractFileName(contentDisposition: string | undefined) {
    if (contentDisposition) {
      const match = contentDisposition.match(AbstractBshcClient.CONTENT_DISPOSITION_FILE_NAME_REGEX);
      return match ? match[1] : undefined;
    }
    return undefined;
  }
}
