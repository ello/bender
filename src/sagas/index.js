import { fork } from 'redux-saga/effects'
import analyticsSaga from './analytics'
import requesterSaga from './requester'
import uploaderSaga from './uploader'

export default function* root() {
  yield [
    fork(analyticsSaga),
    fork(requesterSaga),
    fork(uploaderSaga),
  ]
}
