import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View, Text } from 'react-native'
import { MaterialDialog } from 'react-native-material-dialog'
import Permissions from 'react-native-permissions'
import RNSettings from 'react-native-settings'
import locationActions from './Redux'
import { getLocation } from './Utils'

class LocationManagerContainer extends Component {
  static propTypes = {
    dialogTitle: PropTypes.string,
    dialogAuthorizeOkLabel: PropTypes.string,
    dialogAuthorizeCancelLabel: PropTypes.string,
    dialogAuthorizeText: PropTypes.string,
    dialogSettingsOkLabel: PropTypes.string,
    dialogSettingsCancelLabel: PropTypes.string,
    dialogSettingsText: PropTypes.string,
    deniedPermissionMessage: PropTypes.object,
    onPermissionDenied: PropTypes.func,
    maxAge: PropTypes.number,
    onLocationError: PropTypes.func,
    highAccuracyTimeout: PropTypes.number,
    onSearchHighAccuracy: PropTypes.func,
    onSuccessHighAccuracy: PropTypes.func,
    onTimeoutHighAccuracy: PropTypes.func,
    onSearchLowAccuracy: PropTypes.func,
    onSuccessLowAccuracy: PropTypes.func,
    // redux
    location: PropTypes.shape({
      permission: PropTypes.string,
      position: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        timestamp: PropTypes.number
      }),
      stealthMode: PropTypes.bool
    }),
    dispatch: PropTypes.func.isRequired
  }

  static defaultProps = {
    dialogTitle: 'Possiamo accedere alla tua posizione?',
    dialogAuthorizeOkLabel: 'OK',
    dialogAuthorizeCancelLabel: 'ANNULLA',
    dialogAuthorizeText: 'Dai il permesso per rilevare la tua posizione?',
    dialogSettingsOkLabel: 'IMPOSTAZIONI',
    dialogSettingsCancelLabel: 'NON VOGLIO',
    dialogSettingsText: 'Attivare la localizzazione?',
    deniedPermissionMessage: <Text>Autorizzazione localizzazione negata</Text>,
    onPermissionDenied: () => {},
    maxAge: 30 * 1000,
    onLocationError: () => {},
    highAccuracyTimeout: 10000,
    onSearchHighAccuracy: () => {},
    onSuccessHighAccuracy: () => {},
    onTimeoutHighAccuracy: () => {},
    onSearchLowAccuracy: () => {},
    onSuccessLowAccuracy: () => {}
  }

  constructor () {
    super()
    this.state = {
      showLocationDialog: false
    }
  }

  /**
   * Check for location permission
   */
  componentDidMount () {
    if (this.props.location.permission === null) {
      // don't know if permission was granted
      Permissions.check('location').then(
        response => {
          // response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
          console.log('LOCATION MANAGER', 'check location permission: ', response)
          // update store
          this.props.dispatch(locationActions.setLocationPermission(response))
          if (response === 'authorized') {
            // if authorized, check for location enabled
            this.checkLocationSetting()
          } else if (response === 'undetermined') {
            // else show a dialog informing the user
            this.setState({
              showLocationDialog: true
            })
          }
        },
        error => {
          // something went wrong
          console.log(error)
        }
      )
    } else if (this.props.location.permission === 'authorized') {
      // permission was granted => check for location enabled
      this.checkLocationSetting()
    }
  }

  render () {
    return (
      <View>
        {this.locationPermissionMessage()}
        {this.locationDialog()}
      </View>
    )
  }

  locationPermissionMessage () {
    let { permission } = this.props.location
    if (permission !== 'denied' && permission !== 'restricted') return null

    return this.props.deniedPermissionMessage
  }

  locationDialog () {
    // location settings dialog
    let locationDialog = (
      <MaterialDialog
        title={this.props.dialogTitle}
        visible={this.state.showLocationDialog}
        okLabel={
          this.props.location.permission === 'undetermined'
            ? this.props.dialogAuthorizeOkLabel
            : this.props.dialogSettingsOkLabel
        }
        onOk={() => {
          if (this.props.location.permission === 'undetermined') {
            this.requestLocationPermission()
          } else {
            this.openSettings()
          }
          this.setState({ showLocationDialog: false })
        }}
        cancelLabel={
          this.props.location.permission === 'undetermined'
            ? this.props.dialogAuthorizeCancelLabel
            : this.props.dialogSettingsCancelLabel
        }
        onCancel={() => {
          if (this.props.location.permission !== 'undetermined') {
            // user don't want  to share position
            this.props.dispatch(locationActions.setStealthMode(true))
          }
          this.setState({ showLocationDialog: false })
        }}
      >
        <Text>
          {
            this.props.location.permission === 'undetermined'
              ? this.props.dialogAuthorizeText
              : this.props.dialogSettingsText
          }
        </Text>
      </MaterialDialog>
    )

    return locationDialog
  }

  requestLocationPermission () {
    Permissions.request('location').then(response => {
      // returns once the user has chosen to 'allow' or to 'not allow' access
      // response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      console.log('LOCATION MANAGER', 'location permission request response: ', response)
      this.props.dispatch(locationActions.setLocationPermission(response))
      if (response === 'authorized') {
        this.checkLocationSetting()
      } else {
        this.props.onPermissionDenied()
      }
    })
  }

  checkLocationSetting () {
    RNSettings.getSetting(RNSettings.LOCATION_SETTING).then(result => {
      console.log('LOCATION MANAGER', 'settings check result: ', result)
      if (result === RNSettings.ENABLED) {
        this.getCurrentLocation()
      } else {
        if (!this.props.location.stealthMode) {
          this.setState({
            showLocationDialog: true
          })
        }
      }
    })
  }

  getCurrentLocation () {
    let { position } = this.props.location
    // should return cached value?
    if (position !== null && position.timestamp > Date.now() - this.props.maxAge) {
      console.log('LOCATION MANAGER', 'returning cached value')
      return position
    }
    getLocation(
      coords => {
        this.props.dispatch(locationActions.setPosition({
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: Date.now()
        }))
      },
      error => {
        this.props.onLocationError(error)
      },
      {
        timeout: this.props.highAccuracyTimeout
      },
      this.props.onSearchHighAccuracy,
      this.props.onSuccessHighAccuracy,
      this.props.onTimeoutHighAccuracy,
      this.props.onSearchLowAccuracy,
      this.props.onSuccessLowAccuracy
    )
  }

  openSettings () {
    RNSettings.openSetting(RNSettings.ACTION_LOCATION_SOURCE_SETTINGS).then(
      result => {
        if (result === RNSettings.ENABLED) {
          console.log('LOCATION MANAGER', 'user enables location settings')
          this.getCurrentLocation()
        }
      }
    )
  }
}

const mapStateToProps = state => {
  return {
    location: state.location
  }
}

const mapDispatchToProps = dispatch => {
  return {
    dispatch: (action) => dispatch(action)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationManagerContainer)
