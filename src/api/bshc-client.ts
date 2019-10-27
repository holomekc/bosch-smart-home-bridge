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
    private static PATH_PREFIX = 'smarthome';

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

    private getOptions(): { certificateStorage?: CertificateStorage, identifier?: string, systemPassword?: string, requestOptions?: any } {
        return {
            certificateStorage: this.certificateStorage,
            identifier: this.identifier
        }
    }

    /**
     * Get information about BSHC
     * @return an object based on the json structure returned from BSHC
     */
    public getInformation(): Observable<any> {
        return this.simpleCall(BshcClient.PAIR_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/information`, null, this.getOptions());
    }

    /**
     * Get all rooms stored
     * @return an object based on the json structure returned from BSHC
     */
    public getRooms(): Observable<any[]> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/rooms`, null, this.getOptions());
    }

    /**
     * Get all devices
     * @return an object based on the json structure returned from BSHC
     */
    public getDevices(): Observable<any> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/devices`, null, this.getOptions());
    }

    /**
     * Get supported device types
     * @return an object based on the json structure returned from BSHC
     */
    public getSupportedDeviceTypes(): Observable<any> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/configuration/supportedDeviceTypes`, null, this.getOptions());
    }

    /**
     * Get all device services
     * @return an object based on the json structure returned from BSHC
     */
    public getDevicesServices(): Observable<any[]> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/services`, null, this.getOptions());
    }

    /**
     * Get all scenarios
     * @return an object based on the json structure returned from BSHC
     */
    public getScenarios(): Observable<any[]> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/scenarios`, null, this.getOptions());
    }

    /**
     * Trigger the specified scenario
     * @param scenarioId
     *        identifier of a scenario
     * @return an object based on the json structure returned from BSHC
     */
    public triggerScenario(scenarioId: string): Observable<any> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'POST', `/${BshcClient.PATH_PREFIX}/scenarios/${scenarioId}/triggers`, null, this.getOptions());
    }

    /**
     * Get alarm state
     * @return an object based on the json structure returned from BSHC
     */
    public getAlarmState(): Observable<any> {
        const path = '/devices/intrusionDetectionSystem/services/IntrusionDetectionControl/state';
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}${path}`, null, this.getOptions());
    }

    /**
     * Set alarm state
     * @param armed
     *        <code>true</code> if alarm should be armed. Otherwise <code>false</code>
     * @return an object based on the json structure returned from BSHC
     */
    public setAlarmState(armed: boolean): Observable<any> {
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
     * @return an object based on the json structure returned from BSHC
     */
    public getPresenceSimulation(): Observable<any> {
        const path = '/devices/presenceSimulationService/services/PresenceSimulationConfiguration/state';
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}${path}`, null, this.getOptions());
    }

    /**
     * Set alarm state
     * @param enable
     *        <code>true</code> if presence is enabled. Otherwise <code>false</code>
     * @return an object based on the json structure returned from BSHC
     */
    public setPresenceSimulation(enable: boolean): Observable<any> {
        const data = `{"@type": "presenceSimulationConfigurationState","enabled": ${enable}}`;
        return this.putState('devices/presenceSimulationService/services/PresenceSimulationConfiguration', data);
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
        return this.simpleCall(BshcClient.COMMON_PORT, 'PUT', `/${BshcClient.PATH_PREFIX}/${path}/state`, data, this.getOptions());
    }

    /**
     * Get all connected clients
     * @return an object based on the json structure returned from BSHC
     */
    public getClients(): Observable<any[]> {
        return this.simpleCall(BshcClient.COMMON_PORT, 'GET', `/${BshcClient.PATH_PREFIX}/clients`, null, this.getOptions());
    }

    /**
     * Subscribe to listen to notifications of bshc
     *
     * @param bshcMac
     *        mac of BSHC in format: xx-xx-xx-xx-xx-xx
     * @return an object which contains 'result' which is the subscriptionId and 'jsonrpc' which is the json-rpc version
     */
    public subscribe(bshcMac: string): Observable<{ result: string, jsonrpc: string }> {
        return this.call(BshcClient.COMMON_PORT, 'POST', '/remote/json-rpc', {
            'jsonrpc': '2.0',
            'method': 'RE/subscribe',
            'params': [ 'com/bosch/sh/remote/*', null ] // we subscribe to all topics
        }, {
            headers: {
                'Gateway-ID': bshcMac
            }
        });
    }

    /**
     * Start long polling after subscription
     *
     * @param bshcMac
     *        mac of BSHC in format: xx-xx-xx-xx-xx-xx
     * @param subscriptionId
     *        identifier from subscription request
     */
    public longPolling(bshcMac: string, subscriptionId: string): Observable<{ result: any[], jsonrpc: string }> {
        return this.call(BshcClient.COMMON_PORT, 'POST', '/remote/json-rpc', {
            'jsonrpc': '2.0',
            'method': 'RE/longPoll',
            'params': [ subscriptionId, 20 ]
        }, {
            headers: {
                'Gateway-ID': bshcMac
            }
        });
    }

    /**
     * Stop subscription
     *
     * @param bshcMac
     *        mac of BSHC in format: xx-xx-xx-xx-xx-xx
     * @param subscriptionId
     *        identifier from subscription request
     */
    public unsubscribe(bshcMac: string, subscriptionId: string): Observable<{ result: null, jsonrpc: string }> {
        return this.call(BshcClient.COMMON_PORT, 'POST', '/remote/json-rpc', {
            'jsonrpc': '2.0',
            'method': 'RE/unsubscribe',
            'params': [ subscriptionId ]
        }, {
            headers: {
                'Gateway-ID': bshcMac
            }
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
    public call<T>(port: number, method: string, path: string, data?: any, requestOptions?: any): Observable<T> {
        let options = this.getOptions();
        options.requestOptions = requestOptions;
        return this.simpleCall(port, method, path, data, options);
    }
}