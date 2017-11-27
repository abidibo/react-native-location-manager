import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  setLocationPermission: ['permission'],
  setPosition: ['position'],
  setStealthMode: ['stealthMode']
})

export const LocationTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  permission: null,
  position: null,
  stealthMode: false
})

/* ------------- Reducers ------------- */

export const locationPermission = (state, { permission }) =>
  state.merge({ permission })

export const position = (state, { position }) =>
  state.merge({ position })

export const stealthMode = (state, { stealthMode }) =>
  state.merge({ stealthMode })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_LOCATION_PERMISSION]: locationPermission,
  [Types.SET_POSITION]: position,
  [Types.SET_STEALTH_MODE]: stealthMode
})
