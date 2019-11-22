import {BoschSmartHomeBridge, DefaultLogger} from "../src";
import {catchError, switchMap} from "rxjs/operators";
import {BehaviorSubject, EMPTY} from "rxjs";

const host: string = process.argv[2];
const identifier: string = process.argv[3];
const certPath: string = process.argv[4];
const password: string = process.argv[5];
const mac: string = process.argv[6];

const bshb = new BoschSmartHomeBridge(host, identifier, certPath, new DefaultLogger());

const pollingTrigger = new BehaviorSubject(true);

bshb.pairIfNeeded('bshb', password).pipe(catchError(err => {
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

    return bshb.getBshcClient().subscribe(mac);
})).subscribe(response => {
    console.log("Subscribe response");
    console.log(response.parsedResponse);

    pollingTrigger.subscribe(keepPolling => {
        if (keepPolling) {
            bshb.getBshcClient().longPolling(mac, response.parsedResponse.result).subscribe(info => {
                console.log("Changes: ");
                console.log(info.parsedResponse.result);
            }, error => {
                // Error: we want to keep polling. So true
                console.log("errorPolling");
                pollingTrigger.next(true);
            }, () => {
                // Complete: we want to keep polling. So true
                console.log("completePolling");
                pollingTrigger.next(true);
            });
        } else {
            bshb.getBshcClient().unsubscribe(mac, response.parsedResponse.result).subscribe(() => {
            });
        }
    });
});