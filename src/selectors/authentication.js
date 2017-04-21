// state.authentication.xxx
export const selectAccessToken = state => state.authentication.get('accessToken')
export const selectExpirationDate = state => new Date(state.authentication.get('expirationDate', new Date()))
export const selectIsLoggedIn = state => state.authentication.get('isLoggedIn')
export const selectRefreshToken = state => state.authentication.get('refreshToken')

// Memoized selectors
export const selectShouldUseAccessToken = (state) => {
  const accessToken = selectAccessToken(state)
  const expDate = selectExpirationDate(state)
  return accessToken && expDate > new Date()
}

export const selectShouldUseRefreshToken = (state) => {
  const accessToken = selectAccessToken(state)
  const expDate = selectExpirationDate(state)
  const isLoggedIn = selectIsLoggedIn(state)
  return isLoggedIn && accessToken && !(expDate > new Date())
}

