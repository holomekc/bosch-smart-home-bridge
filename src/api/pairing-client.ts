import {BoschClientData} from '../model/bosch-client-data';
import {Logger} from '../logger';
import { Observable} from 'rxjs';
import {AbstractBshcClient} from './abstract-bshc-client';

/**
 * This client is only used for the pairing of the client to Bosch Smart Home Controller.
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class PairingClient extends AbstractBshcClient {

    /**
     * Create a new {@link PairingClient}
     * @param host
     *        host name / ip address of BSHC
     * @param logger
     *        logger to use
     */
    constructor(host: string, logger: Logger) {
        super(host, logger);
    }

    private static PAIR_PATH = '/smarthome/clients';

    /**
     * Send a pairing request to BSHC
     *
     * @param identifier
     *        unique identifier of certificate / client
     * @param name
     *        name of the client (will be displayed in BSH app
     * @param certificate
     *        Certificate to use (base64 encoded with header / footer)
     * @param systemPassword
     *        system password of BSHC
     */
    public sendPairingRequest(identifier: string, name: string, certificate: string, systemPassword: string): Observable<{ url: string, token: string }> {
        const clientData = new BoschClientData(name, identifier, certificate);
        const postData = JSON.stringify(clientData);

        return this.simpleCall(PairingClient.PAIR_PORT, 'POST', PairingClient.PAIR_PATH, postData, {systemPassword: systemPassword});
    }
}