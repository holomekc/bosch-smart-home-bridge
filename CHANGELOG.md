# Changelog
All notable changes to this project will be documented in this file.

## [1.3.5] - 2023-12-01
### Fixed
- Fix setting user defined data

## [1.3.4] - 2023-12-01
### Fixed
- Change user defined states signature

## [1.3.3] - 2023-12-01
### Changed
- Change user defined states signature

## [1.3.2] - 2023-11-30
### Added
- User defined states support added

## [1.3.1] - 2023-11-22
### Changed
- fix build, because I forgot what I am doing here... I need to add GitHub actions...

## [1.3.0] - 2023-11-22
### Changed
- update dependencies
- remove types for selfsigned, which provides its own definition already
- Remove ClientDefinition, because of types removal. This might be a breaking change

## [1.2.2] - 2023-04-22
### Changed
- changed to newer ECMA Script version
- more details in errors

## [1.2.1] - 2023-04-22
### Fixed
- fix issue with activating a climate schedule

## [1.2.0] - 2023-04-22
### Changed
- Update to api-version 3.2 of BSHC
### Added
- Climate apis for templates and schedules

## [1.1.8] - 2023-02-04
### Added
- More feedback why pairing failed.
### Fixed
- issue with uuid generation.

## [1.1.7] - 2023-01-27
### Added
- Allow to ignore server certificate check. Although this is insecure. It allows users to skip the check in case the root ca is expiring. Everything is local so less critical. 

## [1.1.6] - 2022-10-02
### Added
- Allow to request a specific room

## [1.1.5] - 2022-10-02
### Changed
- Handle HTTP status codes >= 300 as errors

## [1.1.4] - 2022-10-02
### Fixed
- Updating motion lights 

## [1.1.3] - 2022-10-02
### Fixed
- npm publishing bug

## [1.1.2] - 2022-10-01
### Fixed
- npm build

## [1.1.1] - 2022-10-01
### Changed
- Remove id from update water alarm

## [1.1.0] - 2022-10-01
### Added
- New services:
    - Water alarm
    - Air purity
    - Motion lights

### Changed
- Update rxjs usage due to deprecation

## [1.0.4] - 2021-08-28
### Changed
- Update dependencies due to vulnerabilities

## [1.0.3] - 2021-08-28
### Changed
- fix options for IntrusionDetectionSystem...

## [1.0.2] - 2021-08-28
### Changed
- Update dependencies.

## [1.0.1] - 2021-08-28
### Changed
- allow setting options for IntrusionDetectionSystem. The parameter is optional and backward compatible.

## [1.0.0] - 2021-08-28
### Changed
- Update dependencies.
- Breaking changes in rx.js may occur due to update from 6 -> 7.

## [0.2.15] - 2021-01-31
### Added
- Update to api-version 2.1

## [0.2.14] - 2020-11-21
### Changed
- Update dependencies

## [0.2.13] - 2020-11-21
### Changed
- Polling errors implement Error
- Delay for polling timeout used as connection timeout can be set

## [0.2.12] - 2020-04-01
### Fixed
- fixed npm

## [0.2.11] - 2020-04-01
### Added
- add missing response types

## [0.2.10] - 2020-04-01
### Added
- open doors/windows method

## [0.2.9] - 2020-03-29
### Fixed
- fix error in getDevices method where undefined was mistakenly specified as string

## [0.2.8] - 2020-03-29
### Added
- add options to nearly every client methods to provide more flexibility.

## [0.2.7] - 2020-01-18
### Added
- get / delete messages added

## [0.2.6] - 2020-01-12
### Changed
- activate server verification. Root ca is part of library now.
- hostname verification modified so that it does not fail due to altname

## [0.2.5] - 2020-01-06
### Changed
- adjust error handling so that errors are not handled multiple times.

## [0.2.4] - 2020-01-06
### Changed
- adjust client certificate generation
- improved error handling
- workaround for stuck http request and BSHC restart. Especially for long polling
- adjust test and documentation

### Removed
- remove mac from polling which is not needed
- remove identifier from certificate generation

## [0.2.3] - 2019-12-01
### Changed
- typescript export of relevant classes improved

## [0.2.2] - 2019-12-01
### Fixed
- fixed issue with npm resources are not updated correctly

### Changed
- test is not part of dist anymore. But is placed in distTest instead

## [0.2.1] - 2019-12-01
### Fixed
- fixed issue with npm resources are not updated correctly

## [0.2.0] - 2019-12-01
### Added
- utils class to help with certificate and identifier generation
- changelog

### Changed
- certificate generation is not part of pairing process anymore. Private key and certificate needs to be provided
- builder pattern use to create BoschSmartHomeBridge
- error details during process improved
- identifier only needed for pairing process

## [0.1.0] - 2019-11-27
### Changed
- response is wrapped into BshbResponse. Which provides data as before but also details about the HTTP request / response
- certificate generation only triggered by pairIfNeeded method and not by all other methods

## [0.0.6] - 2019-10-25
### Added
- support for scenarios added
- added more predefined methods to client (scenarios, presence, alarm)

## [0.0.5] - 2019-10-25
### Changed
- add OSS prefix to id and name of client

## [0.0.4] - 2019-10-21
### Added
- initial implementation

### Changed
- adjust client data to ROLE_RESTRICTED_CLIENT

### Removed
- not needed client data