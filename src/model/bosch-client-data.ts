/**
 * This object contains the basic structure of a client during pairing
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class BoschClientData {

    private '@type' = 'client';
    private id: string;
    private name: string;
    private primaryRole = 'ROLE_RESTRICTED_CLIENT';
    private deleted = false;

    /**
     * Create data for a new client with necessary information
     *
     * @param name
     *        name of the Open Source Project, which uses this library. "OSS " prefix is added automatically.
     * @param id
     *        identifier of the new client (pick a unique one). "oss_" prefix is added automatically.
     * @param certificate
     *        2048 bit selfsigned client certificate
     */
    constructor(name: string, id: string, private certificate: string) {
        this.id = 'oss_' + id;
        this.name = 'OSS ' + name;
    }
}