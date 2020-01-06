import {catchError, delay, switchMap} from "rxjs/operators";
import {BehaviorSubject, EMPTY, Observable} from "rxjs";
import {BoschSmartHomeBridgeBuilder} from "../src/builder/bosch-smart-home-bridge-builder";
import {BshbError} from "../src/error/bshb-error";
import {BshbErrorType} from "../src/error/bshb-error-type";

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

let pollingTrigger = new BehaviorSubject<boolean>(true);

const poll = (delay?: number) => {
    delay = delay ? delay : 0;
    setTimeout(() => {
        pollingTrigger.next(true);
    }, delay);
};

const startPolling = (delay?: number) => {
    delay = delay ? delay : 0;
    setTimeout(() => {
        subscribeAndPoll();
    }, delay);
};

const subscribeAndPoll = () => {
    pollingTrigger.next(false);
    pollingTrigger.complete();

    pollingTrigger = new BehaviorSubject<boolean>(true);

    bshb.getBshcClient().subscribe().subscribe(response => {
        console.log("Subscribe response");
        console.log(response.parsedResponse);

        pollingTrigger.subscribe(keepPolling => {
            if (keepPolling) {
                bshb.getBshcClient().longPolling(response.parsedResponse.result).subscribe(info => {
                    if (info.incomingMessage.statusCode !== 200) {
                        poll(5000);
                    } else {
                        console.log("Changes: ");
                        console.log(info.parsedResponse.result);
                        poll();
                    }
                }, error => {
                    // Error: we want to keep polling. So true
                    if ((error as BshbError).errorType === BshbErrorType.POLLING) {
                        console.log("polling failed due to an jsonrpc error. Try to reconnect.");
                        startPolling(5000);
                    } else {
                        console.log("polling failed. Try again after delay");
                        poll(5000);
                    }
                });
            } else {
                bshb.getBshcClient().unsubscribe(response.parsedResponse.result).subscribe(() => {
                });
            }
        });
    });
};

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
})).subscribe(getRoomsResponse => {
    console.log("GetRooms:");
    console.log(getRoomsResponse.parsedResponse);

    startPolling();
});