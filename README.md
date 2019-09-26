![Logo](resources/bshb-logo.jpg)
# bosch-smart-home-bridge
Allows communication to Bosch Smart Home Controller (BSHC)

[Bosch Smart Home Controller](https://www.bosch-smarthome.com/de/de/produkte/smart-system-solutions/smart-home-controller)

[![NPM](https://nodei.co/npm/bosch-smart-home-bridge.png)](https://nodei.co/npm/bosch-smart-home-bridge/)

## Getting started

You need to create a new instance of BoschSmartHomeBridge (BSHB). Therefore, you need:
* host name / ip address of BSHC
* a unique identifier for the new client (uuid is ok but can be any string)
* name of the client
* absolute path to a directory where client certificates are located or will be generated to
* a logger which implements the interface which is defined in this library
```typescript
const bshb = new BoschSmartHomeBridge('192.168.0.10', '0fdbe4b9-5580-49f6-9f86-c8a9bfa5ae71', 'bosch-smart-home-bridge', '/absolute/path', new DefaultLogger());
```

## Pairing
Then you need to start the pairing process. Therefore, you need:
* system password of BSHC
```typescript
bshb.pairDeviceIfNeeded('systemPassword');
```

## Communication
After that you cann use BSHB to communicate with BSHC. Just use:
```typescript
bshb.getBshcClient()
```

which provides some methods for communication

