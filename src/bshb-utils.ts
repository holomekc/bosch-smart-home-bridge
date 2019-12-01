import selfsigned, {CertificateDefinition} from 'selfsigned';
import uuid from "uuid";

/**
 * Utils class which provides some helpful methods when using BSHB.
 */
export class BshbUtils {

    /**
     * Generate a client certificate for communication with BSHC
     * @param identifier
     *        unique identifier (uuid)
     */
    public static generateClientCertificate(identifier: string): CertificateDefinition {
        return selfsigned.generate(null, {keySize: 2048, clientCertificate: true, clientCertificateCN: identifier});
    }

    /**
     * Generate a random identifier which is needed during pairing process.
     */
    public static generateIdentifier(): string {
        return uuid.v4();
    }
}