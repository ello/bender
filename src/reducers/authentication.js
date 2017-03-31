/* eslint-disable no-param-reassign */
import Immutable from 'immutable'
import { REHYDRATE } from 'redux-persist/constants'
import { AUTHENTICATION, PROFILE } from '../constants/action_types'

export const initialState = Immutable.Map({
  accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJpc3MiOiJFbGxvLCBQQkMiLCJpYXQiOjE0OTEwMDI5ODAsImp0aSI6IjQwYjcyMzU3YTI0MDY4NDg4ZmRhYjAwMGRlNmQ5Y2EzIiwiZXhwIjoxNDkxMDEwMTgwLCJkYXRhIjp7ImlkIjoxLCJ1c2VybmFtZSI6InRlc3RqYXl6ZXMiLCJhbmFseXRpY3NfaWQiOiIxMWIwMjY1NTM0MTk0NjkwNGMzNmJkNmViNzVmOThkMzAyYzgyZThlIiwid2ViX29uYm9hcmRpbmdfdmVyc2lvbiI6IjIiLCJhbGxvd3NfYW5hbHl0aWNzIjp0cnVlLCJjcmVhdGVkX2F0IjoiMjAxNC0xMC0wMVQwNDoxMjowMy4yNjE0MTcwMDArMDAwMCIsImlzX3N0YWZmIjp0cnVlfX0.O6hbTxDbytljepPrr0LxQpmJ1nFNPW0OKP7omvUO0sgiYA0J7Ka5a7E_IVlFqBGgtBPvF93oqgSJHgPDGxQzLQhXaGf4H1ir4yBG5-GHP7_ezB1HYd2v_BxvtjpkwF_pWUUU-mOb5n2jRqHz4R4I6JKhE9ivgS1mWKKXcuoRIAoMYyXjShC_K0tNtF7qh4s2dQRNHZyfpxrhjkvlCJEun8ov5kIhShtzR3_CkmnlW_S_10B_VRs04obwnrg4y8_9h_siD8ZLHtBBnRzUpgPLuImflL8RundfYiL8QevRpkfiaBg8iTL0sqb76sOSb33Gi3ijeoK8u3PYLkknvU_Nvg',
  createdAt: 1491002980,
  expirationDate: new Date('Fri Mar 31 2017 19:29:40 GMT-0600 (MDT)'),
  expiresIn: 7200,
  isLoggedIn: true,
  refreshToken: '8bfa643ce1c4417c860d2ac6084d5385940bd30881227da27837a833127d7a07',
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
    case REHYDRATE:
      auth = action.payload.authentication
      if (typeof window !== 'undefined' && window.nonImmutableState && window.nonImmutableState.authentication) {
        auth = Immutable.fromJS(JSON.parse(window.nonImmutableState.authentication))
        delete window.nonImmutableState.authentication
      }
      if (auth) {
        return auth.set(
          'expirationDate', new Date((auth.get('createdAt') + auth.get('expiresIn')) * 1000),
        )
      }
      return state
    default:
      return state
  }
}

