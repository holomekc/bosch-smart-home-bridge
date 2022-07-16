import {switchMap, from, of, tap} from "rxjs";
import {BoschSmartHomeBridgeBuilder} from "../src/builder/bosch-smart-home-bridge-builder";
import {BshbUtils} from '../src';
import {DefaultLogger} from '../src';

const extractArg = (index: number) => {
    return process.argv[index + 2].substr(process.argv[index + 2].indexOf('=') + 1);
};

// Define arguments like this and also in that order:
// host="..."
// identifier="..."
// password="..."
// cert="..."
// key="..."
const host: string = extractArg(0);
let identifier: string = extractArg(1);
const password: string = extractArg(2);
// const clientCert: string = '-----BEGIN CERTIFICATE-----\n' + extractArg(3) + '\n-----END CERTIFICATE-----';
// const clientPrivateKey: string = '-----BEGIN RSA PRIVATE KEY-----\n' + extractArg(4) + '\n-----END RSA PRIVATE KEY-----';
// let certificate = {
//     cert: clientCert,
//     private: clientPrivateKey
// };

// or generate it:
identifier = '68da6c8e-1e24-40e1-941a-086746673663';
let certificate = BshbUtils.generateClientCertificate();

const logger = new DefaultLogger();

const bshb = BoschSmartHomeBridgeBuilder.builder()
    .withHost(host)
    .withClientCert(certificate.cert)
    .withClientPrivateKey(certificate.private)
    .withLogger(logger)
    .build();


bshb.pairIfNeeded('test123',identifier, password).pipe(
tap(() => {
    bshb.getBshcClient().getDeviceServices().pipe(
        switchMap(response => {
            console.log(`Found ${(response.parsedResponse.length)} rooms.`);
            return from(response.parsedResponse);
        }),
        switchMap(room => {
            console.log(`Cache room: ${room.id} with: ${JSON.stringify(room)}`);
            return of<void>(undefined);
        }), tap({
            complete: () => console.log('Rooms are done')
        })).subscribe();
    }
)
).subscribe();





setTimeout(function(){console.log('end'); }, 30000);