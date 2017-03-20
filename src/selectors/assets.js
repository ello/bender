import Immutable from 'immutable'
import get from 'lodash/get'
import { ASSETS } from '../constants/mapping_types'

// state.json.assets.xxx
export const selectAssets = state => state.json.get(ASSETS, Immutable.Map())

// Requires `assetId` to be found in props...
export const selectAsset = (state, props) =>
  state.json.getIn([ASSETS, get(props, 'assetId')], Immutable.Map())

// Memoized selectors

