import {Logger} from '../logger';
import {CertificateStorage} from '../certificate-storage';
import {Observable, of} from 'rxjs';
import {AbstractBshcClient} from './abstract-bshc-client';
import {map, tap} from "rxjs/operators";
import {BshbResponse} from "../bshb-response";
import {BshbCallOptions} from "../bshb-call-options";
import {PollingResponse} from "../model/polling-response";
import {BshbError} from "../error/bshb-error";
import {BshbErrorType} from "../error/bshb-error-type";

/**
 * This client contains some basic calls which are available to contact Bosch Smart Home Controller (BSHC)
 * the method {@link BshcClient#call} is not a predefined call and allows to specify it in more detail
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class BshcClient extends AbstractBshcClient {

    private static COMMON_PORT = 8444;
    private static PATH_PREFIX = 'smarthome';

    /**
     * Create a new instance of the Bosch Smart Home Controller Client
     *
     * @param host
     *        host name / ip address of BSHC
     * @param certificateStorage
     *        instance of certificate storage
     * @param logger
     *        logger to use
     */
    constructor(host: string, private certificateStorage: CertificateStorage, logger: Logger) {
        super(host, logger);
    }

    private getOptions(bshbCallOptions?: BshbCallOptions): { certificateStorage?: CertificateStorage, systemPassword?: string, bshbCallOptions?: BshbCallOptions } {
        if (bshbCallOptions) {
            return {
                certificateStorage: this.certificateStorage,
                bshbCallOptions: bshbCallOptions
            };
        } else {
            return {
                certificateStorage: this.certificateStorage
            };
        }
    }

    /**
     * Get information about BSHC
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getInformation(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        return this.simpleCall(BshcClient.PAIR_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/information`, null, this.getOptions(bshbCallOptions));
    }

    /**
     * Get all rooms stored
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getRooms(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/rooms`, null, this.getOptions(bshbCallOptions));
    }

    /**
     * Same as {@link BshcClient#getDevice()}
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getDevices(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>> {
        return this.getDevice(undefined, bshbCallOptions);
    }

    /**
     * Get all devices
     * @return bshb response object
     */
    public getDevice(): Observable<BshbResponse<any[]>>;

    /**
     * Get a specified device
     * @param deviceId
     *        identifier of the device interested in. If undefined all devices are returned
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getDevice(deviceId: string | undefined, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>>;

    public getDevice(deviceId?: string, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any | any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET',
            `/${BshcClient.PATH_PREFIX}/devices/${deviceId ? deviceId : ""}`,
            null, this.getOptions(bshbCallOptions));
    }

    /**
     * Get all available service ids of a specified device
     * @param deviceId identifier of a device
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return a string array which contains all service ids of a device
     */
    public getDeviceServiceIds(deviceId: string, bshbCallOptions?: BshbCallOptions): Observable<string[]> {
        if (deviceId) {
            return this.getDeviceServices(deviceId).pipe(map(services => {
                const result: string[] = [];
                services.parsedResponse.forEach(service => {
                    // although the library never cared about the response we need to do this here.
                    result.push(service.id);
                });
                return result;
            }));
        } else {
            return of(<string[]>[]);
        }
    }

    /**
     * Get supported device types
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getSupportedDeviceTypes(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET',
            `/${BshcClient.PATH_PREFIX}/configuration/supportedDeviceTypes`,
            null, this.getOptions(bshbCallOptions));
    }

    /**
     * Get services of all devices
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getDevicesServices(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>> {
        return this.getDeviceServices(undefined, undefined, bshbCallOptions);
    }

    /**
     * Get all services of all devices
     * @return bshb response object
     */
    public getDeviceServices(): Observable<BshbResponse<any[]>>;

    /**
     * Get all services of a specified device
     * @param deviceId identifier of the relevant device
     * @return bshb response object
     */
    public getDeviceServices(deviceId: string): Observable<BshbResponse<any[]>>;

    /**
     * Get all services of a specified device
     * @param deviceId identifier of the relevant device
     * @param serviceId <code>'all'</code> to get all services
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getDeviceServices(deviceId: string | undefined, serviceId: 'all', bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>>;

    /**
     * Get a specified service of a specified device
     * @param deviceId identifier of the relevant device
     * @param serviceId identifier of a service
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getDeviceServices(deviceId: string | undefined, serviceId: string |undefined, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>>;

    public getDeviceServices(deviceId?: string, serviceId?: string | 'all', bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>> {
        let path = `/${BshcClient.PATH_PREFIX}/services`;
        if (deviceId) {
            path = `/${BshcClient.PATH_PREFIX}/devices/${deviceId}/services/`;
            if (serviceId && serviceId !== 'all') {
                path += serviceId;
            }
        }
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', path, null, this.getOptions(bshbCallOptions));
    }

    /**
     * Get all scenarios
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getScenarios(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET',
            `/${BshcClient.PATH_PREFIX}/scenarios`, null, this.getOptions(bshbCallOptions));
    }

    /**
     * Trigger the specified scenario
     * @param scenarioId
     *        identifier of a scenario
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public triggerScenario(scenarioId: string, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'POST',
            `/${BshcClient.PATH_PREFIX}/scenarios/${scenarioId}/triggers`,
            null, this.getOptions(bshbCallOptions));
    }

    /**
     * Get alarm state
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getAlarmState(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        const path = '/devices/intrusionDetectionSystem/services/IntrusionDetectionControl/state';
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}${path}`,
            null, this.getOptions(bshbCallOptions));
    }

    /**
     * Set alarm state
     * @param armed
     *        <code>true</code> if alarm should be armed. Otherwise <code>false</code>
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public setAlarmState(armed: boolean, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        let value;
        if (armed) {
            value = '"SYSTEM_ARMED"';
        } else {
            value = '"SYSTEM_DISARMED"';
        }
        const data = `{"@type": "intrusionDetectionControlState","value": ${value}}`;
        return this.putState('devices/intrusionDetectionSystem/services/IntrusionDetectionControl', data, bshbCallOptions);
    }

    /**
     * Get alarm state
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getPresenceSimulation(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        const path = '/devices/presenceSimulationService/services/PresenceSimulationConfiguration/state';
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}${path}`,
            null, this.getOptions(bshbCallOptions));
    }

    /**
     * Set alarm state
     * @param enable
     *        <code>true</code> if presence is enabled. Otherwise <code>false</code>
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public setPresenceSimulation(enable: boolean, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        const data = `{"@type": "presenceSimulationConfigurationState","enabled": ${enable}}`;
        return this.putState('devices/presenceSimulationService/services/PresenceSimulationConfiguration', data, bshbCallOptions);
    }

    /**
     * Tell BSHC to set a new value for a specified state. Use the device service path to identify the state
     * @param path
     *        device service path to use
     * @param data
     *        data to send. Will be converted to json. It must contain @type otherwise BSHC will not understand the request
     *        (see https://apidocs.bosch-smarthome.com/local/).
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public putState(path: string, data: any, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'PUT', `/${BshcClient.PATH_PREFIX}/${path}/state`, data,
            this.getOptions(bshbCallOptions));
    }

    /**
     * Get all connected clients
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getClients(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/clients`,
            null, this.getOptions(bshbCallOptions));
    }

    /**
     * Get all messages
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getMessages(bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/messages`,
            null, this.getOptions(bshbCallOptions));
    }

    /**
     * Delete all specified message ids
     * @param ids
     *        an array of identifier of messages
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public deleteMessages(ids: string[], bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'POST',
            `/${BshcClient.PATH_PREFIX}/messages/batchDelete`, ids, this.getOptions(bshbCallOptions));
    }

    /**
     * Get the specified message
     * @param id
     *        identifier of a message
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public getMessage(id: string, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/messages/${id}`,
            null, this.getOptions(bshbCallOptions));
    }

    /**
     * Delete a specified message
     * @param id
     *        identifier of a message
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     * @return bshb response object
     */
    public deleteMessage(id: string, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<any>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'DELETE', `/${BshcClient.PATH_PREFIX}/messages/${id}`,
            null, this.getOptions(bshbCallOptions));
    }

    /**
     * Subscribe to listen to notifications of bshc
     *
     * @return an object which contains 'result' which is the subscriptionId and 'jsonrpc' which is the json-rpc version
     */
    public subscribe(): Observable<BshbResponse<{ result: string, jsonrpc: string }>> {
        return this.call(BshcClient.COMMON_PORT, 'POST', '/remote/json-rpc', {
            'jsonrpc': '2.0',
            'method': 'RE/subscribe',
            'params': ['com/bosch/sh/remote/*', null] // we subscribe to all topics
        });
    }

    /**
     * Start long polling after subscription. Request is kept open for 30 seconds.
     *
     * @param subscriptionId
     *        identifier from subscription request
     *
     * @param subscriptionId
     */
    public longPolling(subscriptionId: string): Observable<BshbResponse<{ result: any[], jsonrpc: string }>> ;

    /**
     * Start long polling after subscription. Time a request is kept open can be specified by timeout value.
     * This time is transmitted to BSHC and will be considered by it.
     * Actual client timeout will be extended by 1s in favour of network delays.
     *
     * @param subscriptionId
     *        identifier from subscription request
     * @param timeout
     *        time (ms) for how long the request is kept open. Default is 30000 ms
     */
    public longPolling(subscriptionId: string, timeout: number): Observable<BshbResponse<{ result: any[], jsonrpc: string }>>;

    /**
     * Start long polling after subscription
     *
     * @param subscriptionId
     *        identifier from subscription request
     * @param timeout
     *        time (ms) for how long the request is kept open. Default is 30000 ms
     */
    public longPolling(subscriptionId: string, timeout?: number): Observable<BshbResponse<PollingResponse>> {
        if (timeout === null || typeof timeout === 'undefined') {
            timeout = 30000;
        }
        return this.call<PollingResponse>
        (BshcClient.COMMON_PORT, 'POST', '/remote/json-rpc', {
            'jsonrpc': '2.0',
            'method': 'RE/longPoll',
            'params': [subscriptionId, timeout / 1000]
        }, {
            // We do that because node http does not recognize that bshc is gone.
            // Request would be stuck forever which we do not want
            // this is the only option I could find to get notified if no something went wrong during polling
            // 1s due to network delays.
            timeout: timeout + 1000
        }).pipe(tap(response => {
            if (response && response.parsedResponse && response.parsedResponse.error) {
                throw new BshbError('error during polling: ' + response.parsedResponse.error,
                    BshbErrorType.POLLING)
            }
        }));
    }

    /**
     * Stop subscription
     *
     * @param subscriptionId
     *        identifier from subscription request
     */
    public unsubscribe(subscriptionId: string): Observable<BshbResponse<{ result: null, jsonrpc: string }>> {
        return this.call(BshcClient.COMMON_PORT, 'POST', '/remote/json-rpc', {
            'jsonrpc': '2.0',
            'method': 'RE/unsubscribe',
            'params': [subscriptionId]
        });
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
     * @param bshbCallOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     */
    public call<T>(port: number, method: string, path: string, data?: any, bshbCallOptions?: BshbCallOptions): Observable<BshbResponse<T>> {
        let options = this.getOptions(bshbCallOptions);
        return this.simpleCall(port, method, path, data, options);
    }
}