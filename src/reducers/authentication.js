/* eslint-disable no-param-reassign */
import Immutable from 'immutable'
import { AUTHENTICATION, PROFILE } from '../constants/action_types'

export const initialState = Immutable.Map({
  accessToken: '***REMOVED***',
  createdAt: 1490024322,
  expirationDate: new Date('Mon Mar 20 2017 11:38:42 GMT-0600 (MDT)'),
  expiresIn: 7200,
  isLoggedIn: true,
  refreshToken: '***REMOVED***',
  tokenType: 'bearer',
})

export default (state = initialState, action) => {
  let auth
  switch (action.type) {
    case AUTHENTICATION.CLEAR_AUTH_TOKEN:
      return state.delete('accessToken').delete('expirationDate').delete('expiresIn')
    case AUTHENTICATION.LOGOUT_SUCCESS:
    case AUTHENTICATION.LOGOUT_FAILURE:
    case AUTHENTICATION.REFRESH_FAILURE:
    case PROFILE.DELETE_SUCCESS:
      return initialState
    case AUTHENTICATION.USER_SUCCESS:
    case AUTHENTICATION.REFRESH_SUCCESS:
    case PROFILE.SIGNUP_SUCCESS:
      auth = action.payload.response
      return state.merge({
        ...auth,
        expirationDate: new Date((auth.createdAt + auth.expiresIn) * 1000),
        isLoggedIn: true,
      })
    default:
      return state
  }
}

