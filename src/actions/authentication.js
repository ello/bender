import * as ENV from '../../env'
import { AUTHENTICATION } from '../constants/action_types'
import {
  loginToken,
  logout as logoutEndpoint,
  forgotPassword,
  refreshAuthToken,
} from '../networking/api'

const clientCredentials = {
  id: ENV.AUTH_CLIENT_ID,
}

export function clearAuthToken() {
  return {
    type: AUTHENTICATION.CLEAR_AUTH_TOKEN,
  }
}

export function getUserCredentials(email, password, meta) {
  return {
    type: AUTHENTICATION.USER,
    payload: {
      endpoint: loginToken(),
      method: 'POST',
      body: {
        email,
        password,
        grant_type: 'password',
        client_id: clientCredentials.id,
      },
    },
    meta,
  }
}

export function logout() {
  return {
    type: AUTHENTICATION.LOGOUT,
    payload: {
      endpoint: logoutEndpoint(),
      method: 'DELETE',
    },
  }
}

export function refreshAuthenticationToken(refreshToken) {
  return {
    type: AUTHENTICATION.REFRESH,
    payload: {
      endpoint: refreshAuthToken(refreshToken),
      method: 'POST',
      body: {
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_id: clientCredentials.id,
      },
    },
  }
}

export function sendForgotPasswordRequest(email) {
  return {
    type: AUTHENTICATION.FORGOT_PASSWORD,
    payload: {
      endpoint: forgotPassword(),
      method: 'POST',
      body: {
        email,
      },
    },
  }
}

export function signIn(email, password) {
  return {
    type: AUTHENTICATION.SIGN_IN,
    payload: {
      method: 'POST',
      email,
      password,
    },
  }
}

