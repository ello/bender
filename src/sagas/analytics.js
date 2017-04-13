/* eslint-disable no-constant-condition */
import { actionChannel, fork, put, select, take } from 'redux-saga/effects'
import { LOCATION_CHANGE } from 'react-router-redux'
import get from 'lodash/get'
import * as ACTION_TYPES from '../constants/action_types'
import { trackEvent as trackEventAction } from '../actions/analytics'
import { selectActiveNotificationsType } from '../selectors/gui'
import { selectAnalyticsId } from '../selectors/profile'
import { analytics as segment } from '../containers/AnalyticsContainer'

let shouldCallInitialTrackPage = false
const agent = 'android'

const pageTrackTypes = [
  ACTION_TYPES.GUI.NOTIFICATIONS_TAB,
  ACTION_TYPES.GUI.TOGGLE_NOTIFICATIONS,
  ACTION_TYPES.LOAD_NEXT_CONTENT_REQUEST,
  ACTION_TYPES.TRACK.INITIAL_PAGE,
  LOCATION_CHANGE,
]

function* trackEvent() {
  while (true) {
    const action = yield take(ACTION_TYPES.TRACK.EVENT)
    const { label, options } = action.payload
    if (segment) {
      const uid = yield select(selectAnalyticsId)
      segment.track({ userId: uid, event: label, properties: { agent, ...options } })
    }
  }
}

function* trackEvents() {
  while (true) {
    const action = yield take('*')
    const method = get(action, 'payload.method')
    switch (action.type) {
      case ACTION_TYPES.COMMENT.CREATE_REQUEST:
        return yield put(trackEventAction('published_comment'))
      case ACTION_TYPES.COMMENT.DELETE_REQUEST:
        return yield put(trackEventAction('deleted_comment'))
      case ACTION_TYPES.POST.DELETE_REQUEST:
        return yield put(trackEventAction('deleted_post'))
      case ACTION_TYPES.POST.LOVE_REQUEST:
        if (method === 'POST') {
          return yield put(trackEventAction('web_production.post_actions_love'))
        }
        break
      case ACTION_TYPES.POST.WATCH_REQUEST:
        if (method === 'DELETE') {
          return yield put(trackEventAction('unwatched-post'))
        }
        return yield put(trackEventAction('watched-post'))
      case ACTION_TYPES.POST.UPDATE_REQUEST:
        return yield put(trackEventAction('edited_post'))
      case ACTION_TYPES.PROFILE.DELETE_REQUEST:
        return yield put(trackEventAction('user-deleted-account'))
      case ACTION_TYPES.PROFILE.SIGNUP_SUCCESS:
        return yield put(trackEventAction('join-successful'))
      default:
        break
    }
  }
}

function* trackPage(pageTrackChannel) {
  while (true) {
    const action = yield take(pageTrackChannel)
    const pageProps = { agent }
    if ((action.type === ACTION_TYPES.LOCATION_CHANGE ||
      action.type === ACTION_TYPES.TRACK.INITIAL_PAGE) && window.segment) {
      shouldCallInitialTrackPage = true
    }
    if (action.type === ACTION_TYPES.GUI.NOTIFICATIONS_TAB) {
      pageProps.path = `/notifications/${get(action, 'payload.activeTabType', '')}`
    } else if (action.type === ACTION_TYPES.GUI.TOGGLE_NOTIFICATIONS) {
      const lastTabType = yield select(selectActiveNotificationsType)
      pageProps.path = `/notifications/${lastTabType === 'all' ? '' : lastTabType}`
    }
    if (shouldCallInitialTrackPage && segment) {
      const uid = yield select(selectAnalyticsId)
      segment.screen({ userId: uid, properties: pageProps })
    }
  }
}

export default function* analytics() {
  const pageTrackChannel = yield actionChannel(pageTrackTypes)
  yield [
    fork(trackEvent),
    fork(trackEvents),
    fork(trackPage, pageTrackChannel),
  ]
}

