import selfsigned, {CertificateDefinition} from 'selfsigned';
import uuid from "uuid";

/**
 * Utils class which provides some helpful methods when using BSHB.
 */
export class BshbUtils {

    /**
     * Generate a client certificate for communication with BSHC
     */
    public static generateClientCertificate(): CertificateDefinition {
        return selfsigned.generate(null,
            {keySize: 2048, clientCertificate: false, algorithm: 'sha256'});
    }

    /**
     * Generate a random identifier which is needed during pairing process.
     */
    public static generateIdentifier(): string {
        return uuid.v4();
    }
}