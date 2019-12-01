# Changelog
All notable changes to this project will be documented in this file.

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