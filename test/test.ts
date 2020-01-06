import {catchError, switchMap} from "rxjs/operators";
import {BehaviorSubject, EMPTY} from "rxjs";
import {BoschSmartHomeBridgeBuilder} from "../src/builder/bosch-smart-home-bridge-builder";
import {BshbUtils} from "../src/bshb-utils";

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
const clientCert: string = '-----BEGIN CERTIFICATE-----\n' + extractArg(3) + '\n-----END CERTIFICATE-----';
const clientPrivateKey: string = '-----BEGIN RSA PRIVATE KEY-----\n' + extractArg(4) + '\n-----END RSA PRIVATE KEY-----';

let certificate = {
    cert: clientCert,
    private: clientPrivateKey
};

// or generate it:
// identifier = BshbUtils.generateIdentifier();
// certificate = BshbUtils.generateClientCertificate();

const bshb = BoschSmartHomeBridgeBuilder.builder()
    .withHost(host)
    .withClientCert(certificate.cert)
    .withClientPrivateKey(certificate.private)
    .build();

const pollingTrigger = new BehaviorSubject(true);

bshb.pairIfNeeded('bshb', identifier, password).pipe(catchError(err => {
    console.log("Test Result error:");
    console.log(err);
    return EMPTY;
}), switchMap(pairingResponse => {
    console.log("Pairing result:");
    if (pairingResponse) {
        console.log("Pairing successful");
        console.log(pairingResponse.incomingMessage.statusCode);
        console.log(pairingResponse.parsedResponse);
    } else {
        console.log("Already paired");
    }

    return bshb.getBshcClient().getRooms();
}), switchMap(getRoomsResponse => {
    console.log("GetRooms:");
    console.log(getRoomsResponse.parsedResponse);

    return bshb.getBshcClient().subscribe();
})).subscribe(response => {
    console.log("Subscribe response");
    console.log(response.parsedResponse);

    pollingTrigger.subscribe(keepPolling => {
        if (keepPolling) {
            bshb.getBshcClient().longPolling(response.parsedResponse.result).subscribe(info => {
                console.log("Changes: ");
                console.log(info.parsedResponse.result);
            }, error => {
                // Error: we want to keep polling. So true
                console.log("errorPolling", error);
                pollingTrigger.next(true);
            }, () => {
                // Complete: we want to keep polling. So true
                console.log("completePolling");
                pollingTrigger.next(true);
            });
        } else {
            bshb.getBshcClient().unsubscribe(response.parsedResponse.result).subscribe(() => {
            });
        }
    });
});