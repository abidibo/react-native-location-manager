export function distance (lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295 // Math.PI / 180
  var c = Math.cos
  var a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2

  return 12742 * Math.asin(Math.sqrt(a)) // 2 * R; R = 6371 km
}

/**
 * Gets user position
 *
 * When called without highAccuracy option, or with highAccuracy option set to true
 * it uses watchPosition (because getCurrentPosition returns always a cached value)
 * even if maxAge is set to 0 or unset.
 * With highAccuracy set to false it uses getCurrentPosition
 *
 * When called with highAccuracy true, a fake timeout is implemented, when reached
 * a new attempt is done with highAccuracy set to false
 *
 * @param {Function} onSuccess Success callback
 * @param {Function} onError Error callback
 * @param {Object} options Options
 * @param {Boolean} options.timeout highAccuracy timeut
 * @param {Function} onSearchHighAccuracy function called when requesting high accuracy position
 * @param {Function} onSuccessHighAccuracy function called when high accuracy position is retrieved
 * @param {Function} onTimeoutHighAccuracy function called when high accuracy request timeouts
 * @param {Function} onSearchLowAccuracy function called when requesting low accuracy position
 * @param {Function} onSuccessLowAccuracy function called when low accuracy position is retrieved
 */
export function getLocation (
  onSuccess,
  onError,
  options,
  // wanna display messages?
  onSearchHighAccuracy = () => {},
  onSuccessHighAccuracy = () => {},
  onTimeoutHighAccuracy = () => {},
  onSearchLowAccuracy = () => {},
  onSuccessLowAccuracy = () => {}
) {
  let highAccuracySuccess = false
  let highAccuracyError = false
  let timeout =
    !options || options.timeout === undefined ? 10000 : options.timeout

  let _getLowAccuracyPosition = () => {
    console.log('LOCATION MANAGER', 'requesting low accuracy position')
    onSearchLowAccuracy()
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('LOCATION MANAGER', 'LOW accuracy position success: ', position)
        onSuccessLowAccuracy()
        onSuccess(position.coords)
      },
      error => {
        onError(error)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maxAge: 0
      }
    )
  }

  console.log('LOCATION MANAGER', 'requesting high accuracy position, timeout: ' + timeout)
  onSearchHighAccuracy()
  const watchId = navigator.geolocation.watchPosition(
    position => {
      // location retrieved
      console.log('LOCATION MANAGER', 'HIGH accuracy position success: ', position)
      highAccuracySuccess = true
      navigator.geolocation.clearWatch(watchId)
      onSuccessHighAccuracy()
      onSuccess(position.coords)
    },
    error => {
      // location cannot be retrieved => show dialog
      console.log(error)
      highAccuracyError = true
      navigator.geolocation.clearWatch(watchId)
      _getLowAccuracyPosition()
    },
    {
      enableHighAccuracy: true,
      timeout: timeout,
      maxAge: 0,
      distanceFilter: 1
    }
  )

  setTimeout(() => {
    if (!highAccuracySuccess && !highAccuracyError) {
      console.log('LOCATION MANAGER', 'HIGH accuracy timeout')
      onTimeoutHighAccuracy()
      _getLowAccuracyPosition()
    }
  }, timeout)
}
