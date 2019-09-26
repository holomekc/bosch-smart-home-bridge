import * as childProcess from 'child_process';
import {Logger} from './logger';

/**
 * This class simply generates the client certificate and key which is needed during communication with
 * Bosch Smart Home Controller.
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class CertificateGenerator {

    /**
     * Create a new instance
     * @param certPath
     *        absolute path where client certificate will be generated to
     * @param logger
     *        logger to use
     */
    constructor(private certPath: string, private logger: Logger) {
    }

    /**
     * Create a new certificate with unique identifier
     * @param identifier
     *        identifier (basically a unique name)
     */
    public createNewCertificate(identifier: string) {
        this.createNewKey(identifier);
        this.createNewClientCertificate(identifier);
    }

    private createNewKey(identifier: string): void {
        this.createAndStartProcess('openssl', [ 'genrsa', '-out', this.certPath + '/' + identifier + '-key.pem', '2048' ]);
    }

    private createNewClientCertificate(identifier: string): void {
        this.createAndStartProcess('openssl', [ 'req', '-new', '-key', this.certPath + '/' + identifier + '-key.pem',
            '-out', this.certPath + '/' + identifier + '.pem', '-x509', '-sha512', '-subj', '/CN=' + identifier ]);
    }

    private createAndStartProcess(command: string, args: ReadonlyArray<string>) {
        const child = childProcess.spawnSync(command, args);

        // openssl is logging information on stderr
        this.logger.info(child.stderr.toString());

        if (child.error) {
            throw child.error;
        }
    }
}



