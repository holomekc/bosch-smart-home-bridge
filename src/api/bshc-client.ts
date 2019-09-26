import {Logger} from '../logger';
import {CertificateStorage} from '../certificate-storage';
import {Observable} from 'rxjs';
import {AbstractBshcClient} from './abstract-bshc-client';

/**
 * This client contains some basic calls which are available to contact Bosch Smart Home Controller (BSHC)
 * the method {@link BshcClient#call} is not a predefined call and allows to specify it in more detail
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class BshcClient extends AbstractBshcClient {

    private static COMMON_PORT = 8444;

    /**
     * Create a new instance of the Bosch Smart Home Controller Client
     *
     * @param host
     *        host name / ip address of BSHC
     * @param identifier
     *        identifier of certificate to use during calls
     * @param certificateStorage
     *        instance of certificate storage
     * @param logger
     *        logger to use
     */
    constructor(host: string, private identifier: string, private certificateStorage: CertificateStorage, logger: Logger) {
        super(host, logger);
    }

    private getOptions() {
        return {
            certificateStorage: this.certificateStorage,
            identifier: this.identifier
        }
    }

    /**
     * Get all rooms stored
     * @return an object based on the json structure returned from BSHC
     */
    public getRooms(): Observable<any[]> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', '/smarthome/rooms', null, this.getOptions());
    }

    /**
     * Get all devices
     * @return an object based on the json structure returned from BSHC
     */
    public getDevices(): Observable<any> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', '/smarthome/devices', null, this.getOptions());
    }

    /**
     * Get all device services
     * @return an object based on the json structure returned from BSHC
     */
    public getDevicesServices(): Observable<any[]> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', '/smarthome/services', null, this.getOptions());
    }

    /**
     * Tell BSHC to set a new value for a specified state. Use the device service path to identify the state
     * @param path
     *        device service path to use
     * @param data
     *        data to send. Will be converted to json. It must contain @type otherwise BSHC will not understand the request.
     * @return an object based on the json structure returned from BSHC
     */
    public putState(path: string, data: any): Observable<any[]> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'PUT', `/smarthome/${path}/state`, data, this.getOptions());
    }

    /**
     * Not defined call to BSHC in case something is missing here
     * @param port
     *        port to use
     * @param method
     *        HTTP method to use
     * @param path
     *        url path to use
     * @param data
     *        data to send. Will be converted to json. It must contain @type otherwise BSHC will not understand the request.
     */
    public call(port: number, method: string, path: string, data?: any) {
        return this.simpleCall(port, 'PUT', path, data, this.getOptions());
    }
}