# React Native Location Manager

A redux connected component to manage localization stuff: permission, settings and position state.


## Requirements

- react
- prop-types
- redux
- react-redux
- react-native
- reduxsauce
- seamless-immutable
- react-native-material-dialog
- react-native-settings
- react-native-permissions

Many of these packages come already when starting your project with [ignite](https://github.com/infinitered/ignite).

## Features

Tested with android simulator and real android device (xperia z3c)

- checks for location permission, prompts a dialog asking to authorize the app, if undetermined
- checks for location setting enabled, prompts a dialog asking to enable location, if disabled
- tries to get high accuracy position, with timeout configurable fallback on low accuracy (but high accuracy still running and updating later on if successful)
- manages maxAge (position cache) internally (can't rely on maxAge option param of react-native location methods)
- all texts are customizable
- callbacks can be defined in order to inform the user about what is going on under the hood

## Install

Using npm

    $ npm install --save react-native-location-manager

Ore yarn

    $ yarn add react-native-location-manager

### Additional setup

Some required packages need more setup actions:

  $ react-native link

Please, refer to packages repo pages for further instructions:

- [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons) (required by react-native-material-dialog)
- [react-native-permissions](https://github.com/yonahforst/react-native-permissions)
- [react-native-settings](https://github.com/rmrs/react-native-settings)

## Usage

Add the provided reducer:

    /* ------------- Assemble The Reducers ------------- */
    import { reducer as locationManagerReducer } from 'react-native-location-manager/Redux'
    export const reducers = combineReducers({
      // ...
      location: locationManagerReducer,
      // ...
    })

Inside a connected component

    import React, { Component } from 'react'
    import PropTypes from 'prop-types'
    import { connect } from 'react-redux' }
    import { View, Text } from 'react-native'
    import LocationManager from 'react-native-location-manager'

    class MyContainer extends Component () {
      static propTypes = {
        location: PropTypes.shape({
          permission: PropTypes.string,
          position: PropTypes.shape({
            latitude: PropTypes.number,
            longitude: PropTypes.number,
            timestamp: PropTypes.number
          }),
          stealthMode: PropTypes.bool
        })
      }

      render () {
        let position = this.props.location.position

        let myPositionText = position === null ? 'Position unknown' : `Lat: ${position.latitude}, Lng: ${position.longitude}`
        return (
          <View>
            <LocationManager />
            <Text>{myPositionText}</Text>
          </View>
        )
      }
    }

    const mapStateToProps = state => (
      return {
        location: state.location
      }
    )

    export default connect(mapStateToProps)(MyContainer)


## Full example

@TODO


## API

| Prop                       | Type     |      Default                                      |  Description     |
|----------------------------|----------|---------------------------------------------------|------------------|
| dialogTitle                | String   | Possiamo accedere alla tua posizione?             | Title of the modal dialog which pops up when the user has not given app permission to retrieve location, or location setting is disabled |
| dialogAuthorizeOkLabel     | String   | OK                                                | Label of the OK button when the dialog ask for location permission |
| dialogAuthorizeCancelLabel | String   | ANNULLA                                           | Label of the CANCEL button when the dialog ask for location permission |
| dialogAuthorizeText        | String   | Dai il permesso per rilevare la tua posizione?    | Dialog text when the dialog ask for location permission |
| dialogSettingsOkLabel      | String   | IMPOSTAZIONI                                      | Label of the OK button when the dialog ask to enable setting |
| dialogSettingsCancelLabel  | String   | NON VOGLIO                                        | Label of the CANCEL button when the dialog ask to enable setting |
| dialogSettingsText         | String   | Attivare la localizzazione?                       | Dialog text when the dialog ask to enable setting |
| deniedPermissionMessage    | Object   | <Text>Autorizzazione localizzazione negata</Text> | Node shown to inform the user that location authorization was denied (can't prompt the user for authorization again) |
| onPermissionDenied         | Function | () => {}                                          | Callback called when the user denies location permission to the app |
| maxAge                     | Number   | 30000                                             | Cache time for the position to be considered still valid |
| onLocationError            | Function | () => {}                                          | Callback called when the position cannot be retrieved |
| highAccuracyTimeout        | Number   | 10000                                             | Timeout fot the high accuracy request |
| onSearchHighAccuracy       | Function | () => {}                                          | Callback called when searching with high accuracy |
| onSuccessHighAccuracy      | Function | () => {}                                          | Callback called when high accuracy position is succesfully retrieved |
| onTimeoutHighAccuracy      | Function | () => {}                                          | Callback called when high accuracy request timeouts |
| onSearchLowAccuracy        | Function | () => {}                                          | Callback called when searching with low accuracy |
| onSuccessLowAccuracy       | Function | () => {}                                          | Callback called when low accuracy position is succesfully retrieved |
