/**
 * This object contains the basic structure of a client during pairing
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class BoschClientData {

    private '@type' = 'client';
    private primaryRole = 'ROLE_DEFAULT_CLIENT';
    private dynamicRoles = [];
    private os = 'ANDROID';
    private osVersion = '8.0';
    private appVersion = '9.2.2';
    private deleted = false;

    /**
     * Create data for a new client with necessary information
     *
     * @param name
     *        name of the new client
     * @param id
     *        identifier of the new client (pick a unique one)
     * @param certificate
     *        client certificate to use
     */
    constructor(private name: string, private id: string, private certificate: string) {
    }
}