/* eslint-disable no-constant-condition */
import get from 'lodash/get'
import { camelizeKeys } from 'humps'
import {
  actionChannel,
  call,
  fork,
  put,
  select,
  take,
} from 'redux-saga/effects'

import { AUTHENTICATION, EDITOR, PROFILE } from '../constants/action_types'

import { fetchCredentials, getHeaders, sagaFetch } from './api'
import { s3CredentialsPath } from '../networking/api'

import { temporaryEditorAssetCreated } from '../actions/editor'
import {
  imageGuid,
  // isValidFileType,
  // processImage,
  // SUPPORTED_IMAGE_TYPES,
} from '../helpers/file_helper'

const uploadTypes = [
  PROFILE.SAVE_AVATAR,
  PROFILE.SAVE_COVER,
  EDITOR.SAVE_ASSET,
]

export function* fetchS3Credentials(accessToken) {
  const response = yield call(sagaFetch, s3CredentialsPath().path, {
    method: 'GET',
    headers: getHeaders(accessToken),
  })
  return response.json
}

function getFilename(type) {
  return `ello-${imageGuid() + type.replace('image/', '.')}`
}

function getFileKey(prefix, filename) {
  return `${prefix}/${encodeURIComponent(filename)}`
}

function getAssetUrl(endpoint, key) {
  return `${endpoint}/${key}`
}

function getUploadData(key, credentials, file, fileData) {
  const data = new FormData()
  data.append('key', key)
  data.append('AWSAccessKeyId', credentials.access_key)
  data.append('acl', 'public-read')
  data.append('success_action_status', '201')
  data.append('policy', credentials.policy)
  data.append('signature', credentials.signature)
  data.append('Content-Type', 'multipart/form-data')
  data.append('file', fileData || { uri: file, name: 'image.jpg', type: 'image/jpg' })
  return data
}

function* performUpload(action) {
  const { payload, type, meta } = action
  const { editorId, endpoint, file, height, width } = payload
  const REQUEST = `${type}_REQUEST`
  const SUCCESS = `${type}_SUCCESS`
  const FAILURE = `${type}_FAILURE`
  let tokenJSON = null
  if (action.type === AUTHENTICATION.REFRESH) {
    // access token not needed for refreshing the existing token.
    // This shortcuts a request to get a public token.
    tokenJSON = { token: { access_token: null } }
  } else {
    tokenJSON = yield call(fetchCredentials)
  }
  const accessToken = get(tokenJSON, 'token.access_token')
  let assetUrl
  let uid

  function* postAsset(credentials, fileData) {
    const filename = getFilename(`.${file.split('.').pop()}`)
    const { prefix, endpoint: assetEndpoint } = credentials
    const key = getFileKey(prefix, filename)
    assetUrl = getAssetUrl(assetEndpoint, key)

    const response = yield call(sagaFetch, assetEndpoint, {
      method: 'POST',
      body: getUploadData(key, credentials, file, fileData),
    })
    const { serverResponse } = response
    return serverResponse
  }


  // Dispatch start of request
  yield put({ type: REQUEST, payload, meta })

  try {
    // const fileData = yield call(isValidFileType, file)
    // yield call(popAlertsForFile, fileData, action)
    // TODO: add max width/height for avatars
    // TODO: figure out a cool way to display the initial image before processing
    // const objectURL = URL.createObjectURL(file)
    // const objectURL = file
    // if (fileData.fileType === SUPPORTED_IMAGE_TYPES.GIF) {
    //   if (type === EDITOR.SAVE_ASSET) {
    //     const { editorId } = payload
    //     yield put(temporaryEditorAssetCreated(objectURL, editorId))
    //     uid = yield select(state => state.editor.getIn([editorId, 'uid']) - 2)
    //   } else if (type === PROFILE.SAVE_AVATAR) {
    //     yield put(temporaryAssetCreated(PROFILE.TMP_AVATAR_CREATED, objectURL))
    //   } else if (type === PROFILE.SAVE_COVER) {
    //     yield put(temporaryAssetCreated(PROFILE.TMP_COVER_CREATED, objectURL))
    //   }
    //   const { credentials } = yield call(fetchS3Credentials, accessToken)
    //   yield call(postAsset, credentials)
    // } else {
    // const imageData = yield call(processImage, { ...fileData, file: objectURL })
    if (type === EDITOR.SAVE_ASSET) {
      const { editorId } = payload
      yield put(temporaryEditorAssetCreated(file, editorId))
      // The - 2 should always be consistent. The reason is that when a tmp image
      // gets created at say uid 1 an additional text block is added to the bottom
      // of the editor at uid 2 and the uid of the editor is now sitting at 3
      // since it gets incremented after a block is added. So the - 2 gets us from
      // the 3 back to the 1 where the image should reconcile back to.
      uid = yield select(state => state.editor.getIn([editorId, 'uid']) - 2)
    }
    const { credentials } = yield call(fetchS3Credentials, accessToken)
    yield call(postAsset, credentials)
    // }

    // this should only happen when adding assets to an editor
    // on the page since we don't hit the API directly for that
    if (!endpoint) {
      payload.response = { url: assetUrl }
      payload.uid = uid
      yield put({ meta, payload, type: SUCCESS })
      return
    }

    // the rest of the below should only happen when uploading
    // avatars and cover images as they need to save to our API
    // profile after successful upload to s3
    const saveLocationToApi = function* saveLocationToApi() {
      const vo = (type === PROFILE.SAVE_AVATAR) ?
            { remote_avatar_url: assetUrl } :
            { remote_cover_image_url: assetUrl }
      const response = yield call(sagaFetch, endpoint.path, {
        method: 'PATCH',
        headers: getHeaders(accessToken),
        body: JSON.stringify(vo),
      })
      return response.json
    }
    const response = yield call(saveLocationToApi)
    payload.response = camelizeKeys(response)
    yield put({ meta, payload, type: SUCCESS })
  } catch (error) {
    yield put({ error, meta, payload, type: FAILURE })
  }
}

function* handleUpload(uploadChannel) {
  while (true) {
    const action = yield take(uploadChannel)
    yield fork(performUpload, action)
  }
}

export default function* uploader() {
  const uploadChannel = yield actionChannel(uploadTypes)
  yield [
    fork(handleUpload, uploadChannel),
  ]
}

