import {Logger} from './logger';
import * as fs from 'fs';
import {CertificateGenerator} from './certificate-generator';

/**
 * This class handles the client certificates which are placed in a directory and named after the unique identifier of
 * a client. So basically:
 * <identifier>.pem
 * <identifier>-key.pem
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class CertificateStorage {

    private certificateGenerator: CertificateGenerator;

    private certificateCache = new Map<string, string>();
    private keyCache = new Map<string, string>();

    /**
     * Create a new instance
     *
     * @param certPath
     *        absolute path of directory where certificates are placed or will be generated to
     * @param logger
     *        logger to use
     */
    constructor(private certPath: string, private logger: Logger) {
        this.certificateGenerator = new CertificateGenerator(this.certPath, this.logger);
    }

    /**
     * Get client certificate content as string
     *
     * @param identifier
     *        unique identifier of client
     */
    public getClientCertificate(identifier: string): string {
        if (this.certificateCache.get(identifier)) {
            return <string>this.certificateCache.get(identifier);
        }

        const path = `${this.certPath}/${identifier}.pem`;
        this.generateClientCertificateIfNeeded(path, identifier);

        this.certificateCache.set(identifier, fs.readFileSync(path, 'utf-8'));

        return <string>this.certificateCache.get(identifier);
    }

    /**
     * Get client certificate key as string
     *
     * @param identifier
     *        unique identifier of client
     */
    public getClientCertificateKey(identifier: string): string {
        if (this.keyCache.get(identifier)) {
            return <string>this.keyCache.get(identifier);
        }

        const path = `${this.certPath}/${identifier}-key.pem`;
        this.generateClientCertificateIfNeeded(path, identifier);

        this.keyCache.set(identifier, fs.readFileSync(path, 'utf-8'));

        return <string>this.keyCache.get(identifier);
    }

    private generateClientCertificateIfNeeded(path: string, identifier: string) {
        if (!fs.existsSync(path)) {
            this.logger.info(`certificate for identifier ${identifier} not found. Creating new client certificate.`);
            this.certificateGenerator.createNewCertificate(identifier);
            this.logger.info('certificate creation successful');
        }
    }

}