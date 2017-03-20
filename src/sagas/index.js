import { fork } from 'redux-saga/effects'
import requesterSaga from './requester'
import uploaderSaga from './uploader'

export default function* root() {
  yield [
    fork(requesterSaga),
    fork(uploaderSaga),
  ]
}
