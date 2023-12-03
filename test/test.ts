import { from, of, switchMap, tap } from "rxjs";
import { BoschSmartHomeBridgeBuilder } from "../src/builder/bosch-smart-home-bridge-builder";

// or generate it:
identifier = BshbUtils.generateIdentifier();
certificate = BshbUtils.generateClientCertificate();

const bshb = BoschSmartHomeBridgeBuilder.builder()
  .withHost(host)
  .withClientCert(certificate.cert)
  .withClientPrivateKey(certificate.private)
  .build();

bshb
  .getBshcClient()
  .getRooms()
  .pipe(
    switchMap((response) => {
      console.log(`Found ${response.parsedResponse.length} rooms.`);
      return from(response.parsedResponse);
    }),
    switchMap((room) => {
      console.log(`Cache room: ${room.id} with: ${JSON.stringify(room)}`);
      return of<void>(undefined);
    }),
    tap({
      complete: () => console.log("Rooms are done"),
    })
  )
  .subscribe();

setTimeout(function () {
  console.log("end");
}, 30000);
