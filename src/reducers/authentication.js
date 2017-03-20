/* eslint-disable no-param-reassign */
import Immutable from 'immutable'
import { REHYDRATE } from 'redux-persist/constants'
import { AUTHENTICATION, PROFILE } from '../constants/action_types'

export const initialState = Immutable.Map({
  accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJpc3MiOiJFbGxvLCBQQkMiLCJpYXQiOjE0OTAwMjQzMjIsImp0aSI6ImE1YzVlNWFmYTRiYTI2YjcxYTRiNjA2YTk5YzY1ZWVkIiwiZXhwIjoxNDkwMDMxNTIyLCJkYXRhIjp7ImlkIjo5LCJ1c2VybmFtZSI6IjY2NiIsImFuYWx5dGljc19pZCI6ImNjZDY5NDQ4MWVhZTQyNTJkMjc4YWE4YTEwOTJjNDVhMjE3OGQxMzQiLCJ3ZWJfb25ib2FyZGluZ192ZXJzaW9uIjoiMiIsImFsbG93c19hbmFseXRpY3MiOmZhbHNlLCJjcmVhdGVkX2F0IjoiMjAxNC0xMC0wM1QyMzowNzo0Ni44NDE5NTMwMDArMDAwMCIsImlzX3N0YWZmIjp0cnVlfX0.SsgzKfTjlBNCK_NvLCeYbwgdPeywMrBAXWzSdGRnOlRe_jem1m49cgzETALfeqHR8ovXKsLgxQd8YBKFqxTiyxJ9FoYEwRkAXEHqVhElf7yxBJkJGDtkpjfeonzttUt6r20BkZX8vaDpZLwlRz-y_Y2Dd_BkeDIsoCkboeiBo5BQT2av1HeiILo9tVaC-AgTlg49hiWkX6QjJmIc4eHuDA8iZ2902s8Oq5RTPHp4zUbkXQinTdpod4XNcBSofkCJDXn4Wnyp9yAn4oI1e9iOrfqSDz_L579IY9An_meE09kKuy8mzCM_zdSm07CySgDT8evvA5zZBu-HvBF1V946bg',
  createdAt: 1490024322,
  expirationDate: new Date('Mon Mar 20 2017 11:38:42 GMT-0600 (MDT)'),
  expiresIn: 7200,
  isLoggedIn: true,
  refreshToken: '3f2e50222c2db30d4c8dfa8aba9d5706cf56c0484bceab3b76df7fd915911097',
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

