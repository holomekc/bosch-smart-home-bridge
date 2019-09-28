![Logo](resources/bshb-logo.jpg)

[![NPM version](http://img.shields.io/npm/v/bosch-smart-home-bridge.svg)](https://www.npmjs.com/package/bosch-smart-home-bridge)
[![Downloads](https://img.shields.io/npm/dm/bosch-smart-home-bridge.svg)](https://www.npmjs.com/package/bosch-smart-home-bridge)
[![Dependency Status](https://david-dm.org/holomekc/bosch-smart-home-bridge.svg)](https://david-dm.org/holomekc/bosch-smart-home-bridge)
[![Known Vulnerabilities](https://snyk.io/test/github/holomekc/bosch-smart-home-bridge/badge.svg)](https://snyk.io/test/github/holomekc/bosch-smart-home-bridge)

[![NPM](https://nodei.co/npm/bosch-smart-home-bridge.png)](https://nodei.co/npm/bosch-smart-home-bridge/)
# bosch-smart-home-bridge
Allows communication to Bosch Smart Home Controller (BSHC)

[Bosch Smart Home Controller](https://www.bosch-smarthome.com/de/de/produkte/smart-system-solutions/smart-home-controller)

## Getting started

You need to create a new instance of BoschSmartHomeBridge (BSHB). Therefore, you need:
* host name / ip address of BSHC
* a unique identifier for the new client (uuid is ok but can be any string)
* absolute path to a directory where client certificates are located or will be generated to
* a logger which implements the interface which is defined in this library
```typescript
const bshb = new BoschSmartHomeBridge('192.168.0.10', 
                                      '0fdbe4b9-5580-49f6-9f86-c8a9bfa5ae71',
                                      '/absolute/path', new DefaultLogger());
```

## Pairing
Then you need to start the pairing process. Therefore, you need:
* name of the client
* system password of BSHC
```typescript
bshb.pairDeviceIfNeeded('name', 'systemPassword');
```

## Communication
After that you can use BSHB to communicate with BSHC. Therefore, just use the provided client which provides
some helpful methods:
```typescript
bshb.getBshcClient()
```

## Long Polling
If you are interested in updates from bshc you can use long polling. Therefore, you need to do the following:

```typescript
const mac = 'xx-xx-xx-xx-xx-xx';

bshb.getBshcClient().subscribe(mac).subscribe(result => {
        bshb.getBshcClient().longPolling(mac, result.result).subscribe(info => {
            // do something with the information
            // also you need to call longPolling again after connection close
        });
    });
```

Do not forget to unsubscribe. E.g. in error case or on application end.
```typescript
bshb.getBshcClient().unsubscribe(mac, result.result).subscribe(() => {
                });
```
