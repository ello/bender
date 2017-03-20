/* eslint-disable no-underscore-dangle */
import { combineReducers, compose, createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import { autoRehydrate } from 'redux-persist'
import createSagaMiddleware, { END } from 'redux-saga'
import * as reducers from './reducers'
import rootSaga from './sagas'

const reducer = combineReducers({
  ...reducers,
})

const createNativeAppStore = (initialState = {}) => {
  const logConfig = {
    collapsed: true,
  }
  logConfig.stateTransformer = (state) => {
    const newState = {}
    Object.keys(state).forEach((key) => {
      newState[key] = state[key].toJS()
    })
    return newState
  }
  const logger = createLogger(logConfig)
  const sagaMiddleware = createSagaMiddleware()

  const store = compose(
    autoRehydrate(),
    applyMiddleware(
      sagaMiddleware,
      logger,
    ),
  )(createStore)(reducer, initialState)
  store.close = () => store.dispatch(END)

  store.sagaTask = sagaMiddleware.run(rootSaga)
  return store
}

export { createNativeAppStore }

export default createNativeAppStore()

