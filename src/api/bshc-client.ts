import {Logger} from '../logger';
import {CertificateStorage} from '../certificate-storage';
import {Observable, of} from 'rxjs';
import {AbstractBshcClient} from './abstract-bshc-client';
import {map} from "rxjs/operators";
import {BshbResponse} from "../bshb-response";

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

    private getOptions(): { certificateStorage?: CertificateStorage, systemPassword?: string, requestOptions?: any } {
        return {
            certificateStorage: this.certificateStorage
        }
    }

    /**
     * Get information about BSHC
     * @return bshb response object
     */
    public getInformation(): Observable<BshbResponse<any>> {
        return this.simpleCall(BshcClient.PAIR_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/information`, null, this.getOptions());
    }

    /**
     * Get all rooms stored
     * @return bshb response object
     */
    public getRooms(): Observable<BshbResponse<any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/rooms`, null, this.getOptions());
    }

    /**
     * Same as {@link BshcClient#getDevice()}
     * @return bshb response object
     */
    public getDevices(): Observable<BshbResponse<any[]>> {
        return this.getDevice();
    }

    /**
     * Get all devices
     * @return bshb response object
     */
    public getDevice(): Observable<BshbResponse<any[]>>;

    /**
     * Get a specified device
     * @param deviceId identifier of the device interested in
     * @return bshb response object
     */
    public getDevice(deviceId: string): Observable<BshbResponse<any>>;

    public getDevice(deviceId?: string): Observable<BshbResponse<any | any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/devices/${deviceId ? deviceId : ""}`, null, this.getOptions());
    }

    /**
     * Get all available service ids of a specified device
     * @param deviceId identifier of a device
     * @return a string array which contains all service ids of a device
     */
    public getDeviceServiceIds(deviceId: string): Observable<string[]> {
        if (deviceId) {
            return this.getDeviceServices(deviceId).pipe(map(services => {
                const result: string[] = [];
                services.parsedResponse.forEach(service => {
                    // although the library never cared about the response we need to do this here.
                    result.push(service.id);
                });
                return result;
            }));
        }else {
            return of(<string[]>[]);
        }
    }

    /**
     * Get supported device types
     * @return bshb response object
     */
    public getSupportedDeviceTypes(): Observable<BshbResponse<any>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/configuration/supportedDeviceTypes`, null, this.getOptions());
    }

    /**
     * Get services of all devices
     * @return bshb response object
     */
    public getDevicesServices(): Observable<BshbResponse<any[]>> {
        return this.getDeviceServices();
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
     * @return bshb response object
     */
    public getDeviceServices(deviceId: string, serviceId: 'all'): Observable<BshbResponse<any[]>>;

    /**
     * Get a specified service of a specified device
     * @param deviceId identifier of the relevant device
     * @param serviceId identifier of a service
     * @return bshb response object
     */
    public getDeviceServices(deviceId: string, serviceId: string): Observable<BshbResponse<any[]>>;

    public getDeviceServices(deviceId?: string, serviceId?: string | 'all'): Observable<BshbResponse<any[]>> {
        let path = `/${BshcClient.PATH_PREFIX}/services`;
        if (deviceId) {
            path = `/${BshcClient.PATH_PREFIX}/devices/${deviceId}/services/`;
            if (serviceId && serviceId !== 'all') {
                path += serviceId;
            }
        }
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', path, null, this.getOptions());
    }

    /**
     * Get all scenarios
     * @return bshb response object
     */
    public getScenarios(): Observable<BshbResponse<any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/scenarios`, null, this.getOptions());
    }

    /**
     * Trigger the specified scenario
     * @param scenarioId
     *        identifier of a scenario
     * @return bshb response object
     */
    public triggerScenario(scenarioId: string): Observable<BshbResponse<any>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'POST', `/${BshcClient.PATH_PREFIX}/scenarios/${scenarioId}/triggers`, null, this.getOptions());
    }

    /**
     * Get alarm state
     * @return bshb response object
     */
    public getAlarmState(): Observable<BshbResponse<any>> {
        const path = '/devices/intrusionDetectionSystem/services/IntrusionDetectionControl/state';
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}${path}`, null, this.getOptions());
    }

    /**
     * Set alarm state
     * @param armed
     *        <code>true</code> if alarm should be armed. Otherwise <code>false</code>
     * @return bshb response object
     */
    public setAlarmState(armed: boolean): Observable<BshbResponse<any>> {
        let value;
        if (armed) {
            value = '"SYSTEM_ARMED"';
        } else {
            value = '"SYSTEM_DISARMED"';
        }
        const data = `{"@type": "intrusionDetectionControlState","value": ${value}}`;
        return this.putState('devices/intrusionDetectionSystem/services/IntrusionDetectionControl', data);
    }

    /**
     * Get alarm state
     * @return bshb response object
     */
    public getPresenceSimulation(): Observable<BshbResponse<any>> {
        const path = '/devices/presenceSimulationService/services/PresenceSimulationConfiguration/state';
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}${path}`, null, this.getOptions());
    }

    /**
     * Set alarm state
     * @param enable
     *        <code>true</code> if presence is enabled. Otherwise <code>false</code>
     * @return bshb response object
     */
    public setPresenceSimulation(enable: boolean): Observable<BshbResponse<any>> {
        const data = `{"@type": "presenceSimulationConfigurationState","enabled": ${enable}}`;
        return this.putState('devices/presenceSimulationService/services/PresenceSimulationConfiguration', data);
    }

    /**
     * Tell BSHC to set a new value for a specified state. Use the device service path to identify the state
     * @param path
     *        device service path to use
     * @param data
     *        data to send. Will be converted to json. It must contain @type otherwise BSHC will not understand the request
     *        (see https://apidocs.bosch-smarthome.com/local/).
     * @return bshb response object
     */
    public putState(path: string, data: any): Observable<BshbResponse<any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'PUT', `/${BshcClient.PATH_PREFIX}/${path}/state`, data, this.getOptions());
    }

    /**
     * Get all connected clients
     * @return bshb response object
     */
    public getClients(): Observable<BshbResponse<any[]>> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/clients`, null, this.getOptions());
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
            'params': [ 'com/bosch/sh/remote/*', null ] // we subscribe to all topics
        });
    }

    /**
     * Start long polling after subscription
     *
     * @param subscriptionId
     *        identifier from subscription request
     */
    public longPolling(subscriptionId: string): Observable<BshbResponse<{ result: any[], jsonrpc: string }>> {
        return this.call(BshcClient.COMMON_PORT, 'POST', '/remote/json-rpc', {
            'jsonrpc': '2.0',
            'method': 'RE/longPoll',
            'params': [ subscriptionId, 30 ]
        });
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
            'params': [ subscriptionId ]
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
     * @param requestOptions
     *        define custom headers, etc. Some values may be overwritten. E.g. host
     */
    public call<T>(port: number, method: string, path: string, data?: any, requestOptions?: any): Observable<BshbResponse<T>> {
        let options = this.getOptions();
        options.requestOptions = requestOptions;
        return this.simpleCall(port, method, path, data, options);
    }
}